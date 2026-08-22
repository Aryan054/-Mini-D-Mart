from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Inventory
from .serializers import InventorySerializer
from accounts.permissions import IsManagerOrAdmin, IsStaffManagerOrAdmin

class InventoryListView(generics.ListAPIView):
    queryset = Inventory.objects.select_related('product').all()
    serializer_class = InventorySerializer
    permission_classes = [IsStaffManagerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['product__name', 'product__sku']
    ordering_fields = ['available_quantity', 'updated_at', 'product__name']


class InventoryRetrieveUpdateView(generics.RetrieveUpdateAPIView):
    queryset = Inventory.objects.select_related('product').all()
    serializer_class = InventorySerializer
    permission_classes = [IsManagerOrAdmin]

    def get_serializer(self, *args, **kwargs):
        # We only want to support PATCH or update with partial=True
        kwargs['partial'] = True
        return super().get_serializer(*args, **kwargs)
