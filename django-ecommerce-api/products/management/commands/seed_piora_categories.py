"""
Seed six root categories and attach listed items as Product rows (not child categories).

Display rules:
  - "Almonds (Badam)"  -> name="Almonds", local_name="Badam"
  - "Chia Seeds"       -> name="Chia Seeds", local_name=""

Idempotent: roots and products are get_or_create / existence-checked.

Optional: ``--purge-legacy-child-categories`` migrates products from old
child ``ProductCategory`` rows (previous seed) onto their parent root, then
deletes those child rows. Omit this if you use real subcategories in admin.

Requires a Django user as seller (first superuser, else first user). Requires
products/data/piora_placeholder.png for new product images (same as apply_placeholder_media).
"""

from __future__ import annotations

import re
from decimal import Decimal
from pathlib import Path

from django.contrib.auth import get_user_model
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand, CommandError

from products.models import Product, ProductCategory

User = get_user_model()

# Six root categories -> product display strings (optional "(local_name)" suffix)
PIORA_CATEGORY_TREE: list[tuple[str, list[str]]] = [
    (
        "Dry Fruits",
        [
            "Almonds (Badam)",
            "Cashews (Kaju)",
            "Walnuts (Karot)",
            "Pistachios (Pista)",
            "Raisins (Kismis)",
            "Dates (Hajur)",
            "Figs (Anjeer)",
        ],
    ),
    (
        "Seeds",
        [
            "Chia Seeds",
            "Flax Seeds",
            "Pumpkin Seeds",
            "Sunflower Seeds",
            "Sesame Seeds",
        ],
    ),
    (
        "Seed Mixes",
        [
            "Protein Seed Mix",
            "Omega Seed Mix",
            "Trail Mix",
            "Healthy Snack Mix",
        ],
    ),
    (
        "Superfoods & Berries",
        [
            "Dried Blueberries",
            "Goji Berries",
            "Cranberries",
            "Mulberries",
            "Himalayan Berries",
        ],
    ),
    (
        "Himalayan Organic Herbs",
        [
            "Jatamansi",
            "Timur",
            "Himalayan Tea Herbs",
            "Medicinal Herbs",
            "Herbal Powders",
        ],
    ),
    ("Wellness Products", []),
]


def parse_product_entry(display: str) -> tuple[str, str]:
    """
    Split "Name (Local)" into name and local_name.
    Only treats a trailing (... ) as local_name; inner parentheses are not supported.
    """
    s = display.strip()
    m = re.match(r"^(.+?)\s*\(([^)]+)\)\s*$", s)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return s, ""


class Command(BaseCommand):
    help = "Create six PiOra root categories and seed products under each (idempotent)."

    def add_arguments(self, parser):
        parser.add_argument(
            "--purge-legacy-child-categories",
            action="store_true",
            help=(
                "Move products off legacy child categories (old seed) onto their parent root, "
                "then delete all non-root ProductCategory rows. Do not use if you rely on subcategories."
            ),
        )
    def _placeholder_bytes(self) -> bytes:
        path = Path(__file__).resolve().parents[2] / "data" / "piora_placeholder.png"
        if not path.is_file():
            raise CommandError(
                f"Missing {path}. Add products/data/piora_placeholder.png "
                "or run from a checkout that includes it."
            )
        return path.read_bytes()

    def _resolve_seller(self):
        seller = User.objects.filter(is_superuser=True).first() or User.objects.order_by("id").first()
        if not seller:
            raise CommandError(
                "No user found. Create a superuser first: python manage.py createsuperuser"
            )
        return seller

    def _migrate_legacy_child_categories(self) -> int:
        """
        Old seed stored product names as ProductCategory children. Move products to the parent root and delete children.
        """
        children = list(ProductCategory.objects.exclude(parent=None).select_related("parent"))
        if not children:
            return 0
        moved = 0
        for child in children:
            n = Product.objects.filter(category=child).update(category=child.parent)
            moved += n
        deleted, _ = ProductCategory.objects.exclude(parent=None).delete()
        if moved:
            self.stdout.write(
                self.style.WARNING(
                    f"Migrated {moved} product(s) from legacy child categories onto their parent roots."
                )
            )
        if deleted:
            self.stdout.write(
                self.style.WARNING(f"Removed {deleted} legacy child ProductCategory row(s).")
            )
        return deleted

    def handle(self, *args, **options):
        raw = self._placeholder_bytes()
        seller = self._resolve_seller()

        if options["purge_legacy_child_categories"]:
            self._migrate_legacy_child_categories()

        ProductCategory.objects.get_or_create(name="Others", parent=None, defaults={"icon": None})

        new_roots = 0
        new_products = 0
        updated_local = 0

        for root_name, product_entries in PIORA_CATEGORY_TREE:
            root, created = ProductCategory.objects.get_or_create(
                name=root_name,
                parent=None,
                defaults={"icon": None},
            )
            if created:
                new_roots += 1
                self.stdout.write(self.style.SUCCESS(f"Root category: {root.name}"))
            else:
                self.stdout.write(f"Root exists: {root.name}")

            for display in product_entries:
                name, local_name = parse_product_entry(display)

                existing = Product.objects.filter(name=name, category=root).first()
                if existing:
                    if local_name and existing.local_name != local_name:
                        existing.local_name = local_name
                        existing.save(update_fields=["local_name"])
                        updated_local += 1
                        self.stdout.write(f"  ~ {name} (local_name -> {local_name!r})")
                    else:
                        self.stdout.write(f"  . {name}")
                    continue

                product = Product(
                    seller=seller,
                    category=root,
                    name=name,
                    local_name=local_name,
                    desc="",
                    price=Decimal("1.00"),
                    quantity=0,
                )
                product.image.save(
                    "piora_placeholder.png",
                    ContentFile(raw),
                    save=True,
                )
                new_products += 1
                loc = f" [{local_name}]" if local_name else ""
                self.stdout.write(self.style.SUCCESS(f"  + product: {name}{loc}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. New roots: {new_roots}, new products: {new_products}, "
                f"local_name updates: {updated_local}."
            )
        )
