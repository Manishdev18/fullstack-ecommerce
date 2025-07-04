from rest_framework import serializers
from django.core.files.base import ContentFile
import os

from products.models import Product, ProductCategory, Cart, CartItem


class ProductCategoryReadSerializer(serializers.ModelSerializer):
    """
    Serializer class for product categories
    """

    class Meta:
        model = ProductCategory
        fields = "__all__"


class ProductCategoryWriteSerializer(serializers.ModelSerializer):
    """
    Serializer class for writing product categories
    """
    
    icon = serializers.CharField(required=False, help_text="Local file path for category icon")

    class Meta:
        model = ProductCategory
        fields = ("name", "icon")

    def create(self, validated_data):
        icon_path = validated_data.pop('icon', None)
        instance = super().create(validated_data)
        
        if icon_path and os.path.exists(icon_path):
            with open(icon_path, 'rb') as f:
                file_name = os.path.basename(icon_path)
                instance.icon.save(file_name, ContentFile(f.read()), save=True)
        
        return instance

    def update(self, instance, validated_data):
        icon_path = validated_data.pop('icon', None)
        instance = super().update(instance, validated_data)
        
        if icon_path and os.path.exists(icon_path):
            with open(icon_path, 'rb') as f:
                file_name = os.path.basename(icon_path)
                instance.icon.save(file_name, ContentFile(f.read()), save=True)
        
        return instance


class ProductReadSerializer(serializers.ModelSerializer):
    """
    Serializer class for reading products
    """

    seller = serializers.CharField(source="seller.get_full_name", read_only=True)
    category = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = "__all__"


class ProductWriteSerializer(serializers.ModelSerializer):
    """
    Serializer class for writing products
    """

    seller = serializers.HiddenField(default=serializers.CurrentUserDefault())
    category = ProductCategoryWriteSerializer()
    image = serializers.CharField(required=True, help_text="Local file path for product image")

    class Meta:
        model = Product
        fields = (
            "seller",
            "category",
            "name",
            "desc",
            "image",
            "price",
            "quantity",
        )

    def create(self, validated_data):
        category = validated_data.pop("category")
        image_path = validated_data.pop('image', None)
        
        instance, created = ProductCategory.objects.get_or_create(**category)
        product = Product.objects.create(**validated_data, category=instance)
        
        if image_path and os.path.exists(image_path):
            with open(image_path, 'rb') as f:
                file_name = os.path.basename(image_path)
                product.image.save(file_name, ContentFile(f.read()), save=True)

        return product

    def update(self, instance, validated_data):
        image_path = validated_data.pop('image', None)
        
        if "category" in validated_data:
            nested_serializer = self.fields["category"]
            nested_instance = instance.category
            nested_data = validated_data.pop("category")
            nested_serializer.update(nested_instance, nested_data)

        instance = super(ProductWriteSerializer, self).update(instance, validated_data)
        
        if image_path and os.path.exists(image_path):
            with open(image_path, 'rb') as f:
                file_name = os.path.basename(image_path)
                instance.image.save(file_name, ContentFile(f.read()), save=True)

        return instance


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for cart items with product details
    """
    product = ProductReadSerializer(read_only=True)
    product_id = serializers.IntegerField(write_only=True)
    total_price = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ('id', 'product', 'product_id', 'quantity', 'total_price', 'created_at', 'updated_at')

    def validate_product_id(self, value):
        """
        Validate that the product exists
        """
        try:
            Product.objects.get(id=value)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product does not exist")
        return value

    def validate_quantity(self, value):
        """
        Validate that quantity is positive
        """
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate(self, data):
        """
        Validate that quantity doesn't exceed available stock
        """
        if 'product_id' in data and 'quantity' in data:
            product = Product.objects.get(id=data['product_id'])
            if data['quantity'] > product.quantity:
                raise serializers.ValidationError(
                    f"Only {product.quantity} items available in stock"
                )
        return data


class CartSerializer(serializers.ModelSerializer):
    """
    Serializer for cart with cart items
    """
    cart_items = CartItemSerializer(many=True, read_only=True)
    total_cost = serializers.ReadOnlyField()
    total_items = serializers.ReadOnlyField()
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Cart
        fields = ('id', 'user', 'cart_items', 'total_cost', 'total_items', 'created_at', 'updated_at')


class AddToCartSerializer(serializers.Serializer):
    """
    Serializer for adding items to cart
    """
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(default=1)

    def validate_product_id(self, value):
        """
        Validate that the product exists
        """
        try:
            Product.objects.get(id=value)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product does not exist")
        return value

    def validate_quantity(self, value):
        """
        Validate that quantity is positive
        """
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value

    def validate(self, data):
        """
        Validate that quantity doesn't exceed available stock
        """
        product = Product.objects.get(id=data['product_id'])
        if data['quantity'] > product.quantity:
            raise serializers.ValidationError(
                f"Only {product.quantity} items available in stock"
            )
        return data


class UpdateCartItemSerializer(serializers.Serializer):
    """
    Serializer for updating cart item quantity
    """
    quantity = serializers.IntegerField()

    def validate_quantity(self, value):
        """
        Validate that quantity is positive
        """
        if value <= 0:
            raise serializers.ValidationError("Quantity must be greater than 0")
        return value
