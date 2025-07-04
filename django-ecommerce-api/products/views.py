from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework import status

from products.models import Product, ProductCategory, Cart, CartItem
from products.permissions import IsSellerOrAdmin
from products.serializers import (
    ProductCategoryReadSerializer,
    ProductCategoryWriteSerializer,
    ProductReadSerializer,
    ProductWriteSerializer,
    CartSerializer,
    CartItemSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer,
)


class ProductCategoryViewSet(viewsets.ModelViewSet):
    """
    CRUD product categories
    """

    queryset = ProductCategory.objects.all()
    permission_classes = [AllowAny]  # Public access for categories

    def get_serializer_class(self):
        if self.action in ("create", "update", "partial_update", "destroy"):
            return ProductCategoryWriteSerializer

        return ProductCategoryReadSerializer


class ProductViewSet(ReadOnlyModelViewSet):
    """
    List and retrieve products - Public access, no authentication required
    """

    queryset = Product.objects.all()
    serializer_class = ProductReadSerializer
    permission_classes = [AllowAny]  # Public access for product listing


class CartViewSet(viewsets.GenericViewSet):
    """
    Cart management ViewSet - Requires authentication
    """
    permission_classes = [IsAuthenticated]  # Authentication required for cart operations
    serializer_class = CartSerializer

    def get_queryset(self):
        return Cart.objects.filter(user=self.request.user)

    def get_or_create_cart(self):
        """
        Get or create cart for the current user
        """
        cart, created = Cart.objects.get_or_create(user=self.request.user)
        print("cart", cart)
        return cart

    @action(detail=False, methods=['get'])
    def me(self, request):
        """
        Get current user's cart
        """
        print("request", request)
        cart = self.get_or_create_cart()
        serializer = self.get_serializer(cart)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def add_item(self, request):
        """
        Add item to cart
        """
        serializer = AddToCartSerializer(data=request.data)
        if serializer.is_valid():
            cart = self.get_or_create_cart()
            product = get_object_or_404(Product, id=serializer.validated_data['product_id'])
            quantity = serializer.validated_data['quantity']

            # Check if item already exists in cart
            cart_item, created = CartItem.objects.get_or_create(
                cart=cart,
                product=product,
                defaults={'quantity': quantity}
            )

            if not created:
                # Update quantity if item already exists
                new_quantity = cart_item.quantity + quantity
                if new_quantity > product.quantity:
                    return Response(
                        {'error': f'Only {product.quantity} items available in stock'},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                cart_item.quantity = new_quantity
                cart_item.save()

            # Return updated cart
            cart_serializer = CartSerializer(cart)
            return Response(cart_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['patch'])
    def update_item(self, request):
        """
        Update cart item quantity
        """
        item_id = request.data.get('item_id')
        if not item_id:
            return Response(
                {'error': 'item_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = self.get_or_create_cart()
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)

        serializer = UpdateCartItemSerializer(data=request.data)
        if serializer.is_valid():
            quantity = serializer.validated_data['quantity']
            
            # Check stock availability
            if quantity > cart_item.product.quantity:
                return Response(
                    {'error': f'Only {cart_item.product.quantity} items available in stock'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            cart_item.quantity = quantity
            cart_item.save()

            # Return updated cart
            cart_serializer = CartSerializer(cart)
            return Response(cart_serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['delete'])
    def remove_item(self, request):
        """
        Remove item from cart
        """
        item_id = request.data.get('item_id')
        if not item_id:
            return Response(
                {'error': 'item_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart = self.get_or_create_cart()
        cart_item = get_object_or_404(CartItem, id=item_id, cart=cart)
        cart_item.delete()

        # Return updated cart
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)

    @action(detail=False, methods=['delete'])
    def clear(self, request):
        """
        Clear all items from cart
        """
        cart = self.get_or_create_cart()
        cart.cart_items.all().delete()

        # Return updated cart
        cart_serializer = CartSerializer(cart)
        return Response(cart_serializer.data)
