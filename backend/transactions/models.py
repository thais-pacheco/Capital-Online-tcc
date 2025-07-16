from django.db import models

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('income', 'Entrada'),
        ('expense', 'Saída'),
    )

    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES)
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    document = models.CharField(max_length=100)
    date = models.DateField()
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.description} - {self.type} - R${self.amount}"
