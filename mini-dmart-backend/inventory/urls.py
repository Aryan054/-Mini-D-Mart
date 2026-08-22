from django.urls import path
from .views import InventoryListView, InventoryRetrieveUpdateView

urlpatterns = [
    path('inventory/', InventoryListView.as_view(), name='inventory-list'),
    path('inventory/<int:pk>/', InventoryRetrieveUpdateView.as_view(), name='inventory-detail'),
]
