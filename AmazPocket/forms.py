from .models import Product
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
            # For each field, the input element should
            # have the class form-control and it should have
            # a default placeholder
            field.field.widget.attrs.update({
                "class": "form-control",
                "placeholder": f"Enter {field.label}"
            })


