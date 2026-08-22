import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from products.models import Product, Category
import urllib.parse

def add_images():
    print("Updating product images...")
    products = Product.objects.all()
    count = 0
    for prod in products:
        if not prod.image:
            # Generate a nice placeholder image using placehold.co or similar
            category_name = prod.category.name if prod.category else 'Product'
            # url encode the text
            text = urllib.parse.quote(prod.name[:15])
            # use a random color based on category
            colors = {
                'Fresh Vegetables': '4CAF50',
                'Fruits': 'FF9800',
                'Dairy': '2196F3',
                'Snacks': 'E91E63',
                'Beverages': '9C27B0',
                'Bakery': 'FFC107',
                'Meat': 'F44336',
                'Seafood': '00BCD4',
                'Pantry': '795548',
                'Frozen': '03A9F4'
            }
            color = colors.get(category_name, '607D8B')
            
            # Unsplash Source API is deprecated, but we can use placehold.co
            prod.image = f"https://placehold.co/400x400/{color}/ffffff?text={text}"
            prod.save()
            count += 1
            
    print(f"Added images to {count} products!")

if __name__ == '__main__':
    add_images()
