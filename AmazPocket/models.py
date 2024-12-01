from django.contrib.auth.models import AbstractUser
from django.db import models


# Create your models here.
class User(AbstractUser):
    is_vendor = models.BooleanField(default=False)
    vendor_name = models.CharField(max_length=255, null=True)

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "vendor_name": self.vendor_name,
            "is_vendor": self.is_vendor,
            "email": self.email,
            "wishlists": self.storages
        }


class Category(models.Model):
    """
    Listing Category model representing a category
    in which an item can be in.
    it has three fields.
    The is_active field by default is active
    """
    name = models.CharField(max_length=64, unique=True)
    description = models.CharField(max_length=255)
    img_url = models.URLField(blank=False, null=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        # verbose name and verbose name plural for the admin
        # page to display the label properly
        verbose_name = ("Product Category")
        verbose_name_plural = ("Product Categories")

    def __str__(self):
        return f"{self.name}"

    def serialize(self):
        return {
            "name": self.name,
            "id": self.id,
            "img_url": self.img_url
        }


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(max_length=500)
    category = models.ForeignKey(Category,
                                 on_delete=models.CASCADE,
                                 related_name='products')
    img_url = models.URLField(null=True, blank=True)
    price = models.DecimalField(max_digits=9, decimal_places=2)
    in_stock_quantity = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    vendor = models.ForeignKey(User, on_delete=models.CASCADE, related_name="products")
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name}"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "price": self.price,
            "in_stock_quantity": self.in_stock_quantity,
            "img_url": self.img_url,
            "is_active": self.is_active,
            "category": self.category.serialize(),
            "vendor": self.vendor.serialize()
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
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="storages")

    def serialize(self):
        return {
            "id": self.id,
            "wishlist_name": self.name,
            "user_id": self.user.id,
            "items": self.items
        }

class WishlistItem(models.Model):
    Wishlist = models.ForeignKey(Wishlist,
                             on_delete=models.CASCADE,
                             related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    def serialize(self):
        return {
            "id": self.id,
            "product": self.product
        }


class Comment(models.Model):
    """
    Comment model representing a comment made to a product item.
    created_date is auto fill in with current date and time.
    """
    comment = models.TextField(max_length=500)
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="comments"
        )
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="comments"
        )
    created_date = models.DateTimeField(auto_now_add=True)