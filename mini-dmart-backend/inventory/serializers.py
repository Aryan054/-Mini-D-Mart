from rest_framework import serializers
from .models import Inventory

class InventorySerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_sku = serializers.CharField(source='product.sku', read_only=True)

    class Meta:
        model = Inventory
        fields = ['id', 'product', 'product_name', 'product_sku', 'available_quantity', 'reserved_quantity', 'low_stock_threshold', 'updated_at']
        read_only_fields = ['id', 'product', 'product_name', 'product_sku', 'updated_at']
