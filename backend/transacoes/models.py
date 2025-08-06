from django.db import models

class Categoria(models.Model):
    TIPO_CHOICES = (
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    )
    nome = models.CharField(max_length=50)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)

    def __str__(self):
        return self.nome

    class Meta:
        db_table = 'categorias'  # nome da tabela no MySQL


class Transacao(models.Model):
    TIPO_CHOICES = (
        ('entrada', 'Entrada'),
        ('saida', 'Saída'),
    )

    titulo = models.CharField(max_length=100, db_column='descricao')  # mapear para coluna descricao no MySQL
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    tipo = models.CharField(max_length=10, choices=TIPO_CHOICES)
    categoria = models.ForeignKey(Categoria, on_delete=models.CASCADE, db_column='categoria_id')  # FK para categoria_id
    data = models.DateField()
    observacoes = models.TextField(blank=True)

    def __str__(self):
        return f'{self.titulo} - {self.valor} ({self.tipo})'

    class Meta:
        db_table = 'movimentacoes'  # nome da tabela no MySQL
