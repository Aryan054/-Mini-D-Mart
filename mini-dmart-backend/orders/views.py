from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer, CheckoutSerializer
from .services import OrderService
from accounts.permissions import IsStaffOrManager
from rest_framework.exceptions import ValidationError

class OrderListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')
        
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CheckoutSerializer
        return OrderSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            order = OrderService.checkout(
                user=request.user,
                fulfillment_type=serializer.validated_data['fulfillment_type'],
                pickup_store=serializer.validated_data.get('pickup_store'),
                delivery_address=serializer.validated_data.get('delivery_address'),
                scheduled_date=serializer.validated_data.get('scheduled_date'),
                scheduled_time_slot=serializer.validated_data.get('scheduled_time_slot')
            )
            
            response_serializer = OrderSerializer(order)
            return Response({
                "success": True,
                "message": "Order created successfully.",
                "data": response_serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except ValidationError as e:
            return Response({
                "success": False,
                "message": str(e.detail[0] if isinstance(e.detail, list) else e.detail)
            }, status=status.HTTP_400_BAD_REQUEST)


class OrderRetrieveView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user)


class OrderCancelView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            order = Order.objects.get(pk=pk, user=request.user)
            if order.status not in [Order.Status.PENDING, Order.Status.CONFIRMED]:
                return Response({"success": False, "message": "Order cannot be cancelled at this stage."}, status=status.HTTP_400_BAD_REQUEST)
                
            order.status = Order.Status.CANCELLED
            order.save()
            
            # TODO: Restore inventory. Should really be a service method.
            from inventory.models import Inventory
            for item in order.items.all():
                try:
                    inv = Inventory.objects.get(product=item.product)
                    inv.available_quantity += item.quantity
                    inv.save()
                except Inventory.DoesNotExist:
                    pass
            
            return Response({"success": True, "message": "Order cancelled successfully."})
            
        except Order.DoesNotExist:
            return Response({"success": False, "message": "Order not found."}, status=status.HTTP_404_NOT_FOUND)


# --- Staff APIs ---

class StaffOrderListView(generics.ListAPIView):
    queryset = Order.objects.all().order_by('-created_at')
    serializer_class = OrderSerializer
    permission_classes = [IsStaffOrManager]


class StaffOrderStatusUpdateView(views.APIView):
    permission_classes = [IsStaffOrManager]

    def post(self, request, pk, action):
        try:
            order = Order.objects.get(pk=pk)
            
            valid_actions = {
                'confirm': Order.Status.CONFIRMED,
                'prepare': Order.Status.PROCESSING,
                'ready': Order.Status.READY_FOR_PICKUP,
                'dispatch': Order.Status.OUT_FOR_DELIVERY,
                'complete': Order.Status.DELIVERED,
            }
            
            if action not in valid_actions:
                return Response({"success": False, "message": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
                
            order.status = valid_actions[action]
            order.save()
            
            return Response({"success": True, "message": f"Order status updated to {order.status}."})
            
        except Order.DoesNotExist:
            return Response({"success": False, "message": "Order not found."}, status=status.HTTP_404_NOT_FOUND)
