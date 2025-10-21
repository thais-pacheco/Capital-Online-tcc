from rest_framework import viewsets, permissions
from .models import Categoria, Movimentacao
from .serializers import CategoriaSerializer, MovimentacaoSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]


class MovimentacaoViewSet(viewsets.ModelViewSet):
    serializer_class = MovimentacaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Movimentacao.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)