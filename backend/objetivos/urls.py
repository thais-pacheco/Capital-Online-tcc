from django.urls import path
from . import views

urlpatterns = [
    path('objetivos/', views.objetivos_view, name='objetivos'),
]

