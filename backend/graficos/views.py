from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from transacoes.models import Movimentacao  # ← corrigido aqui!
import calendar

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overview(request):
    user = request.user
    dados_mensais = []

    for i in range(1, 13):
        mes_nome = calendar.month_name[i]
        entradas = (
            Movimentacao.objects.filter(usuario=user, data__month=i, tipo='entrada')
            .aggregate(total=Sum('valor'))['total'] or 0
        )
        saidas = (
            Movimentacao.objects.filter(usuario=user, data__month=i, tipo='saida')
            .aggregate(total=Sum('valor'))['total'] or 0
        )

        dados_mensais.append({
            'mes': mes_nome,
            'entradas': float(entradas),
            'saidas': float(saidas)
        })

    total_entradas = sum(d['entradas'] for d in dados_mensais)
    total_saidas = sum(d['saidas'] for d in dados_mensais)
    saldo = total_entradas - total_saidas

    return Response({
        'mensal': dados_mensais,
        'total_entradas': total_entradas,
        'total_saidas': total_saidas,
        'saldo': saldo
    })
