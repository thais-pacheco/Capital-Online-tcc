from django.urls import path
from .views import transactions_view, transaction_detail

urlpatterns = [
    path('', transactions_view, name='transactions-list-create'),
    path('<int:pk>/', transaction_detail, name='transaction-detail'),
]