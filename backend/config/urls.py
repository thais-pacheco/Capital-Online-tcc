from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home(request):
    return HttpResponse("Bem-vindo ao Capital Online!")

urlpatterns = [
    path('', home),  # Rota da raiz
    path('admin/', admin.site.urls),
    path('auth/', include('usuarios.urls')),
    path('api/transacoes/', include('transacoes.urls')),
    path('api/objetivos/', include('objetivos.urls')),
]
