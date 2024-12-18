from decimal import Decimal
from sqlite3 import IntegrityError

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render, get_object_or_404
from django.urls import reverse

from AmazPocket.models import (User, Category, Product, Wishlist,
                               WishlistItem, Cart, CartItem, Order, OrderItem)
from AmazPocket.forms import ProductForm, OrderDetailForm


# Create your views here.
def index(request):
    return render(request, "AmazPocket/index.html")


def load_products(request):
    """
    Return list of products in order by created date descending
    """

    # Get start and end points
    # Also get the parameters to load the products
    # The parameters could be:
    # - The category id
    # - The wishlist id
    # - The search criteria
    start = int(request.GET.get("start") or 0)
    end = int(request.GET.get("end") or (start + 9))
    cat_id = int(request.GET.get("cat-id") or -1)
    wish_id = int(request.GET.get("wish-id") or -1)
    search_criteria = request.GET.get("criteria")

    if cat_id != -1:
        # If the category id is no -1 then pull all the products
        # from the category in question
        category = Category.objects.get(pk=cat_id)
        cat_products = (category.products.filter(is_active=True,
                                                 in_stock_quantity__gt=0)
                        .order_by("-created_date").all())
        products = [product.serialize() for product in cat_products[start:end]]
    elif wish_id != -1:
        # If the wishlist id is no -1 then pull all the products
        # from the wishlist in question
        wishlist = Wishlist.objects.get(pk=wish_id, user=request.user)
        wish_products = wishlist.items.all()
        products = [product.product.serialize() for
                    product in wish_products[start:end]]
    elif search_criteria:
        # If the search criteria is not an empty string
        # return all the products that contain the search criteria
        search_products = \
            (Product.objects.filter(is_active=True,
                                    in_stock_quantity__gt=0,
                                    name__contains=search_criteria)
             .order_by("-created_date").all())
        products = [product.serialize() for
                    product in search_products[start:end]]
    else:
        # Else, return all the existing products
        all_products = (Product.objects.filter(is_active=True,
                                               in_stock_quantity__gt=0)
                        .order_by("-created_date").all())
        products = [product.serialize() for product in all_products[start:end]]

    return JsonResponse({
        "products": products
    })


def load_vendor_products(request):
    """
    Return list of products own by the authenticated vendor
    """

    # Get start and end points
    start = int(request.GET.get("start") or 0)
    end = int(request.GET.get("end") or (start + 9))

    all_products = (Product.objects.filter(vendor=request.user,
                                           is_active=True)
                    .order_by("-created_date").all())
    products = [single_product.serialize()
                for single_product in all_products[start:end]]

    return JsonResponse({
        "products": products
    })


def login_view(request):
    """
    Log in or load log in page
    """
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
    """
    Log out
    """
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    """
    Register new user or load registration page.
    Email is used as the username
    """
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

            user = User.objects.create_user(first_name=firstname,
                                            last_name=lastname,
                                            email=email, username=email,
                                            password=password,
                                            is_vendor=is_vendor,
                                            vendor_name=vendor_name)
        except IntegrityError:
            return render(request, "AmazPocket/register.html",
                          {"message": "Username already taken."})

        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "AmazPocket/register.html")


def profile(request):
    """
    Load profile page.
    If it is a vendor return a new product form to render
    """
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse("index"))

    user = User.objects.get(pk=request.user.id)
    title = "Vendor page" if user.is_vendor else "Profile"
    # products = None
    orders = None
    new_product_form = None
    if user.is_vendor:
        new_product_form = ProductForm()

    return render(request, "AmazPocket/profile.html", {
        "profile": user.serialize(),
        "title": title,
        "orders": orders,
        "form": new_product_form
    })


def categories(request):
    """
    Load categories page
    Return all the categories.
    """
    all_cats = Category.objects.filter(is_active=True)
    return render(request, "AmazPocket/categories.html", {
            "title": "Categories",
            "categories": all_cats
        })


def category_products(request, category_id):
    """
    Load the index page and return
    the name and id of the category selected.
    The Javascript will load the products in batches of 10.
    """
    category = Category.objects.get(pk=category_id)
    return render(request, "AmazPocket/index.html", {
            "title": "Category: %s" % category,
            "cat_id": category.id
        })


