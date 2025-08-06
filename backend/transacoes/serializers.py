from rest_framework import serializers
from .models import Transacao, Categoria

class TransacaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transacao
        fields = '__all__'

class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'
