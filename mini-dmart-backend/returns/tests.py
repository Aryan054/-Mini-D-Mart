import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from decimal import Decimal

from products.models import Category, Product
from inventory.models import Inventory
from orders.models import Order, OrderItem
from returns.models import ReturnRequest

User = get_user_model()

@pytest.fixture
def returns_setup_data():
    customer = User.objects.create_user(email='customer@example.com', password='pass', role='CUSTOMER')
    staff = User.objects.create_user(email='staff@example.com', password='pass', role='STAFF')
    
    category = Category.objects.create(name='Test Category')
    product = Product.objects.create(name='Test', sku='T-01', category=category, price=Decimal('50.00'))
    Inventory.objects.create(product=product, available_quantity=10)
    
    order = Order.objects.create(
        user=customer,
        order_number='ORD-001',
        subtotal=Decimal('50.00'),
        discount=Decimal('0.00'),
        delivery_fee=Decimal('0.00'),
        total_amount=Decimal('50.00'),
        fulfillment_type='HOME_DELIVERY',
        status='DELIVERED'
    )
    order_item = OrderItem.objects.create(order=order, product=product, quantity=1, price=Decimal('50.00'))
    
    return {
        'customer': customer,
        'staff': staff,
        'product': product,
        'order': order,
        'order_item': order_item
    }

@pytest.mark.django_db
def test_create_return_request(returns_setup_data):
    """
    Test customer can create a return request for a delivered order item.
    """
    client = APIClient()
    client.force_authenticate(user=returns_setup_data['customer'])
    
    response = client.post('/api/v1/returns/', {
        'order': returns_setup_data['order'].id,
        'order_item': returns_setup_data['order_item'].id,
        'quantity': 1,
        'reason': 'DEFECTIVE',
        'description': 'It was broken'
    })
    
    assert response.status_code == 201
    assert response.data['status'] == 'REQUESTED'

@pytest.mark.django_db
def test_staff_approve_return_restores_inventory(returns_setup_data):
    """
    Test staff approving and completing a return restores inventory.
    """
    return_req = ReturnRequest.objects.create(
        user=returns_setup_data['customer'],
        order=returns_setup_data['order'],
        order_item=returns_setup_data['order_item'],
        quantity=1,
        reason='WRONG_ITEM',
        status='PENDING'
    )
    
    client = APIClient()
    client.force_authenticate(user=returns_setup_data['staff'])
    
    # Approve and Complete
    response = client.post(f"/api/v1/staff/returns/{return_req.id}/complete/")
    
    assert response.status_code == 200
    
    # Verify inventory was restored
    inventory = Inventory.objects.get(product=returns_setup_data['product'])
    assert inventory.available_quantity == 11 # 10 initial + 1 returned
