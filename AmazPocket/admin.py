from django.contrib import admin

from AmazPocket.models import User, Category, Product, Order, OrderDetails, OrderItem


# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'first_name', 'last_name', 'is_vendor', 'email', 'is_active', 'vendor_name')
    list_display_links = ('id', 'vendor_name')


class ProductAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'vendor', 'category', 'img_url', 'price', 'is_active', 'created_date')
    list_display_links = ('id', 'name')


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'description', 'is_active')
    list_display_links = ('id', 'name')


class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'subtotal', 'tax', 'total', 'created_date')


class OrderDetailsAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'name', 'address', 'city', 'state', 'zipcode')


class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('id', 'order', 'quantity', 'product', 'price')


admin.site.register(User, UserAdmin)
admin.site.register(Category, CategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin)
admin.site.register(OrderDetails, OrderDetailsAdmin)
admin.site.register(OrderItem, OrderItemAdmin)