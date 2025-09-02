from rest_framework import viewsets
from .models import ObjetivoFinanceiro
from .serializers import ObjetivoFinanceiroSerializer

class ObjetivoFinanceiroViewSet(viewsets.ModelViewSet):
    queryset = ObjetivoFinanceiro.objects.all()
    serializer_class = ObjetivoFinanceiroSerializer
