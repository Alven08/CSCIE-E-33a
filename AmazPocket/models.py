from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
from django.db import models


# Create your models here.
class User(AbstractUser):
    """
    User Model.
    Two new fields:
        - 'is_vendor' to indicate that the user is a vendor
        - 'vendor_name' to provide a vendor name to
        the products' description
    """
    is_vendor = models.BooleanField(default=False)
    vendor_name = models.CharField(max_length=255, null=True)

    def get_wishlists(self):
        """
        Returns a list of all the wishlists the user has
        """
        all = self.storages.all()
        return [{"id": list.id, "name": list.name} for list in all]

    def __str__(self):
        """
        Returns the string representation of the user.
        If the user is a vendor it returns the vendor name
        Otherwise it returns the first and last name of the user
        """
        return f"ID: {self.id} - {self.vendor_name}" \
            if self.vendor_name is not None \
            else f"ID: {self.id} - {self.first_name} {self.last_name}"

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "vendor_name": self.vendor_name,
            "is_vendor": self.is_vendor,
            "email": self.email,
            "wishlists": self.get_wishlists()
        }


class Category(models.Model):
    """
    Category model representing a category
    in which a product can be in.
    it has four fields. The name and img_url are required.
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
    """
    Product model representing a single product in the application.
    The is_active field by default is active.
    The created_date is set to the date and time it was created.
    """
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
        return f"ID: {self.id} - Name: {self.name}"

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
    """
    Order model representing a single order made by a user.
    It keeps track of the order subtotal, tax rate and total.
    The created_date is set to the date and time it was created.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")
    subtotal = models.DecimalField(max_digits=9, decimal_places=2)
    tax = models.DecimalField(max_digits=9, decimal_places=2)
    total = models.DecimalField(max_digits=9, decimal_places=2)
    created_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.id}"

    def serialize(self):
        total_items = 0
        items = []
        # Get all items in the order and return
        # them as part of the serialized order
        for item in self.order_items.all():
            items.append(item.serialize())
            total_items += item.quantity

        return {
            "id": self.id,
            "user_id": self.user.id,
            "subtotal": self.subtotal,
            "tax": self.tax,
            "total": self.total,
            "order_date": self.created_date,
            "items": items,
            "order_detail": self.order_detail.first().serialize(),
            "total_items": total_items
        }


class OrderDetails(models.Model):
    """
    Order Detail model representing the delivery and payment information
    Basic minimum length validation for:
    - state(2),
    - zipcode(5)
    - credit cart(15-16)
    """
    order = models.ForeignKey(Order,
                              on_delete=models.CASCADE,
                              related_name="order_detail")
    name = models.CharField(max_length=255, null=False, blank=False)
    address = models.CharField(max_length=255, null=False, blank=False)
    city = models.CharField(max_length=255, null=False, blank=False)
    state = models.CharField(max_length=2, null=False, blank=False,
                             validators=[MinLengthValidator(2)])
    zipcode = models.CharField(max_length=5, null=False, blank=False,
                               validators=[MinLengthValidator(5)])
    credit_card = models.CharField(max_length=16, null=False, blank=False,
                                   validators=[MinLengthValidator(15)])

    class Meta:
        # verbose name and verbose name plural for the admin
        # page to display the label properly
        verbose_name = ("Order Details")
        verbose_name_plural = ("Orders Details")

    def __str__(self):
        return f"{self.id}"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "address": self.address,
            "city": self.city,
            "state": self.state,
            "zipcode": self.zipcode
        }


class OrderItem(models.Model):
    """
    Order Item model representing order items
    It contains a reference to the product model
    The quantity for said product,
    and the price for the product at the time of checkout
    """
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
            "individual_item_price": self.price,
            "product": self.product.serialize()
        }


class Cart(models.Model):
    """
    Cart model representing the user's cart
    It has a reference to the user and
    the total cost of all the products in the cart
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="cart")
    total = models.DecimalField(max_digits=9, decimal_places=2, default=0.00)

    def get_subtotal(self):
        # Return subtotal of all the items in the cart
        subtotal = sum([item.product.price * item.quantity for item in self.items.all()])
        return subtotal

    def get_items_count(self):
        # Return the items count
        count = sum([item.quantity for item in self.items.all()])
        return count

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user.id,
            "total": self.total,
            "items": self.items.serialize()
        }


class CartItem(models.Model):
    """
    Cart Item model representing the cart's items
    It contains a reference to the cart and the product model
    and the quantity for said product.
    """
    cart = models.ForeignKey(Cart,
                             on_delete=models.CASCADE,
                             related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=0)

    def serialize(self):
        return {
            "id": self.id,
            "product": self.product.serialize(),
            "quantity": self.quantity
        }


class Wishlist(models.Model):
    """
    Wishlist model representing the user's wishlists
    It has a reference to the user and
    a field name to identify the wishlist.
    """
    name = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="storages")

    def __str__(self):
        return f"{self.name}"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "user_id": self.user.id
        }


class WishlistItem(models.Model):
    """
    Wishlist Item model representing the wishlists' items
    It contains a reference to the wishlist and the product model.
    """
    wishlist = models.ForeignKey(Wishlist,
                             on_delete=models.CASCADE,
                             related_name="items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE)

    def serialize(self):
        return {
            "id": self.id,
            "product": self.product
        }
