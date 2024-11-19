from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.
class User(AbstractUser):
    is_vendor = models.BooleanField(default=False)
    vendor_name = models.CharField(max_length=255)

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "email": self.email
        }


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=500)
    img_url = models.URLField(null=True, blank=True)
    price = models.DecimalField(max_digits=9, decimal_places=2)
    in_stock_quantity = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="products")
    created_date = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "in_stock_quantity": self.in_stock_quantity,
            "is_active": self.is_active,
            "vendor": self.User
        }


class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    subtotal = models.DecimalField(max_digits=9, decimal_places=2)
    tax = models.DecimalField(max_digits=9, decimal_places=2)
    total = models.DecimalField(max_digits=9, decimal_places=2)
    created_date = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user.id,
            "subtotal": self.subtotal,
            "tax": self.tax,
            "total": self.total,
            "order_date": self.created_date,
            "items": self.order_items
        }


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="order_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)
    price = models.DecimalField(max_digits=9, decimal_places=2)

    def serialize(self):
        return {
            "id": self.id,
            "order_id": self.order.id,
            "total": self.quantity * self.price,
            "quantity": self.quantity,
            "individual_order_price": self.price,
            "product": self.product
        }


class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cart")
    total = models.DecimalField(max_digits=9, decimal_places=2)

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user.id,
            "total": self.total,
            "items": self.items
        }


class CartItem(models.Model):
    Cart = models.ForeignKey(Cart,
                             on_delete=models.CASCADE,
                             related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)

    def serialize(self):
        return {
            "id": self.id,
            "product": self.product,
            "quantity": self.quantity
        }


class Wishlist(Cart):
    name = models.CharField(max_length=100)

    def serialize(self):
        return {
            "id": self.id,
            "wishlist_name": self.name,
            "user_id": self.user.id,
            "items": self.items
        }
