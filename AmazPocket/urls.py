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
    path("product", views.add_update_product, name="save_product"),
    path("product/<int:product_id>", views.product, name="category_products"),
    path("product/delete/<int:product_id>", views.delete_product, name="delete_product")
]
