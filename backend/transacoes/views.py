from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Transacao, Categoria
from .serializers import TransacaoSerializer, CategoriaSerializer

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class TransacaoViewSet(viewsets.ModelViewSet):
    queryset = Transacao.objects.all().order_by('-data')
    serializer_class = TransacaoSerializer

@api_view(['GET'])
def movimentacoes_list(request):
    transacoes = Transacao.objects.all().order_by('-data')
    serializer = TransacaoSerializer(transacoes, many=True)
    return Response(serializer.data)