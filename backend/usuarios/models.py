from django.db import models

class Usuario(models.Model):
    nome = models.CharField(max_length=100)
    email = models.CharField(max_length=150, unique=True)
    senha = models.CharField(max_length=255)
    data_criacao = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'usuarios'  