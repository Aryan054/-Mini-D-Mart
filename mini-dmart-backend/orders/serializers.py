from rest_framework import serializers
from .models import Order, OrderItem
from stores.models import Store
from products.serializers import ProductSerializer


class OrderItemSerializer(serializers.ModelSerializer):
    product_details = ProductSerializer(source='product', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_details', 'quantity', 'price']
        read_only_fields = ['id', 'price']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    pickup_store_name = serializers.CharField(source='pickup_store.name', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'user', 'subtotal', 'discount', 'delivery_fee',
            'total_amount', 'fulfillment_type', 'scheduled_date', 'scheduled_time_slot',
            'delivery_address', 'pickup_store', 'pickup_store_name', 'status', 'payment_status',
            'created_at', 'updated_at', 'items'
        ]
        read_only_fields = [
            'id', 'order_number', 'user', 'subtotal', 'discount', 'delivery_fee',
            'total_amount', 'status', 'payment_status', 'created_at', 'updated_at'
        ]


class CheckoutSerializer(serializers.Serializer):
    fulfillment_type = serializers.ChoiceField(choices=Order.FulfillmentType.choices)
    pickup_store = serializers.PrimaryKeyRelatedField(queryset=Store.objects.filter(is_active=True), required=False, allow_null=True)
    delivery_address = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    scheduled_date = serializers.DateField(required=False, allow_null=True)
    scheduled_time_slot = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, attrs):
        f_type = attrs.get('fulfillment_type')
        if f_type == Order.FulfillmentType.STORE_PICKUP:
            if not attrs.get('pickup_store'):
                raise serializers.ValidationError({"pickup_store": "Required for store pickup."})
            if not attrs.get('scheduled_date'):
                raise serializers.ValidationError({"scheduled_date": "Required for store pickup."})
        elif f_type == Order.FulfillmentType.HOME_DELIVERY:
            if not attrs.get('delivery_address'):
                raise serializers.ValidationError({"delivery_address": "Required for home delivery."})
        return attrs
