from rest_framework import views, status
from rest_framework.response import Response
from django.db.models import Sum, Count, Q, F
from django.utils import timezone
from datetime import timedelta
from accounts.permissions import IsStaffOrManager, IsManagerOrAdmin, IsAdmin
from orders.models import Order
from returns.models import ReturnRequest, ExchangeRequest
from inventory.models import Inventory
from products.models import Product
from django.contrib.auth import get_user_model

User = get_user_model()


class StaffDashboardAnalyticsView(views.APIView):
    permission_classes = [IsStaffOrManager]

    def get(self, request):
        today = timezone.now().date()
        
        today_orders = Order.objects.filter(created_at__date=today).count()
        pending_orders = Order.objects.filter(status=Order.Status.PENDING).count()
        ready_for_pickup = Order.objects.filter(status=Order.Status.READY_FOR_PICKUP).count()
        delivery_orders = Order.objects.filter(fulfillment_type=Order.FulfillmentType.HOME_DELIVERY, status__in=[Order.Status.PENDING, Order.Status.CONFIRMED, Order.Status.PROCESSING]).count()
        
        return Response({
            "success": True,
            "data": {
                "today_orders": today_orders,
                "pending_orders": pending_orders,
                "ready_for_pickup": ready_for_pickup,
                "delivery_orders": delivery_orders,
            }
        })


class ManagerDashboardAnalyticsView(views.APIView):
    permission_classes = [IsManagerOrAdmin]

    def get(self, request):
        today = timezone.now().date()
        
        # Staff Metrics
        today_orders = Order.objects.filter(created_at__date=today).count()
        pending_orders = Order.objects.filter(status=Order.Status.PENDING).count()
        ready_for_pickup = Order.objects.filter(status=Order.Status.READY_FOR_PICKUP).count()
        delivery_orders = Order.objects.filter(fulfillment_type=Order.FulfillmentType.HOME_DELIVERY, status__in=[Order.Status.PENDING, Order.Status.CONFIRMED, Order.Status.PROCESSING]).count()
        
        # Manager Metrics
        total_sales = Order.objects.filter(status=Order.Status.DELIVERED).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_orders = Order.objects.count()
        pending_returns = ReturnRequest.objects.filter(status__in=[ReturnRequest.Status.REQUESTED, ReturnRequest.Status.UNDER_REVIEW]).count()
        low_stock_products = Inventory.objects.filter(available_quantity__lte=F('low_stock_threshold')).count()
        
        return Response({
            "success": True,
            "data": {
                "today_orders": today_orders,
                "pending_orders": pending_orders,
                "ready_for_pickup": ready_for_pickup,
                "delivery_orders": delivery_orders,
                "total_sales": float(total_sales),
                "total_orders": total_orders,
                "pending_returns": pending_returns,
                "low_stock_products": low_stock_products,
            }
        })


class AdminDashboardAnalyticsView(views.APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        
        # Staff Metrics
        today_orders = Order.objects.filter(created_at__date=today).count()
        pending_orders = Order.objects.filter(status=Order.Status.PENDING).count()
        ready_for_pickup = Order.objects.filter(status=Order.Status.READY_FOR_PICKUP).count()
        delivery_orders = Order.objects.filter(fulfillment_type=Order.FulfillmentType.HOME_DELIVERY, status__in=[Order.Status.PENDING, Order.Status.CONFIRMED, Order.Status.PROCESSING]).count()
        
        # Manager Metrics
        total_sales = Order.objects.filter(status=Order.Status.DELIVERED).aggregate(Sum('total_amount'))['total_amount__sum'] or 0
        total_orders = Order.objects.count()
        pending_returns = ReturnRequest.objects.filter(status__in=[ReturnRequest.Status.REQUESTED, ReturnRequest.Status.UNDER_REVIEW]).count()
        low_stock_products = Inventory.objects.filter(available_quantity__lte=F('low_stock_threshold')).count()
        
        # Admin Metrics
        total_users = User.objects.count()
        staff_users = User.objects.filter(role__in=['STAFF', 'MANAGER']).count()
        total_products = Product.objects.count()
        
        return Response({
            "success": True,
            "data": {
                "today_orders": today_orders,
                "pending_orders": pending_orders,
                "ready_for_pickup": ready_for_pickup,
                "delivery_orders": delivery_orders,
                "total_sales": float(total_sales),
                "total_orders": total_orders,
                "pending_returns": pending_returns,
                "low_stock_products": low_stock_products,
                "total_users": total_users,
                "staff_users": staff_users,
                "total_products": total_products,
            }
        })