def product(request, product_id=None):
    """
    For the "GET" request:
    Return the product information. In the returned information
    include the user's wishlists and indicate if the product is there.
    Also return a flag indicating if the product is in the cart.

    For the "POST" request:
    If a product id is provided, update the product
    as long as the vendor is the owner.
    If the product id is not provided
    create a new product for the logged-in user.
    """
    if request.method == "GET":
        product_item = Product.objects.get(pk=product_id)

        lists = []
        is_in_cart = False
        if request.user.is_authenticated:
            # Get the wishlists and the carrt
            current_user_lists = (
                Wishlist.objects.filter(user=request.user)
                .all())
            current_user_cart, __ = (Cart.objects.
                                     get_or_create(user=request.user))

            # iterate over the wishlist and check if the product exists there
            for list in current_user_lists:
                list_ready = list.serialize()
                if list.items.filter(product=product_item).exists():
                    list_ready['is_in_list'] = True
                lists.append(list_ready)

            # Check if the product is in the cart
            is_in_cart = (current_user_cart.items
                          .filter(product=product_item).exists())

        return JsonResponse({
            "form": product_item.serialize(),
            "wishlists": lists,
            "is_in_cart": is_in_cart
        }, status=200)

    elif request.method == "POST":
        # Create a new product for the logged in vendor
        if product_id is not None:
            current_product = get_object_or_404(Product,
                                                pk=product_id,
                                                vendor=request.user)
            product_form = ProductForm(request.POST,
                                       instance=current_product)
        else:
            product_form = ProductForm(request.POST)

        if product_form.is_valid():
            product_obj = product_form.save(commit=False)

            if not hasattr(product_obj, "vendor"):
                product_obj.vendor = request.user

            # If no img is provided, we have a default img
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
                "error": "Information is not valid"
            }, status=400)


def delete_product(request, product_id):
    """
    View to delete product.
    As long as the product id belongs to the logged in vendor.
    """
    if request.method == "POST":
        try:
            to_be_deleted = get_object_or_404(Product,
                                              id=product_id,
                                              vendor=request.user)
            to_be_deleted.delete()
            return HttpResponseRedirect(reverse("profile"))
        except Product.DoesNotExist:
            return JsonResponse({
                "error": "Product to be deleted does not exist."
            }, status=404)


def get_user_wishlists(request):
    """
    View to get the logged in user's wishlists'
    """
    wishlists = Wishlist.objects.filter(user=request.user).all()
    lists = [list.serialize() for list in wishlists]
    return JsonResponse({"wishlist": lists}, status=200)


def wishlist(request, wishlist_id=None):
    """
    For the "GET" request:
    Renders the page to load the products in the selected wishlist.

    For the "POST" request:
    Creates a new wishlist
    """
    if request.method == "GET":
        list = get_object_or_404(Wishlist, id=wishlist_id)
        return render(request, "AmazPocket/index.html", {
            "title": "Wishlist: %s" % list,
            "wish_id": list.id
        })
    else:
        # Create new wishlist
        name = request.POST.get("name")
        # Make sure the name was provided
        if name:
            new_list = Wishlist.objects.create(name=name, user=request.user)
            return get_user_wishlists(request)


def delete_wishlist(request, wishlist_id):
    """
    View to delete the selected wishlist.
    It makes sure the wishlist belongs to the logged-in user.
    """
    if request.method == "POST":
        try:
            to_be_deleted = get_object_or_404(Wishlist,
                                              id=wishlist_id,
                                              user=request.user)
            to_be_deleted.delete()
            return JsonResponse({"success": True},
                                status=200)
        except Product.DoesNotExist:
            return JsonResponse({
                "error": "Wishlist does not exist."
            }, status=404)


def add_to_wishlist(request, wishlist_id, product_id):
    """
    View to add product to the selected wishlist.
    It requires the wishlist id and the product id.
    """
    if request.method == "POST":
        product = get_object_or_404(Product, id=product_id)
        wishlist = get_object_or_404(Wishlist, id=wishlist_id)

        # If the wishlist item already exists, do nothing.
        # Otherwise, create the object indicating that the product
        # is in the wishlist.
        item, created = (WishlistItem.objects
                         .get_or_create(wishlist=wishlist, product=product))

        return JsonResponse({"success": True}, status=200)


def remove_from_wishlist(request, wishlist_id, product_id):
    """
    View to remove the product from the wishlist.
    """
    if request.method == "POST":
        item = WishlistItem.objects.get(wishlist_id=wishlist_id,
                                        product_id=product_id)
        item.delete()

        return JsonResponse({"success": True}, status=200)


def cart(request):
    """
    View to get the user's cart information.
    It returns the cart's products, the subtotal and the count of products
    """
    if request.method == "GET":
        current_cart, created = Cart.objects.get_or_create(user=request.user)
        items = current_cart.items.all()
        items_serialized = [item.serialize() for item in items]
        subtotal = current_cart.get_subtotal()
        itemcount = current_cart.get_items_count()
        return JsonResponse({"cart": items_serialized,
                             "subtotal": subtotal,
                             "itemcount": itemcount},
                            status=200)


