from django.contrib import admin
from django.urls import path, include
from transactions.views import movimentacoes_view, categorias_view  
urlpatterns = [
    path('admin/', admin.site.urls),  
    path('auth/', include('usuarios.urls')),  
    
    path('movimentacoes/', movimentacoes_view, name='movimentacoes'),
    path('categorias/', categorias_view, name='categorias'),
]