from rest_framework import serializers
from .models import ReturnRequest, ExchangeRequest
from orders.models import Order, OrderItem
from products.serializers import ProductSerializer


class ReturnRequestSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    product_details = ProductSerializer(source='order_item.product', read_only=True)

    class Meta:
        model = ReturnRequest
        fields = ['id', 'user', 'order', 'order_number', 'order_item', 'product_details', 'quantity', 'reason', 'description', 'status', 'created_at']
        read_only_fields = ['id', 'user', 'order_number', 'status', 'created_at']

    def validate(self, attrs):
        order = attrs.get('order')
        order_item = attrs.get('order_item')
        quantity = attrs.get('quantity')

        if order.status != Order.Status.DELIVERED:
            raise serializers.ValidationError("Only delivered orders can be returned.")
        if order_item.order != order:
            raise serializers.ValidationError("Order item does not belong to the specified order.")
        if quantity > order_item.quantity:
            raise serializers.ValidationError("Return quantity cannot exceed purchased quantity.")
            
        return attrs


class ExchangeRequestSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source='order.order_number', read_only=True)
    product_details = ProductSerializer(source='order_item.product', read_only=True)

    class Meta:
        model = ExchangeRequest
        fields = ['id', 'user', 'order', 'order_number', 'order_item', 'product_details', 'quantity', 'reason', 'description', 'status', 'created_at']
        read_only_fields = ['id', 'user', 'order_number', 'status', 'created_at']

    def validate(self, attrs):
        order = attrs.get('order')
        order_item = attrs.get('order_item')
        quantity = attrs.get('quantity')

        if order.status != Order.Status.DELIVERED:
            raise serializers.ValidationError("Only delivered orders can be exchanged.")
        if order_item.order != order:
            raise serializers.ValidationError("Order item does not belong to the specified order.")
        if quantity > order_item.quantity:
            raise serializers.ValidationError("Exchange quantity cannot exceed purchased quantity.")
            
        return attrs
