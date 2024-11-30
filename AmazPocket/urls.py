from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile", views.profile, name="profile"),
    path("categories", views.categories, name="categories"),
    path("categorty/<int:category_id>", views.categories, name="category_products"),

    path("product", views.product, name="product"),
    path("product/<int:product_id>/", views.product, name="product_with_param"),
    path("product/delete/<int:product_id>/", views.delete_product, name="delete_product")
]
