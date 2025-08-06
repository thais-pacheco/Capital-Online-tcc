from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransacaoViewSet, CategoriaViewSet

router = DefaultRouter()
router.register(r'transacoes', TransacaoViewSet)
router.register(r'categorias', CategoriaViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
