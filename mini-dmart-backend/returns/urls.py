from django.urls import path
from .views import (
    ReturnRequestListCreateView,
    ReturnRequestRetrieveView,
    ReturnRequestCancelView,
    ExchangeRequestListCreateView,
    ExchangeRequestRetrieveView,
    StaffReturnRequestListView,
    StaffReturnRequestActionView
)

urlpatterns = [
    # Customer Returns
    path('returns/', ReturnRequestListCreateView.as_view(), name='return-list'),
    path('returns/<int:pk>/', ReturnRequestRetrieveView.as_view(), name='return-detail'),
    path('returns/<int:pk>/cancel/', ReturnRequestCancelView.as_view(), name='return-cancel'),
    
    # Customer Exchanges
    path('exchanges/', ExchangeRequestListCreateView.as_view(), name='exchange-list'),
    path('exchanges/<int:pk>/', ExchangeRequestRetrieveView.as_view(), name='exchange-detail'),
    
    # Staff Returns
    path('staff/returns/', StaffReturnRequestListView.as_view(), name='staff-return-list'),
    path('staff/returns/<int:pk>/<str:action>/', StaffReturnRequestActionView.as_view(), name='staff-return-action'),
]
