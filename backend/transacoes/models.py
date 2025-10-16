from django.db import models
from django.conf import settings

class Categoria(models.Model):
    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10, choices=[('entrada', 'Entrada'), ('saida', 'Saída')])

    def __str__(self):
        return f"{self.nome} ({self.tipo})"


class Movimentacao(models.Model):
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.CASCADE)
    categoria = models.ForeignKey('Categoria', on_delete=models.CASCADE)
    tipo = models.CharField(max_length=7)
    descricao = models.CharField(max_length=255)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_movimentacao = models.DateTimeField()
    observacoes = models.TextField(blank=True, null=True)
    criado_em = models.DateTimeField()
    atualizado_em = models.DateTimeField()

    class Meta:
        db_table = 'movimentacoes'

    def __str__(self):
        return f"{self.tipo} - {self.valor} ({self.usuario})"
