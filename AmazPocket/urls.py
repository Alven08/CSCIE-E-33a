from django.urls import path

from . import views

urlpatterns = [
    # Urls related to the User
    path('', views.index, name='index'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile", views.profile, name="profile"),

    # Urls related to the Ctegories
    path("categories", views.categories, name="categories"),
    path("category/<int:category_id>",
         views.category_products,
         name="category_products"),

    # Urls related to the products (CRUD operations)
    path("load-products", views.load_products, name="load_products"),
    path("product", views.product, name="product"),
    path("product/<int:product_id>/", views.product,
         name="product_with_param"),
    path("product/delete/<int:product_id>/", views.delete_product,
         name="delete_product"),

    # Urls related to the Wishlists
    path("get-wishlists", views.get_user_wishlists, name="get_user_wishlists"),
    path("wishlist", views.wishlist, name="wishlist"),
    path("wishlist/<int:wishlist_id>/", views.wishlist,
         name="wishlist_with_param"),
    path("add-to-wishlist/<int:wishlist_id>/<int:product_id>/",
         views.add_to_wishlist,
         name="add_to_wishlist"),
    path("remove-from-wishlist/<int:wishlist_id>/<int:product_id>/",
         views.remove_from_wishlist, name="remove_from_wishlist"),
    path("wishlist/delete/<int:wishlist_id>/", views.delete_wishlist,
         name="delete_wishlist"),

    # Urls related to the user's Cart
    path("cart", views.cart, name="cart"),
    path("add-to-cart/<int:product_id>/", views.add_to_cart,
         name="add_to_cart"),
    path("remove-from-cart/<int:item_id>/", views.remove_from_cart,
         name="remove_from_cart"),
    path("update-item-quantity/<int:item_id>/<int:quantity>",
         views.update_item_quantity,
         name="update_item_quantity"),

    # Url for checkout (GET and POST)
    path("checkout", views.checkout, name="checkout"),

    # Urls for profile page, orders and vendor products
    path("load-orders", views.load_orders, name="load_orders"),
    path("load-vendor-products", views.load_vendor_products,
         name="load_vendor_products"),

    # Url for the search feature
    path("search", views.search, name="search")
]
