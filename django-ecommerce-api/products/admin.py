from django.contrib import admin

from products.models import Product, ProductCategory, Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items', 'total_cost', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    inlines = [CartItemInline]


class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity', 'total_price', 'created_at')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('product__name', 'cart__user__email')


admin.site.register(ProductCategory)
admin.site.register(Product)
admin.site.register(Cart, CartAdmin)
admin.site.register(CartItem, CartItemAdmin)
