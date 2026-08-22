import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from inventory.models import Inventory
from products.models import Product

def fix_inventory():
    print("Checking and fixing inventory...")
    products = Product.objects.all()
    fixed_count = 0
    for product in products:
        inv, created = Inventory.objects.get_or_create(product=product)
        if inv.available_quantity < 100:
            inv.available_quantity = 500
            inv.save()
            fixed_count += 1
            print(f"Fixed inventory for: {product.name}")
    print(f"\nInventory fixed for {fixed_count} products!")

if __name__ == '__main__':
    fix_inventory()
