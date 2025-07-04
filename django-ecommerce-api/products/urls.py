from django.urls import include, path
from rest_framework.routers import DefaultRouter

from products.views import ProductCategoryViewSet, ProductViewSet, CartViewSet

app_name = "products"

router = DefaultRouter()
router.register(r"categories", ProductCategoryViewSet)
router.register(r"cart", CartViewSet, basename="cart")
router.register(r"", ProductViewSet)


urlpatterns = [
    path("", include(router.urls)),
]
