from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Store
from .serializers import StoreSerializer
from accounts.permissions import IsManagerOrAdmin
import datetime
from django.utils import timezone

class StoreListCreateView(generics.ListCreateAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsManagerOrAdmin()]


class StoreRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Store.objects.all()
    serializer_class = StoreSerializer

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsManagerOrAdmin()]


class StorePickupSlotsView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            store = Store.objects.get(pk=pk, is_active=True)
            
            # Simple slot generation logic
            slots = []
            current_date = timezone.now().date()
            
            # Generate slots for next 3 days
            for i in range(3):
                date = current_date + datetime.timedelta(days=i)
                slots.append({
                    "date": date.isoformat(),
                    "slots": [
                        "10:00 AM - 12:00 PM",
                        "01:00 PM - 03:00 PM",
                        "04:00 PM - 06:00 PM",
                    ]
                })
                
            return Response({
                "success": True,
                "data": slots
            })
            
        except Store.DoesNotExist:
            return Response({"success": False, "message": "Store not found."}, status=status.HTTP_404_NOT_FOUND)
