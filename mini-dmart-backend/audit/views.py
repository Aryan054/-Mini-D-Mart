from rest_framework import generics, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import AuditLog
from .serializers import AuditLogSerializer
from accounts.permissions import IsAdmin

class AuditLogListView(generics.ListAPIView):
    queryset = AuditLog.objects.all().order_by('-created_at')
    serializer_class = AuditLogSerializer
    permission_classes = [IsAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    search_fields = ['user__email', 'action', 'model_name', 'object_id']
    filterset_fields = ['action', 'model_name']
