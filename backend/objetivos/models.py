from django.db import models
from django.conf import settings

class ObjetivoFinanceiro(models.Model):
    CATEGORIA_CHOICES = (
        ('investimento', 'Investimento'),
        ('compra', 'Compra'),
        ('viagem', 'Viagem'),
        ('educacao', 'Educação'),
        ('emergencia', 'Emergência'),
        ('outro', 'Outro'),
    )
    
    usuario = models.ForeignKey('usuarios.Usuario', on_delete=models.CASCADE, db_column='user_id')
    titulo = models.CharField(max_length=100)
    descricao = models.TextField(blank=True, null=True)
    valor = models.DecimalField(max_digits=10, decimal_places=2)
    valor_atual = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    data_limite = models.DateField(blank=True, null=True)
    categoria = models.CharField(max_length=50, choices=CATEGORIA_CHOICES, default='outro')
    criado_em = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.titulo} - R$ {self.valor}"
    
    class Meta:
        db_table = 'objetivos_financeiros'
        ordering = ['-criado_em']