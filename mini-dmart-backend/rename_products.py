import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from products.models import Product, Category

realistic_products = {
    'Fresh Vegetables': ['Potato - 1kg', 'Onion - 1kg', 'Tomato - 1kg', 'Carrot - 500g', 'Cabbage - 1pc', 'Cauliflower - 1pc', 'Green Chilli - 200g', 'Coriander Leaves - 1 bunch', 'Spinach - 1 bunch', 'Capsicum - 500g', 'Cucumber - 500g', 'Garlic - 250g'],
    'Fruits': ['Banana - 1 Dozen', 'Apple Fuji - 4 pcs', 'Papaya - 1pc', 'Watermelon - 1pc', 'Orange - 6 pcs', 'Grapes Green - 500g', 'Pomegranate - 4 pcs', 'Mango Alphonso - 6 pcs', 'Kiwi - 3 pcs', 'Pineapple - 1 pc'],
    'Dairy': ['Amul Taaza Milk - 1L', 'Amul Butter - 100g', 'Mother Dairy Paneer - 200g', 'Amul Cheese Slices - 200g', 'Britannia Cheese Block - 200g', 'Nestle Curd - 400g', 'Amul Masti Dahi - 400g', 'Gowardhan Ghee - 1L', 'Yakult Probiotic - 5x65ml'],
    'Snacks': ['Lays Magic Masala - 50g', 'Kurkure Masala Munch - 90g', 'Haldiram Aloo Bhujia - 200g', 'Haldiram Moong Dal - 200g', 'Britannia Good Day - 75g', 'Parle-G - 250g', 'Oreo Vanilla - 120g', 'Doritos Cheese - 60g', 'Bingo Mad Angles - 70g', 'Balaji Wafers - 65g'],
    'Beverages': ['Coca Cola - 1.25L', 'Pepsi - 1.25L', 'Sprite - 1.25L', 'Thums Up - 1.25L', 'Frooti - 1.2L', 'Real Mixed Fruit Juice - 1L', 'Tropicana Orange Juice - 1L', 'Red Bull - 250ml', 'Bisleri Mineral Water - 1L', 'Kinley Soda - 750ml'],
    'Bakery': ['Britannia White Bread - 400g', 'Modern Whole Wheat Bread - 400g', 'English Oven Burger Buns - 4pcs', 'Britannia Fruit Cake - 150g', 'Winkies Swiss Roll - 150g', 'Britannia Pav - 200g', 'Harvest Gold Brown Bread - 400g'],
    'Meat': ['Fresh Chicken Curry Cut - 500g', 'Chicken Breast Boneless - 500g', 'Chicken Keema - 250g', 'Mutton Curry Cut - 500g', 'Mutton Keema - 250g', 'Chicken Drumsticks - 500g'],
    'Seafood': ['Rohu Fish Cut - 500g', 'Catla Fish Cut - 500g', 'Prawns - 250g', 'Surmai Steaks - 500g', 'Pomfret - 500g', 'Basa Fillet - 250g'],
    'Pantry': ['Tata Salt - 1kg', 'Aashirvaad Atta - 5kg', 'India Gate Basmati Rice - 1kg', 'Fortune Sunflower Oil - 1L', 'Saffola Gold Oil - 1L', 'Tata Sampann Toor Dal - 1kg', 'Everest Garam Masala - 100g', 'MDH Chana Masala - 100g', 'Maggi Noodles - 400g', 'Kissan Ketchup - 500g', 'Brooke Bond Red Label Tea - 250g', 'Nescafe Classic - 50g'],
    'Frozen': ['McCain French Fries - 400g', 'McCain Smiles - 400g', 'Sumeru Green Peas - 500g', 'Vadilal Sweet Corn - 500g', 'Godrej Yummiez Chicken Nuggets - 400g', 'Amul Vanilla Ice Cream - 1L', 'Kwality Walls Cornetto - 120ml', 'Safal Frozen Mix Veg - 500g']
}

def rename_products():
    print("Renaming products with realistic names...")
    products = list(Product.objects.all())
    
    # Shuffle so we get different names if we have more products than names
    random.shuffle(products)
    
    # Track used names per category so we don't repeat too much unless necessary
    used_names = {cat: [] for cat in realistic_products.keys()}
    
    count = 0
    for product in products:
        cat_name = product.category.name if product.category else None
        
        if cat_name in realistic_products:
            available_names = [n for n in realistic_products[cat_name] if n not in used_names[cat_name]]
            
            # If we used all names, reset the used list to allow duplicates
            if not available_names:
                used_names[cat_name] = []
                available_names = realistic_products[cat_name]
                
            new_name = random.choice(available_names)
            used_names[cat_name].append(new_name)
            
            product.name = new_name
            product.image = None
            product.save()
            count += 1
            
    print(f"Successfully renamed {count} products!")

if __name__ == '__main__':
    rename_products()
