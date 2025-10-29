from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MovimentacaoViewSet, CategoriaViewSet, LembreteParcelaViewSet

router = DefaultRouter()
router.register(r'transacoes', MovimentacaoViewSet, basename='transacoes')
router.register(r'categorias', CategoriaViewSet, basename='categorias')
router.register(r'lembretes', LembreteParcelaViewSet, basename='lembretes')

urlpatterns = [
    path('', include(router.urls)),
]
