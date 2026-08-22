import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from decimal import Decimal
from django.utils import timezone

from products.models import Category, Product
from inventory.models import Inventory
from cart.models import Cart, CartItem
from stores.models import Store
from orders.models import Order
from orders.services import OrderService

User = get_user_model()

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def customer_user():
    return User.objects.create_user(
        email='test_cust@example.com',
        password='password123',
        role='CUSTOMER'
    )

@pytest.fixture
def orders_setup_data(customer_user):
    category = Category.objects.create(name='Test Category')
    product = Product.objects.create(
        name='Test Product',
        sku='TSKU-01',
        category=category,
        price=Decimal('100.00')
    )
    Inventory.objects.create(
        product=product,
        available_quantity=50
    )
    import datetime
    store = Store.objects.create(
        name='Test Store',
        code='TS-01',
        pickup_capacity=100,
        opening_time=datetime.time(8, 0),
        closing_time=datetime.time(22, 0)
    )
    cart = Cart.objects.create(user=customer_user)
    CartItem.objects.create(cart=cart, product=product, quantity=2) # 2 * 100 = 200
    
    return {
        'product': product,
        'store': store,
        'cart': cart
    }

@pytest.mark.django_db
def test_checkout_service_success(customer_user, orders_setup_data):
    """
    Test the OrderService checkout flow with valid data.
    Ensures that an order is created, inventory is deducted, and cart is cleared.
    """
    
    order = OrderService.checkout(
        user=customer_user,
        fulfillment_type='STORE_PICKUP',
        pickup_store=orders_setup_data['store'],
        scheduled_date=timezone.now().date(),
        delivery_address=None
    )
    
    assert order is not None
    assert order.status == 'PENDING'
    assert order.total_amount == Decimal('200.00')
    
    # Check inventory deduction
    inventory = Inventory.objects.get(product=orders_setup_data['product'])
    assert inventory.available_quantity == 48 # 50 - 2
    
    # Check cart is cleared
    assert not CartItem.objects.filter(cart=orders_setup_data['cart']).exists()

@pytest.mark.django_db
def test_checkout_service_insufficient_stock(customer_user, orders_setup_data):
    """
    Test checkout fails when quantity exceeds available stock.
    """
    # Reduce stock to 1
    inv = Inventory.objects.get(product=orders_setup_data['product'])
    inv.available_quantity = 1
    inv.save()
    
    with pytest.raises(Exception, match="Insufficient stock"):
        OrderService.checkout(
            user=customer_user,
            fulfillment_type='STORE_PICKUP',
            pickup_store=orders_setup_data['store'],
            scheduled_date=timezone.now().date(),
            delivery_address=None
        )
        
    # Check cart is NOT cleared
    assert CartItem.objects.filter(cart=orders_setup_data['cart']).count() == 1
