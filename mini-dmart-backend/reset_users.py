import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

def reset_users():
    print("Resetting all default users...")
    
    users_data = [
        ('admin@minidmart.com', 'adminpass', 'ADMIN', True),
        ('manager@minidmart.com', 'managerpass', 'MANAGER', False),
        ('staff@minidmart.com', 'staffpass', 'STAFF', False),
        ('customer@minidmart.com', 'custpass', 'CUSTOMER', False),
    ]
    
    for email, password, role, is_superuser in users_data:
        try:
            user = User.objects.get(email=email)
            user.set_password(password)
            user.role = role
            if role in ['ADMIN', 'MANAGER', 'STAFF']:
                user.is_staff = True
            else:
                user.is_staff = False
            user.is_superuser = is_superuser
            user.save()
            print(f"Reset {email} with password '{password}'")
        except User.DoesNotExist:
            print(f"User {email} does not exist!")

if __name__ == '__main__':
    reset_users()
