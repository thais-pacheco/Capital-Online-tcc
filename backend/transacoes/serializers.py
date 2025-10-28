from rest_framework import serializers
from .models import Categoria, Movimentacao, LembreteParcela

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'tipo']


class LembreteParcelaSerializer(serializers.ModelSerializer):
    class Meta:
        model = LembreteParcela
        fields = [
            'id', 'movimentacao', 'usuario', 'numero_parcela', 
            'total_parcelas', 'valor_parcela', 'data_vencimento',
            'titulo', 'descricao', 'pago', 'data_pagamento', 
            'notificado', 'criado_em'
        ]
        read_only_fields = ['id', 'usuario', 'criado_em']  # 🆕 IMPORTANTE


class MovimentacaoSerializer(serializers.ModelSerializer):
    lembretes = LembreteParcelaSerializer(many=True, read_only=True)
    
    class Meta:
        model = Movimentacao
        fields = [
            'id', 'usuario', 'categoria', 'tipo', 'descricao', 'valor',
            'data_movimentacao', 'observacoes', 'forma_pagamento',
            'quantidade_parcelas', 'lembretes', 'criado_em', 'atualizado_em'
        ]
        read_only_fields = ['usuario', 'criado_em', 'atualizado_em']
