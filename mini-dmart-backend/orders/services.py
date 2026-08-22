from django.db import transaction
from cart.models import Cart, CartItem
from inventory.models import Inventory
from .models import Order, OrderItem
from rest_framework.exceptions import ValidationError

class OrderService:
    @staticmethod
    @transaction.atomic
    def checkout(user, fulfillment_type, pickup_store=None, delivery_address=None, scheduled_date=None, scheduled_time_slot=None):
        try:
            cart = Cart.objects.get(user=user)
        except Cart.DoesNotExist:
            raise ValidationError("Cart is empty.")
            
        cart_items = list(CartItem.objects.filter(cart=cart).select_related('product'))
        
        if not cart_items:
            raise ValidationError("Cart is empty.")

        # Collect product IDs and lock inventory rows
        product_ids = [item.product_id for item in cart_items]
        inventories = Inventory.objects.select_for_update().filter(product_id__in=product_ids)
        inventory_map = {inv.product_id: inv for inv in inventories}
        
        subtotal = 0.0
        discount = 0.0
        
        # 1. Validate stock and calculate totals
        for item in cart_items:
            if not item.product.is_active:
                raise ValidationError(f"Product {item.product.name} is no longer available.")
                
            inv = inventory_map.get(item.product_id)
            if not inv or inv.available_quantity < item.quantity:
                raise ValidationError(f"Insufficient stock for {item.product.name}.")
                
            price = float(item.product.price)
            disc_price = float(item.product.discount_price or price)
            
            subtotal += price * item.quantity
            discount += (price - disc_price) * item.quantity
            
            # Decrease inventory
            inv.available_quantity -= item.quantity
            inv.save()

        # 2. Delivery fee
        delivery_fee = 0.0
        if fulfillment_type == Order.FulfillmentType.HOME_DELIVERY:
            # Simple delivery fee logic
            if (subtotal - discount) < 500:
                delivery_fee = 50.0
                
        total_amount = subtotal - discount + delivery_fee
        
        # 3. Create Order
        order = Order.objects.create(
            user=user,
            subtotal=subtotal,
            discount=discount,
            delivery_fee=delivery_fee,
            total_amount=total_amount,
            fulfillment_type=fulfillment_type,
            pickup_store=pickup_store,
            delivery_address=delivery_address,
            scheduled_date=scheduled_date,
            scheduled_time_slot=scheduled_time_slot,
            status=Order.Status.PENDING
        )
        
        # 4. Create Order Items
        order_items = []
        for item in cart_items:
            order_items.append(OrderItem(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.discount_price or item.product.price
            ))
        OrderItem.objects.bulk_create(order_items)
        
        # 5. Clear cart
        cart.items.all().delete()
        
        return order
