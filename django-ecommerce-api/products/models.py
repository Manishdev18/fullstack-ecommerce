from django.contrib.auth import get_user_model
from django.db import models
from django.utils.translation import gettext_lazy as _

User = get_user_model()


def category_image_path(instance, filename):
    return f"product/category/icons/{instance.name}/{filename}"


def product_image_path(instance, filename):
    return f"product/images/{instance.name}/{filename}"


class ProductCategory(models.Model):
    parent = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="children",
        verbose_name=_("Parent category"),
    )
    name = models.CharField(_("Category name"), max_length=100)
    icon = models.ImageField(
        upload_to=category_image_path,
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = _("Product Category")
        verbose_name_plural = _("Product Categories")
        constraints = [
            models.UniqueConstraint(
                fields=("name",),
                condition=models.Q(parent__isnull=True),
                name="products_category_unique_root_name",
            ),
            models.UniqueConstraint(
                fields=("parent", "name"),
                condition=models.Q(parent__isnull=False),
                name="products_category_unique_child_name",
            ),
        ]

    def __str__(self):
        if self.parent_id:
            return f"{self.parent.name} › {self.name}"
        return self.name



def get_default_product_category():
    return ProductCategory.objects.get_or_create(name="Others", parent=None)[0]


class Product(models.Model):
    seller = models.ForeignKey(User, related_name="products", on_delete=models.CASCADE)
    category = models.ForeignKey(
        ProductCategory,
        related_name="product_list",
        on_delete=models.SET(get_default_product_category),
    )
    name = models.CharField(max_length=200)
    local_name = models.CharField(
        _("Local name"),
        max_length=200,
        blank=True,
        default="",
        help_text=_("Nepali or other local-language name (e.g. Badam, Kaju)."),
    )
    desc = models.TextField(_("Description"), blank=True)
    image = models.ImageField(upload_to=product_image_path)
    price = models.DecimalField(decimal_places=2, max_digits=10)
    quantity = models.IntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return self.name


class Cart(models.Model):
    user = models.OneToOneField(User, related_name="cart", on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)

    def __str__(self):
        return f"Cart for {self.user.get_full_name()}"

    @property
    def total_cost(self):
        """
        Calculate total cost of all items in the cart
        """
        return sum(item.total_price for item in self.cart_items.all())

    @property
    def total_items(self):
        """
        Calculate total number of items in the cart
        """
        return sum(item.quantity for item in self.cart_items.all())


class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name="cart_items", on_delete=models.CASCADE)
    product = models.ForeignKey(Product, related_name="cart_items", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ("-created_at",)
        unique_together = ("cart", "product")  # Ensure one product per cart

    def __str__(self):
        return f"{self.quantity} x {self.product.name} in {self.cart.user.get_full_name()}'s cart"

    @property
    def total_price(self):
        """
        Calculate total price for this cart item
        """
        return float(self.product.price) * self.quantity

    def clean(self):
        """
        Validate that quantity doesn't exceed available stock
        """
        from django.core.exceptions import ValidationError
        if self.quantity > self.product.quantity:
            raise ValidationError(f"Only {self.product.quantity} items available in stock")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)
