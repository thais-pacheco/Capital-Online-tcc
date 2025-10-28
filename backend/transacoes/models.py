
from django.db import models
from django.conf import settings

class Categoria(models.Model):
    TIPO_CHOICES = (
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    )

    nome = models.CharField(max_length=100)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)

    def __str__(self):
        return f"{self.nome} ({self.tipo})"

    class Meta:
        db_table = 'categorias'


class Movimentacao(models.Model):
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.CASCADE)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, db_column='categoria_id')
    tipo = models.CharField(max_length=10, choices=Categoria.TIPO_CHOICES)
    descricao = models.CharField(max_length=255)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data_movimentacao = models.DateTimeField()
    observacoes = models.TextField(blank=True, null=True)
    forma_pagamento = models.CharField(max_length=20, default='avista')
    quantidade_parcelas = models.IntegerField(null=True, blank=True)
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.descricao} - {self.valor} ({self.tipo})"

    class Meta:
        db_table = 'movimentacoes'

class LembreteParcela(models.Model):
    movimentacao = models.ForeignKey(Movimentacao, on_delete=models.CASCADE, related_name='lembretes')
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.CASCADE)
    numero_parcela = models.IntegerField()
    total_parcelas = models.IntegerField()
    valor_parcela = models.DecimalField(max_digits=10, decimal_places=2)
    data_vencimento = models.DateField()
    titulo = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    pago = models.BooleanField(default=False)
    data_pagamento = models.DateField(null=True, blank=True)
    notificado = models.BooleanField(default=False)
    criado_em = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        status = "✓ Pago" if self.pago else "⏳ Pendente"
        return f"Parcela {self.numero_parcela}/{self.total_parcelas} - {self.titulo} - {status}"

    class Meta:
        db_table = 'lembretes_parcelas'
        ordering = ['data_vencimento']