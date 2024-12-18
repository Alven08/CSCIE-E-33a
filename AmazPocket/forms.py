from .models import Product, OrderDetails
from django.forms import ModelForm, Textarea


class ProductForm(ModelForm):
    """
    Product Form that takes its meta
    from the product model
    """
    class Meta:
        model = Product
        fields = ['name', 'description', 'category', 'img_url', 'price',
                  'in_stock_quantity', 'is_active']
        widgets = {
            'description': Textarea()
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.visible_fields():
            # Except for the field "is_active", for each field,
            # the input element should have the class form-control,
            # and it should have a default placeholder
            if field.name != "is_active":
                field.field.widget.attrs.update({
                    "class": "form-control",
                    "placeholder": f"Enter {field.label}"
                })


class OrderDetailForm(ModelForm):
    """
    Order Detail Form that takes its meta
    from the Order Detail model
    """
    class Meta:
        model = OrderDetails
        fields = ['name', 'address', 'city', 'state', 'zipcode',
                  'credit_card']

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.visible_fields():
            # For each field, the input element should
            # have the class form-control, and it should have
            # a default placeholder
            field.field.widget.attrs.update({
                "class": "form-control",
                "placeholder": f"Enter {field.label}"
            })
