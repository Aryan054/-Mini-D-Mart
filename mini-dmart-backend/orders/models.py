from django.db import models
from django.conf import settings
from products.models import Product
import uuid

class Order(models.Model):
    class FulfillmentType(models.TextChoices):
        HOME_DELIVERY = 'HOME_DELIVERY', 'Home Delivery'
        STORE_PICKUP = 'STORE_PICKUP', 'Store Pickup'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Pending'
        CONFIRMED = 'CONFIRMED', 'Confirmed'
        PROCESSING = 'PROCESSING', 'Processing'
        READY_FOR_PICKUP = 'READY_FOR_PICKUP', 'Ready for Pickup'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Out for Delivery'
        DELIVERED = 'DELIVERED', 'Delivered'
        CANCELLED = 'CANCELLED', 'Cancelled'
        RETURN_REQUESTED = 'RETURN_REQUESTED', 'Return Requested'
        RETURNED = 'RETURNED', 'Returned'
        EXCHANGE_REQUESTED = 'EXCHANGE_REQUESTED', 'Exchange Requested'
        EXCHANGED = 'EXCHANGED', 'Exchanged'

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    order_number = models.CharField(max_length=20, unique=True, editable=False)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    
    fulfillment_type = models.CharField(max_length=20, choices=FulfillmentType.choices)
    scheduled_date = models.DateField(null=True, blank=True)
    scheduled_time_slot = models.CharField(max_length=100, null=True, blank=True)
    
    # Store reference as string since stores app isn't created yet
    pickup_store = models.ForeignKey('stores.Store', null=True, blank=True, on_delete=models.SET_NULL, related_name='pickup_orders')
    
    # Address details (for simplicity, storing as JSON or TextField. Let's use TextField)
    delivery_address = models.TextField(null=True, blank=True)
    
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.PENDING)
    payment_status = models.CharField(max_length=30, default='PENDING')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD-{uuid.uuid4().hex[:8].upper()}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Order {self.order_number} - {self.user.email}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    
    def __str__(self):
        return f"{self.quantity} x {self.product.name if self.product else 'Unknown'} for Order {self.order.order_number}"
