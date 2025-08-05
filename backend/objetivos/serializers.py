from rest_framework import serializers
from .models import ObjetivoFinanceiro

class ObjetivoFinanceiroSerializer(serializers.ModelSerializer):
    class Meta:
        model = ObjetivoFinanceiro
        fields = '__all__'