from rest_framework import serializers
from .models import Usuario
from django.contrib.auth import authenticate

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'nome', 'email', 'data_criacao']


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['nome', 'email', 'password']

    def create(self, validated_data):
        usuario = Usuario.objects.create_user(
            nome=validated_data['nome'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return usuario



class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    senha = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['senha'])
        if user is None:
            raise serializers.ValidationError("Credenciais inválidas.")
        return user
