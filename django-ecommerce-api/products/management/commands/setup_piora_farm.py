from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from products.models import ProductCategory, Product
from decimal import Decimal
import os
from django.core.files import File
from io import BytesIO
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()


class Command(BaseCommand):
    help = 'Set up Piora Farm categories and dry fruits products'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Setting up Piora Farm data...'))

        # Get or create admin user (seller)
        admin_user, created = User.objects.get_or_create(
            email='manishdevkota18@gmail.com',
            defaults={
                'first_name': 'Manish',
                'last_name': 'Devkota',
                'is_staff': True,
                'is_superuser': True,
                'is_active': True
            }
        )
        if created:
            admin_user.set_password('Manishdev@18')
            admin_user.save()

        # Create categories
        categories_data = [
            {'name': 'Dry Fruits', 'description': 'Premium quality dry fruits and nuts'},
            {'name': 'Vegetables', 'description': 'Fresh organic vegetables from Piora Farm'},
            {'name': 'Dairy Products', 'description': 'Fresh dairy products from local farms'},
            {'name': 'Livestock', 'description': 'Quality livestock and related products'},
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = ProductCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'icon': None  # We'll set placeholder icons
                }
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'Created category: {category.name}')
            else:
                self.stdout.write(f'Category already exists: {category.name}')

        # Create dry fruits products
        dry_fruits_data = [
            {
                'name': 'Premium Almonds',
                'desc': 'Fresh, crunchy almonds from California. Rich in protein, healthy fats, and vitamin E. Perfect for snacking or cooking.',
                'price': Decimal('450.00'),
                'quantity': 50
            },
            {
                'name': 'Organic Walnuts',
                'desc': 'Organic walnuts packed with omega-3 fatty acids. Great for brain health and heart wellness.',
                'price': Decimal('380.00'),
                'quantity': 40
            },
            {
                'name': 'Cashew Nuts',
                'desc': 'Creamy, buttery cashews perfect for snacking. Rich in minerals and healthy fats.',
                'price': Decimal('520.00'),
                'quantity': 35
            },
            {
                'name': 'Dates (Khajur)',
                'desc': 'Sweet, natural dates from Rajasthan. High in fiber, potassium, and antioxidants.',
                'price': Decimal('280.00'),
                'quantity': 60
            },
            {
                'name': 'Dried Figs (Anjeer)',
                'desc': 'Premium dried figs rich in calcium, fiber, and natural sweetness. Great for digestive health.',
                'price': Decimal('650.00'),
                'quantity': 25
            },
            {
                'name': 'Raisins (Kishmish)',
                'desc': 'Sweet, plump raisins packed with iron and natural sugars. Perfect for desserts and snacking.',
                'price': Decimal('180.00'),
                'quantity': 80
            },
            {
                'name': 'Pistachios',
                'desc': 'Premium Iranian pistachios with rich flavor and crunch. High in protein and healthy fats.',
                'price': Decimal('720.00'),
                'quantity': 30
            },
            {
                'name': 'Dried Apricots',
                'desc': 'Sun-dried apricots from Kashmir. Rich in vitamin A, fiber, and natural sweetness.',
                'price': Decimal('420.00'),
                'quantity': 45
            },
            {
                'name': 'Brazil Nuts',
                'desc': 'Large, creamy Brazil nuts rich in selenium. Perfect for boosting immunity and metabolism.',
                'price': Decimal('890.00'),
                'quantity': 20
            },
            {
                'name': 'Mixed Dry Fruits',
                'desc': 'Premium mix of almonds, cashews, dates, and raisins. Perfect gift pack for festivals.',
                'price': Decimal('550.00'),
                'quantity': 40
            }
        ]

        dry_fruits_category = categories['Dry Fruits']
        
        for product_data in dry_fruits_data:
            product, created = Product.objects.get_or_create(
                name=product_data['name'],
                seller=admin_user,
                defaults={
                    'category': dry_fruits_category,
                    'desc': product_data['desc'],
                    'price': product_data['price'],
                    'quantity': product_data['quantity'],
                    'image': None  # We'll set placeholder images
                }
            )
            if created:
                self.stdout.write(f'Created product: {product.name} - ₹{product.price}')
            else:
                self.stdout.write(f'Product already exists: {product.name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully set up Piora Farm data!\n'
                f'Categories: {len(categories)}\n'
                f'Dry Fruits Products: {len(dry_fruits_data)}'
            )
        )