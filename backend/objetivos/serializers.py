from rest_framework import serializers
from .models import ObjetivoFinanceiro

class ObjetivoFinanceiroSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetivoFinanceiro
        fields = ['id', 'usuario', 'titulo', 'descricao', 'valor', 'valor_atual', 'data_limite', 'categoria', 'criado_em']
        read_only_fields = ['usuario', 'criado_em']