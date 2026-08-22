from django.urls import path
from .views import StoreListCreateView, StoreRetrieveUpdateDestroyView, StorePickupSlotsView

urlpatterns = [
    path('stores/', StoreListCreateView.as_view(), name='store-list'),
    path('stores/<int:pk>/', StoreRetrieveUpdateDestroyView.as_view(), name='store-detail'),
    path('stores/<int:pk>/pickup-slots/', StorePickupSlotsView.as_view(), name='store-pickup-slots'),
]
