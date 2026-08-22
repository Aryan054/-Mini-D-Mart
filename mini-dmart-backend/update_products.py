import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from products.models import Product, Category
import urllib.parse

dmart_catalog = {
    'Fresh Vegetables': [
        ('Onion - Regular', 'Fresh organic onions, locally sourced.', '1 kg', 'Local Farm'),
        ('Potato - Regular', 'Fresh potatoes perfect for boiling or frying.', '1 kg', 'Local Farm'),
        ('Tomato - Hybrid', 'Juicy red tomatoes rich in vitamins.', '500 g', 'Local Farm'),
        ('Cabbage', 'Crisp and fresh cabbage for salads and curries.', '1 pc', 'Local Farm'),
        ('Cauliflower', 'Farm fresh cauliflower.', '1 pc', 'Local Farm'),
    ],
    'Fruits': [
        ('Banana - Robusta', 'Fresh and sweet Robusta bananas.', '1 kg', 'Farm Fresh'),
        ('Apple - Royal Gala', 'Crunchy and sweet apples sourced from orchards.', '4 pcs', 'Kashmir Orchards'),
        ('Mango - Alphonso', 'Premium Alphonso mangoes, handpicked for quality.', '1 dozen', 'Ratnagiri Farms'),
        ('Papaya', 'Ripe papaya, great for digestion and health.', '1 pc', 'Farm Fresh'),
        ('Watermelon', 'Sweet and hydrating watermelon.', '1 pc', 'Farm Fresh'),
    ],
    'Dairy': [
        ('Amul Taaza Homogenised Toned Milk', 'Fresh toned milk, fortified with Vitamin A & D.', '1 L', 'Amul'),
        ('Amul Butter - Pasteurized', 'Classic Amul butter, deliciously creamy.', '100 g', 'Amul'),
        ('Mother Dairy Paneer', 'Soft and fresh paneer for delicious Indian gravies.', '200 g', 'Mother Dairy'),
        ('Amul Cheese Slices', 'Rich cheese slices perfect for sandwiches.', '200 g', 'Amul'),
        ('Epigamia Greek Yogurt - Blueberry', 'High protein thick Greek yogurt.', '90 g', 'Epigamia'),
    ],
    'Snacks': [
        ('Lays Potato Chips - Classic Salted', 'Crispy potato chips with a classic salty taste.', '52 g', 'Lays'),
        ('Kurkure Masala Munch', 'Spicy and crunchy corn puffs.', '90 g', 'Kurkure'),
        ('Haldiram Bhujia Sev', 'Traditional crispy and spicy gram flour noodles.', '200 g', 'Haldiram'),
        ('Britannia Good Day Cashew Biscuits', 'Rich buttery biscuits packed with cashews.', '600 g', 'Britannia'),
        ('Parle-G Gold Biscuits', 'The classic Indian glucose biscuit.', '1 kg', 'Parle'),
    ],
    'Beverages': [
        ('Taj Mahal Tea', 'Premium tea leaves with a rich aroma and color.', '250 g', 'Brooke Bond'),
        ('Nescafe Classic Instant Coffee', '100% pure instant coffee for a perfect morning start.', '100 g', 'Nescafe'),
        ('Coca Cola Soft Drink', 'Refreshing carbonated soft drink.', '2 L', 'Coca Cola'),
        ('Real Fruit Juice - Mixed Fruit', 'Delicious mixed fruit juice rich in Vitamin C.', '1 L', 'Real'),
        ('Kinley Mineral Water', 'Pure and safe packaged drinking water.', '1 L', 'Kinley'),
    ],
    'Bakery': [
        ('Britannia 100% Whole Wheat Bread', 'Soft and healthy whole wheat bread.', '400 g', 'Britannia'),
        ('Wibs Sliced Bread', 'Classic white sliced bread for daily breakfast.', '400 g', 'Wibs'),
        ('Britannia Fruit Cake', 'Soft and spongy fruit cake.', '150 g', 'Britannia'),
        ('English Oven Burger Buns', 'Soft sesame burger buns.', '4 pcs', 'English Oven'),
        ('Lays Bakery Croissant', 'Buttery flaky croissants.', '2 pcs', 'Lays Bakery'),
    ],
    'Meat': [
        ('Fresh Chicken Curry Cut', 'Fresh and tender chicken cut into curry-sized pieces.', '500 g', 'Licious'),
        ('Chicken Breast Boneless', 'High protein, zero fat boneless chicken breasts.', '500 g', 'Licious'),
        ('Mutton Curry Cut', 'Premium tender mutton pieces for delicious curries.', '500 g', 'Licious'),
        ('Chicken Keema', 'Minced chicken perfect for kebabs and curries.', '500 g', 'Licious'),
        ('Fresh Chicken Drumsticks', 'Juicy chicken drumsticks.', '500 g', 'Licious'),
    ],
    'Seafood': [
        ('Rohu Fish (Cut)', 'Fresh Rohu fish, cleaned and cut.', '500 g', 'FreshCatch'),
        ('Prawns (Medium)', 'Fresh medium-sized prawns, cleaned and deveined.', '250 g', 'FreshCatch'),
        ('Pomfret Fish', 'Whole Pomfret, thoroughly cleaned.', '500 g', 'FreshCatch'),
        ('Surmai (King Fish) Steaks', 'Premium king fish steaks.', '500 g', 'FreshCatch'),
        ('Basa Fish Fillet', 'Boneless basa fish fillets.', '500 g', 'FreshCatch'),
    ],
    'Pantry': [
        ('Aashirvaad Shudh Chakki Atta', '100% pure whole wheat atta.', '5 kg', 'Aashirvaad'),
        ('India Gate Basmati Rice - Everyday', 'Aged basmati rice for daily use.', '5 kg', 'India Gate'),
        ('Tata Salt - Vacuum Evaporated', 'Iodized salt for everyday cooking.', '1 kg', 'Tata'),
        ('Fortune Sunlite Refined Sunflower Oil', 'Light and healthy refined sunflower oil.', '1 L', 'Fortune'),
        ('Toor Dal / Arhar Dal', 'Premium unpolished toor dal.', '1 kg', 'Tata Sampann'),
    ],
    'Frozen': [
        ('McCain French Fries - Smiles', 'Crispy and delicious potato smiles.', '415 g', 'McCain'),
        ('Safal Frozen Green Peas', 'Freshly frozen green peas with no preservatives.', '1 kg', 'Safal'),
        ('Vadilal Vanilla Ice Cream', 'Classic rich vanilla ice cream.', '1 L', 'Vadilal'),
        ('Sumeru Frozen Paratha', 'Ready to cook flaky parathas.', '5 pcs', 'Sumeru'),
        ('Keventer Frozen Sweet Corn', 'Sweet and juicy frozen corn kernels.', '500 g', 'Keventer'),
    ]
}

def update_products():
    print("Updating products with realistic DMart catalog...")
    products = Product.objects.all()
    
    # We will loop through the existing products and map them based on their existing category
    updated_count = 0
    for prod in products:
        category_name = prod.category.name if prod.category else 'Pantry'
        
        # Get a list of possible products for this category
        possible_items = dmart_catalog.get(category_name, dmart_catalog['Pantry'])
        
        # Pick one randomly
        item = random.choice(possible_items)
        name, desc, unit, brand = item
        
        prod.name = name
        prod.description = desc
        prod.unit = unit
        prod.brand = brand
        
        # Update image
        text = urllib.parse.quote(name[:15])
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
        prod.image = f"https://placehold.co/400x400/{color}/ffffff?text={text}"
        
        prod.save()
        updated_count += 1
        
    print(f"Successfully updated {updated_count} products with realistic data!")

if __name__ == '__main__':
    update_products()
