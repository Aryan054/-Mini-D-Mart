from django.db import models
from products.models import Product

class Inventory(models.Model):
    product = models.OneToOneField(Product, related_name='inventory', on_delete=models.CASCADE)
    available_quantity = models.PositiveIntegerField(default=0)
    reserved_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=10)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Inventories'

    def __str__(self):
        return f"Inventory for {self.product.name}"
