import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def reset_admin():
    print("Resetting admin user...")
    admin, created = User.objects.get_or_create(email='admin@minidmart.com')
    admin.set_password('adminpass')
    admin.role = 'ADMIN'
    admin.is_staff = True
    admin.is_superuser = True
    admin.save()
    print("Admin reset successful. Password is 'adminpass'")

if __name__ == '__main__':
    reset_admin()
