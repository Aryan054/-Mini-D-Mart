from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductSerializer

class CartItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)
    item_total = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_details', 'quantity', 'price_snapshot', 'item_total', 'created_at']
        read_only_fields = ['id', 'price_snapshot', 'created_at']

    def get_item_total(self, obj):
        price = obj.product.discount_price or obj.product.price
        return float(price) * obj.quantity

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        return value

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    subtotal = serializers.SerializerMethodField()
    discount = serializers.SerializerMethodField()
    delivery_fee = serializers.SerializerMethodField()
    grand_total = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'subtotal', 'discount', 'delivery_fee', 'grand_total', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def get_subtotal(self, obj):
        total = sum((item.product.price * item.quantity) for item in obj.items.all())
        return float(total)

    def get_discount(self, obj):
        total_discount = sum(
            ((item.product.price - item.product.discount_price) * item.quantity)
            for item in obj.items.all() if item.product.discount_price
        )
        return float(total_discount)

    def get_delivery_fee(self, obj):
        # Default flat delivery fee logic, can be customized later based on order type
        subtotal = self.get_subtotal(obj) - self.get_discount(obj)
        if subtotal == 0:
            return 0.0
        return 50.0 if subtotal < 500 else 0.0

    def get_grand_total(self, obj):
        return self.get_subtotal(obj) - self.get_discount(obj) + self.get_delivery_fee(obj)