def add_to_cart(request, product_id):
    """
    View to add product to the logged-in user cart
    """
    if request.method == "POST":
        # if the cart record does not exist, create it
        current_cart, created = Cart.objects.get_or_create(user=request.user)
        # Verify the product exist
        product = get_object_or_404(Product, id=product_id)

        # Add it to the cart by creating a new cart item object
        item, created = (CartItem.objects
                         .get_or_create(cart=current_cart,
                                        product=product,
                                        quantity=1))

        return JsonResponse({"success": True}, status=200)


def remove_from_cart(request, item_id):
    """
    View to remove product from the logged-in user cart
    """
    if request.method == "POST":
        current_cart = Cart.objects.get(user=request.user)
        current_item = CartItem.objects.get(pk=item_id, cart=current_cart)
        current_item.delete()

        return JsonResponse({"success": True}, status=200)


def update_item_quantity(request, item_id, quantity):
    """
    Update the item's quantity to the logged-in user' cart.
    It takes the cart item id and the new quantity
    """
    if request.method == "POST":
        current_cart = Cart.objects.get(user=request.user)
        current_item = get_object_or_404(CartItem,
                                         pk=item_id,
                                         cart=current_cart)
        if (quantity == 0):
            current_item.delete()
        else:
            current_item.quantity = quantity
            current_item.save()

        return JsonResponse({"success": True}, status=200)


def checkout(request):
    """
    For the "GET" method:
    Get the cart items for the logged-in user.
    Return the items, the subtotal, the item count, the tax,
    and the total cost for the order.

    For the "POST" method"
    Create the order, order detail and order item objects with the
    information from the cart.
    """

    tax = 0.07
    if request.method == "GET":
        current_cart, created = Cart.objects.get_or_create(user=request.user)
        items = current_cart.items.all()
        items_serialized = [item.serialize() for item in items]
        subtotal = current_cart.get_subtotal()
        item_count = current_cart.get_items_count()
        form = OrderDetailForm()
        total = round(subtotal + (subtotal * Decimal(tax)), 2)
        return render(request, "AmazPocket/checkout.html", {
            "cart": items_serialized,
            "subtotal": subtotal,
            "item_count": item_count,
            "form": form,
            "tax": tax,
            "total": total
        })
    else:
        order_details_form = OrderDetailForm(request.POST)
        # Check that the order detail form is valid
        if order_details_form.is_valid():
            current_cart = get_object_or_404(Cart, user=request.user)
            items = current_cart.items.all()
            total = (current_cart.get_subtotal() +
                     (current_cart.get_subtotal() * Decimal(tax)))

            # Create order
            current_order = Order.objects.create(user=request.user,
                                                 subtotal=current_cart.
                                                 get_subtotal(),
                                                 tax=tax,
                                                 total=total)

            # Create order details
            new_order_details = order_details_form.save(commit=False)
            new_order_details.order = current_order
            new_order_details.save()

            # Create order items
            for item in items:
                new_order_item = (OrderItem.objects
                                  .create(order=current_order,
                                          product=item.product,
                                          quantity=item.quantity,
                                          price=item.product.price))

            # Delete cart after it has been processed
            current_cart.delete()
            return render(request, "AmazPocket/order_confirmation.html", {
                "order_id": current_order.id
            })

        else:
            current_cart, created = (Cart.objects
                                     .get_or_create(user=request.user))
            items = current_cart.items.all()
            items_serialized = [item.serialize() for item in items]
            subtotal = current_cart.get_subtotal()
            item_count = current_cart.get_items_count()
            total = round(subtotal + (subtotal * Decimal(tax)), 2)
            return render(request, "AmazPocket/checkout.html", {
                "cart": items_serialized,
                "subtotal": subtotal,
                "item_count": item_count,
                "form": order_details_form,
                "tax": tax,
                "total": total
            })


def load_orders(request):
    """
    View to get all the orders for the logged-in user.
    Return a list order by created date in descending order.
    """
    if request.method == "GET":
        # Get start and end points
        start = int(request.GET.get("start") or 0)
        end = int(request.GET.get("end") or (start + 9))

        all_orders = (Order.objects
                      .filter(user=request.user)
                      .order_by("-created_date").all())
        orders = [order.serialize() for order in all_orders[start:end]]

        return JsonResponse({
            "orders": orders
        })


def search(request):
    """
    View to render the index page, in which the products will be loaded.
    It returns the title with the used criteria and the criteria that will
    be used to load the products.
    """
    if request.method == "GET":
        criteria = request.GET.get("criteria")
        return render(request, "AmazPocket/index.html", {
                "title": "Search by: %s" % criteria,
                "criteria": criteria
            })
