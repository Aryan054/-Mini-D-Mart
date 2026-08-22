from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from .views import RegisterView, CustomTokenObtainPairView, ProfileView, UserManagementView, UserRoleUpdateView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='login'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', TokenBlacklistView.as_view(), name='logout'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('users/', UserManagementView.as_view(), name='user-list'),
    path('users/<int:pk>/role/', UserRoleUpdateView.as_view(), name='user-role-update'),
]
