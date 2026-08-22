import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def check_admin():
    print("Checking admin user...")
    try:
        admin = User.objects.get(email='admin@minidmart.com')
        print(f"Admin exists. Role: {admin.role}, is_active: {admin.is_active}, is_superuser: {admin.is_superuser}")
        is_password_correct = admin.check_password('adminpass')
        print(f"Password 'adminpass' is correct: {is_password_correct}")
    except User.DoesNotExist:
        print("Admin user does not exist!")

if __name__ == '__main__':
    check_admin()
