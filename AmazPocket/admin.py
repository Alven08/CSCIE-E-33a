from django.contrib import admin

# Register your models here.

class UserAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'is_vendor', 'email', 'is_active', 'vendor_name')


class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'is_active')


class OrderAdmin(admin.ModelAdmin):
    list_display = ('user', 'subtotal', 'tax', 'total', 'created_date', 'order_items')