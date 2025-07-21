from django.db import models

class Movimentacao(models.Model):
    TIPO_CHOICES = (
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    )

    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    descricao = models.TextField()
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    data = models.DateField(auto_now_add=True)
    observacoes = models.TextField(blank=True, null=True)
    categoria = models.CharField(max_length=50)

    class Meta:
        db_table = 'movimentacoes'
        verbose_name_plural = 'Movimentações'

    def __str__(self):
        return f"{self.descricao} - {self.get_tipo_display()} - R${self.valor}"

class Categoria(models.Model):
    nome = models.CharField(max_length=50)
    tipo = models.CharField(max_length=10, choices=Movimentacao.TIPO_CHOICES)

    class Meta:
        db_table = 'categorias'

    def __str__(self):
        return self.nome
