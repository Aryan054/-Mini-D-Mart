from rest_framework import serializers
from .models import Category, Product
from inventory.models import Inventory

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'description', 'image', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    available_quantity = serializers.IntegerField(source='inventory.available_quantity', read_only=True)
    image = serializers.SerializerMethodField()

    def get_image(self, obj):
        if not obj.image:
            return None
        url = str(obj.image)
        if url.startswith('http'):
            return url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url

    class Meta:
        model = Product
        fields = [
            'id', 'category', 'category_name', 'name', 'slug', 'description', 
            'sku', 'price', 'discount_price', 'image', 'brand', 'unit', 
            'is_active', 'created_at', 'updated_at', 'available_quantity'
        ]
        read_only_fields = ['id', 'slug', 'created_at', 'updated_at', 'available_quantity']
