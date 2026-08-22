from django.urls import path
from .views import (
    OrderListCreateView, 
    OrderRetrieveView, 
    OrderCancelView,
    StaffOrderListView,
    StaffOrderStatusUpdateView
)

urlpatterns = [
    # Customer URLs
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
    path('orders/<int:pk>/', OrderRetrieveView.as_view(), name='order-detail'),
    path('orders/<int:pk>/cancel/', OrderCancelView.as_view(), name='order-cancel'),
    
    # Staff URLs
    path('staff/orders/', StaffOrderListView.as_view(), name='staff-order-list'),
    path('staff/orders/<int:pk>/<str:action>/', StaffOrderStatusUpdateView.as_view(), name='staff-order-action'),
]
