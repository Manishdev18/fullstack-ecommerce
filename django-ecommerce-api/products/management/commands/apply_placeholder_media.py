"""
Apply the bundled PiOra placeholder image to every Product.image and ProductCategory.icon.

Run after adding products/categories (or any time) until real assets exist:
    python manage.py apply_placeholder_media

Source file: products/data/piora_placeholder.png (replace that file to change the default).
"""

from pathlib import Path

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from products.models import Product, ProductCategory


class Command(BaseCommand):
    help = "Set all product and category images to products/data/piora_placeholder.png"

    def add_arguments(self, parser):
        parser.add_argument(
            "--skip-products",
            action="store_true",
            help="Only update category icons",
        )
        parser.add_argument(
            "--skip-categories",
            action="store_true",
            help="Only update product images",
        )

    def handle(self, *args, **options):
        products_dir = Path(__file__).resolve().parents[2] / "data" / "piora_placeholder.png"
        if not products_dir.is_file():
            self.stderr.write(
                self.style.ERROR(
                    f"Missing placeholder file: {products_dir}\n"
                    "Add products/data/piora_placeholder.png to the repo."
                )
            )
            return

        raw = products_dir.read_bytes()
        filename = "piora_placeholder.png"

        if not options["skip_products"]:
            qs = Product.objects.all().order_by("id")
            count = qs.count()
            self.stdout.write(f"Updating {count} product image(s)...")
            for product in qs.iterator():
                product.image.save(filename, ContentFile(raw), save=True)
            self.stdout.write(self.style.SUCCESS(f"Products done ({count})."))

        if not options["skip_categories"]:
            qs = ProductCategory.objects.all().order_by("id")
            count = qs.count()
            self.stdout.write(f"Updating {count} category icon(s)...")
            for cat in qs.iterator():
                cat.icon.save(filename, ContentFile(raw), save=True)
            self.stdout.write(self.style.SUCCESS(f"Categories done ({count})."))

        self.stdout.write(
            self.style.SUCCESS(
                "Placeholder media applied. Replace products/data/piora_placeholder.png "
                "and re-run this command when you have a new default."
            )
        )
