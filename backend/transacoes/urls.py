from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TransacaoViewSet, CategoriaViewSet, movimentacoes_list

router = DefaultRouter()
router.register(r'transacoes', TransacaoViewSet)
router.register(r'categorias', CategoriaViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('movimentacoes/', movimentacoes_list, name='movimentacoes-list'),
]