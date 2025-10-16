from rest_framework import serializers
from .models import Categoria, Movimentacao

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'tipo']

class MovimentacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movimentacao
        fields = ['id', 'usuario', 'categoria', 'tipo', 'descricao', 'valor', 'data_movimentacao', 'observacoes', 'criado_em', 'atualizado_em']
        read_only_fields = ['usuario', 'criado_em', 'atualizado_em']
