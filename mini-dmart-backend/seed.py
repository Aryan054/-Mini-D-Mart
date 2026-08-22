import os
import django
import random
from faker import Faker

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from django.contrib.auth import get_user_model
from products.models import Category, Product
from inventory.models import Inventory
from stores.models import Store
import datetime

User = get_user_model()
fake = Faker()

def seed_data():
    print("Seeding database...")
    
    # 1. Create admin user
    if not User.objects.filter(email='admin@minidmart.com').exists():
        User.objects.create_superuser('admin@minidmart.com', 'adminpass', first_name='Admin', last_name='User', role='ADMIN')
        print("Admin user created (admin@minidmart.com / adminpass)")
        
    # Create test customers and staff
    if not User.objects.filter(email='customer@minidmart.com').exists():
        User.objects.create_user('customer@minidmart.com', 'custpass', first_name='John', last_name='Doe', role='CUSTOMER')
        
    if not User.objects.filter(email='staff@minidmart.com').exists():
        User.objects.create_user('staff@minidmart.com', 'staffpass', first_name='Store', last_name='Staff', role='STAFF')
        
    if not User.objects.filter(email='manager@minidmart.com').exists():
        User.objects.create_user('manager@minidmart.com', 'managerpass', first_name='Store', last_name='Manager', role='MANAGER')

    # 2. Categories (10)
    categories = []
    category_names = ['Fresh Vegetables', 'Fruits', 'Dairy', 'Snacks', 'Beverages', 'Bakery', 'Meat', 'Seafood', 'Pantry', 'Frozen']
    for name in category_names:
        cat, created = Category.objects.get_or_create(
            name=name,
            defaults={
                'description': fake.text(max_nb_chars=100),
                'is_active': True
            }
        )
        categories.append(cat)
    print("Categories seeded.")

    # 3. Products (50) and Inventory
    for i in range(50):
        price = round(random.uniform(5.0, 100.0), 2)
        discount = price * 0.9 if random.choice([True, False]) else None
        
        prod, created = Product.objects.get_or_create(
            sku=f"SKU-{fake.unique.random_number(digits=6)}",
            defaults={
                'name': fake.catch_phrase(),
                'category': random.choice(categories),
                'description': fake.text(),
                'price': price,
                'discount_price': discount,
                'is_active': True
            }
        )
        
        # Update inventory for the product
        if created:
            inv = Inventory.objects.get(product=prod)
            inv.available_quantity = random.randint(10, 500)
            inv.low_stock_threshold = 20
            inv.save()
    print("Products and Inventory seeded.")

    # 4. Stores (5)
    for i in range(5):
        Store.objects.get_or_create(
            code=f"ST-{100+i}",
            defaults={
                'name': f"Mini D-Mart {fake.city()}",
                'address': fake.address(),
                'phone': fake.phone_number(),
                'opening_time': datetime.time(8, 0),
                'closing_time': datetime.time(22, 0),
                'pickup_capacity': 100,
                'is_active': True
            }
        )
    print("Stores seeded.")
    
    print("Seeding complete!")

if __name__ == '__main__':
    seed_data()
