from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovimentacaoViewSet, CategoriaViewSet

router = DefaultRouter()
router.register(r'transacoes', MovimentacaoViewSet, basename='transacoes')
router.register(r'categorias', CategoriaViewSet, basename='categorias')

urlpatterns = [
    path('', include(router.urls)),
]
