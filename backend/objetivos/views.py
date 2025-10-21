from rest_framework import viewsets, permissions
from .models import ObjetivoFinanceiro
from .serializers import ObjetivoFinanceiroSerializer

class ObjetivoFinanceiroViewSet(viewsets.ModelViewSet):
    queryset = ObjetivoFinanceiro.objects.all()
    serializer_class = ObjetivoFinanceiroSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ObjetivoFinanceiro.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)