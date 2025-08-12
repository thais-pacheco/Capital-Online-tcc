from rest_framework import serializers
from .models import Transacao, Categoria

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = ['id', 'nome', 'tipo']

class TransacaoSerializer(serializers.ModelSerializer):
    categoria_nome = serializers.CharField(source='categoria.nome', read_only=True)
    
    class Meta:
        model = Transacao
        fields = ['id', 'titulo', 'valor', 'tipo', 'categoria', 'categoria_nome', 'data', 'observacoes']
        extra_kwargs = {
            'categoria': {'write_only': True}
        }
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return {
            'id': representation['id'],
            'data': representation['data'],
            'titulo': representation['titulo'],  # agora o campo volta como 'titulo'
            'categoria': representation['categoria_nome'],
            'valor': float(instance.valor),  # valor original com sinal
            'tipo': instance.tipo,           # tipo direto do modelo
            'documento': representation['observacoes'] or ''
        }
