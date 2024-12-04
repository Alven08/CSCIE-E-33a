from sqlite3 import IntegrityError

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse

from AmazPocket.models import User, Category, Product, Wishlist, WishlistItem
from AmazPocket.forms import ProductForm

# Create your views here.
def index(request):
    return render(request, "AmazPocket/index.html")


def load_products(request):
    # Get start and end points
    start = int(request.GET.get("start") or 0)
    end = int(request.GET.get("end") or (start + 9))
    cat_id = int(request.GET.get("cat-id") or -1)
    wish_id = int(request.GET.get("wish-id") or -1)

    if cat_id != -1:
        category = Category.objects.get(pk=cat_id)
        cat_products = (category.products.filter(is_active=True, in_stock_quantity__gt=0)
                        .order_by("-created_date").all())
        products = [product.serialize() for product in cat_products[start:end]]
    elif wish_id != -1:
        wishlist = Wishlist.objects.get(pk=wish_id, user=request.user)
        wish_products = wishlist.items.all()
        products = [product.serialize() for product in wish_products[start:end]]
    else:
        all_products = Product.objects.filter(is_active=True, in_stock_quantity__gt=0).order_by("-created_date").all()
        products = [product.serialize() for product in all_products[start:end]]

    return JsonResponse({
        "products": products
    })


def login_view(request):
    if request.method == 'POST':

        # Attempt to sign user in
        email = request.POST["email"]
        password = request.POST["password"]
        user = authenticate(request, username=email, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "AmazPocket/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "AmazPocket/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "AmazPocket/register.html",
                          {"message": "Passwords must match."})

        firstname = request.POST["firstname"]
        lastname = request.POST["lastname"]
        email = request.POST["email"]
        vendor_name = None
        is_vendor = False
        if "vendor" in request.POST:
            is_vendor = True
            vendor_name = request.POST["vendor_name"]

        try:
            user = User.objects.create_user(first_name=firstname, last_name=lastname,
                                            email=email, username=email, password=password,
                                            is_vendor=is_vendor, vendor_name=vendor_name)
        except IntegrityError:
            return render(request, "AmazPocket/register.html",
                          {"message": "Username already taken."})

        login(request, user)
        # TODO redirect to vendor page if it is a vendor.
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "AmazPocket/register.html")


def profile(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("index"))

    user = User.objects.get(pk=request.user.id)
    title = "Vendor page" if user.is_vendor else "Profile"
    products = None
    orders = None
    new_product_form = None
    if user.is_vendor:
        products = [product.serialize() for product in user.products.order_by("-created_date").all()]
        new_product_form = ProductForm()
    else:
        orders = [order.serialize() for order in user.orders.all()]

    return render(request, "AmazPocket/profile.html", {
        "profile": user.serialize(),
        "title": title,
        "products": products,
        "orders": orders,
        "form": new_product_form
    })


# for when normal user goes to a vendor page
def vendor_page(request, vendor_id):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("index"))

    user = User.objects.get(pk=vendor_id)

    return render(request, "AmazPocket/vendor.html", {
        "vendor": user.serialize()
    })


def categories(request):
    all_cats = Category.objects.filter(is_active=True)
    return render(request, "AmazPocket/categories.html", {
            "title": "Categories",
            "categories": all_cats
        })


def category_products(request, category_id):
    category = Category.objects.get(pk=category_id)
    return render(request, "AmazPocket/index.html", {
            "title": "Category: %s" % category,
            "cat_id": category.id
        })


def product(request, product_id=None):
    if request.method == "GET":
        product_item = Product.objects.get(pk=product_id)
        # current_user_lists = get_user_wishlists(request)
        return JsonResponse({
            "form": product_item.serialize(),
            # "user_wishlists": current_user_lists
        }, status=200)

    elif request.method == "POST":
        if product_id is not None:
            current_product = get_object_or_404(Product, pk=product_id, vendor=request.user)
            product_form = ProductForm(request.POST, instance=current_product)
        else:
            product_form = ProductForm(request.POST)

        if product_form.is_valid():
            product_obj = product_form.save(commit=False)

            if not hasattr(product_obj, "vendor"):
                product_obj.vendor = request.user

            if product_obj.img_url is None:
                # default image if no image url is provided
                product_obj.img_url = (
                    "https://encrypted-tbn0.gstatic.com/images"
                    "?q=tbn:ANd9GcQOtjqFKVwZWNCqI33H1OWcsUaZYww6FLLFAw&s"
                )

            product_obj.save()
            return HttpResponseRedirect(reverse("profile"))
        else:
            product_form = ProductForm(request.POST)
            return JsonResponse({
                "form": product_form
            }, status=400)
    else:
        product_form = ProductForm()
        return JsonResponse({
            "form": product_form
        }, status=200)


def delete_product(request, product_id):
    # For some reason pycharm does not support delete in HTML
    if request.method == "POST":
        try:
            to_be_deleted = get_object_or_404(Product, id=product_id, vendor=request.user)
            to_be_deleted.delete()
            return HttpResponseRedirect(reverse("profile"))
        except Product.DoesNotExist:
            return JsonResponse({
                "error": "Product to be deleted does not exist."
            }, status=404)


def get_user_wishlists(request):
    wishlists = Wishlist.objects.filter(user=request.user).all()
    lists = [list.serialize() for list in wishlists]
    return JsonResponse({"wishlist": lists}, status=200)


def wishlist(request, wishlist_id=None):
    if request.method == "GET":
        list = get_object_or_404(Wishlist, id=wishlist_id)
        return render(request, "AmazPocket/index.html", {
            "title": "Wishlist: %s" % list,
            "wish_id": list.id
        })
    else:
        name = request.POST.get("name")
        if name:
            new_list = Wishlist.objects.create(name=name, user=request.user)
            return get_user_wishlists(request)


def delete_wishlist(request, wishlist_id):
    # For some reason pycharm does not support delete in HTML
    if request.method == "POST":
        try:
            to_be_deleted = get_object_or_404(Wishlist, id=wishlist_id, vendor=request.user)
            to_be_deleted.delete()
            return JsonResponse({ "success": True }, status=200)
        except Product.DoesNotExist:
            return JsonResponse({
                "error": "Wishlist does not exist."
            }, status=404)


def add_to_wishlist(request, wishlist_id, product_id):
    if request.method == "POST":
        product = get_object_or_404(Product, id=product_id)
        wishlist = get_object_or_404(Wishlist, id=wishlist_id)

        item, created = (WishlistItem.objects
                         .get_or_create(Wishlist=wishlist, product=product))

        return JsonResponse({ "success": True }, status=200)