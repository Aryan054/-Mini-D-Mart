from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import ReturnRequest, ExchangeRequest
from .serializers import ReturnRequestSerializer, ExchangeRequestSerializer
from accounts.permissions import IsStaffOrManager

class ReturnRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ReturnRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReturnRequest.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ReturnRequestRetrieveView(generics.RetrieveAPIView):
    serializer_class = ReturnRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ReturnRequest.objects.filter(user=self.request.user)


class ReturnRequestCancelView(views.APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            req = ReturnRequest.objects.get(pk=pk, user=request.user)
            if req.status not in [ReturnRequest.Status.REQUESTED, ReturnRequest.Status.UNDER_REVIEW]:
                return Response({"success": False, "message": "Cannot cancel return at this stage."}, status=status.HTTP_400_BAD_REQUEST)
                
            req.status = ReturnRequest.Status.CANCELLED
            req.save()
            return Response({"success": True, "message": "Return request cancelled."})
        except ReturnRequest.DoesNotExist:
            return Response({"success": False, "message": "Not found."}, status=status.HTTP_404_NOT_FOUND)


class ExchangeRequestListCreateView(generics.ListCreateAPIView):
    serializer_class = ExchangeRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExchangeRequest.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class ExchangeRequestRetrieveView(generics.RetrieveAPIView):
    serializer_class = ExchangeRequestSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return ExchangeRequest.objects.filter(user=self.request.user)

# --- Staff APIs ---

class StaffReturnRequestListView(generics.ListAPIView):
    queryset = ReturnRequest.objects.all().order_by('-created_at')
    serializer_class = ReturnRequestSerializer
    permission_classes = [IsStaffOrManager]

class StaffReturnRequestActionView(views.APIView):
    permission_classes = [IsStaffOrManager]

    def post(self, request, pk, action):
        try:
            req = ReturnRequest.objects.get(pk=pk)
            
            valid_actions = {
                'approve': ReturnRequest.Status.APPROVED,
                'reject': ReturnRequest.Status.REJECTED,
                'complete': ReturnRequest.Status.COMPLETED,
            }
            
            if action not in valid_actions:
                return Response({"success": False, "message": "Invalid action."}, status=status.HTTP_400_BAD_REQUEST)
                
            req.status = valid_actions[action]
            req.save()
            
            if action == 'complete':
                # Restore inventory
                from inventory.models import Inventory
                try:
                    inv = Inventory.objects.get(product=req.order_item.product)
                    inv.available_quantity += req.quantity
                    inv.save()
                except Inventory.DoesNotExist:
                    pass
            
            return Response({"success": True, "message": f"Return status updated to {req.status}."})
            
        except ReturnRequest.DoesNotExist:
            return Response({"success": False, "message": "Request not found."}, status=status.HTTP_404_NOT_FOUND)
