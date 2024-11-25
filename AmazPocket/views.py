from sqlite3 import IntegrityError

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse

from AmazPocket.models import User, Category, Product
from AmazPocket.forms import ProductForm

# Create your views here.
def index(request):
    return render(request, "AmazPocket/index.html")


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
    user = User.objects.get(pk=request.user.id)
    title = "Vendor page" if user.is_vendor else "Profile"
    products = None
    orders = None
    new_product_form = None
    if user.is_vendor:
        products = [product.serialize() for product in user.products.all()]
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


def vendor_page(request, vendor_id):
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
    cat_products = category.products.filter(is_active=True)
    products = [product.serialize() for product in cat_products]
    return render(request, "AmazPocket/categories.html", {
            "title": "Category: %s" % category,
            "products": products
        })


def add_update_product(request):
    if request.method == "POST" or request.method == "PUT":
        product_form = ProductForm(request.POST)

        if product_form.is_valid():
            new_product = product_form.save(commit=False)
            new_product.vendor = request.user

            if new_product.img_url is None:
                # default image if no image url is provided
                new_product.img_url = (
                    "https://encrypted-tbn0.gstatic.com/images"
                    "?q=tbn:ANd9GcQOtjqFKVwZWNCqI33H1OWcsUaZYww6FLLFAw&s"
                )
                new_product.save()
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


def delete_product(request, id):
    if request.method == "DELETE":
        try:
            to_be_deleted = get_object_or_404(Product, id=id, vendor=request.user)
            to_be_deleted.delete()
            return HttpResponseRedirect(reverse("profile"))
        except Product.DoesNotExist:
            return JsonResponse({
                "error": "Product to be deleted does not exist."
            }, status=404)


