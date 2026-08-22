from django.urls import path
from .views import StaffDashboardAnalyticsView, ManagerDashboardAnalyticsView, AdminDashboardAnalyticsView

urlpatterns = [
    path('dashboard/staff/', StaffDashboardAnalyticsView.as_view(), name='staff-dashboard'),
    path('dashboard/manager/', ManagerDashboardAnalyticsView.as_view(), name='manager-dashboard'),
    path('dashboard/admin/', AdminDashboardAnalyticsView.as_view(), name='admin-dashboard'),
]
