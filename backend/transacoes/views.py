from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Categoria, Movimentacao, LembreteParcela
from .serializers import CategoriaSerializer, MovimentacaoSerializer, LembreteParcelaSerializer
from datetime import datetime, timedelta, date
from dateutil.relativedelta import relativedelta
from decimal import Decimal

class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer
    permission_classes = [permissions.IsAuthenticated]


class MovimentacaoViewSet(viewsets.ModelViewSet):
    serializer_class = MovimentacaoSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Movimentacao.objects.filter(usuario=self.request.user).prefetch_related('lembretes')

    def perform_create(self, serializer):
        movimentacao = serializer.save(usuario=self.request.user)
        
        # NÃO criar lembretes automaticamente aqui
        # Os lembretes serão criados pelo frontend quando o usuário marcar a opção
        # if movimentacao.forma_pagamento == 'parcelado' and movimentacao.quantidade_parcelas:
        #     self.criar_lembretes_parcelas(movimentacao)

    def criar_lembretes_parcelas(self, movimentacao):
        """Cria lembretes para cada parcela da movimentação"""
        quantidade_parcelas = movimentacao.quantidade_parcelas
        valor_parcela = movimentacao.valor / Decimal(quantidade_parcelas)
        data_base = movimentacao.data_movimentacao.date()
        
        # Pegar o dia do lembrete da request (se fornecido)
        dia_lembrete = self.request.data.get('dia_lembrete', data_base.day)
        
        for i in range(quantidade_parcelas):
            # Calcular data de vencimento
            data_vencimento = data_base + relativedelta(months=i)
            
            # Ajustar para o dia escolhido
            try:
                data_vencimento = data_vencimento.replace(day=int(dia_lembrete))
            except ValueError:
                # Se o dia não existe no mês, usar o último dia
                data_vencimento = data_vencimento.replace(day=28)
            
            # Se a primeira parcela já passou, adicionar um mês
            if i == 0 and data_vencimento < datetime.now().date():
                data_vencimento = data_vencimento + relativedelta(months=1)
            
            # Criar o lembrete
            emoji = '📈' if movimentacao.tipo == 'entrada' else '📉'
            LembreteParcela.objects.create(
                movimentacao=movimentacao,
                usuario=movimentacao.usuario,
                numero_parcela=i + 1,
                total_parcelas=quantidade_parcelas,
                valor_parcela=valor_parcela,
                data_vencimento=data_vencimento,
                titulo=f"{emoji} Parcela {i + 1}/{quantidade_parcelas}: {movimentacao.descricao}",
                descricao=f"Valor: R$ {valor_parcela:.2f}\nTotal: R$ {movimentacao.valor:.2f}\n{movimentacao.observacoes or ''}"
            )


class LembreteParcelaViewSet(viewsets.ModelViewSet):
    serializer_class = LembreteParcelaSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = LembreteParcela.objects.filter(usuario=self.request.user)
        
        # Filtros opcionais
        mes = self.request.query_params.get('mes', None)
        ano = self.request.query_params.get('ano', None)
        pago = self.request.query_params.get('pago', None)
        
        if mes and ano:
            queryset = queryset.filter(
                data_vencimento__month=mes,
                data_vencimento__year=ano
            )
        
        if pago is not None:
            queryset = queryset.filter(pago=pago.lower() == 'true')
        
        return queryset

    def perform_create(self, serializer):
        """Associa o usuário automaticamente ao criar lembrete"""
        serializer.save(usuario=self.request.user)

    @action(detail=True, methods=['post'])
    def marcar_pago(self, request, pk=None):
        """Marca uma parcela como paga"""
        lembrete = self.get_object()
        lembrete.pago = True
        lembrete.data_pagamento = datetime.now().date()
        lembrete.save()
        
        serializer = self.get_serializer(lembrete)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def marcar_pendente(self, request, pk=None):
        """Marca uma parcela como pendente"""
        lembrete = self.get_object()
        lembrete.pago = False
        lembrete.data_pagamento = None
        lembrete.save()
        
        serializer = self.get_serializer(lembrete)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def marcar_notificado(self, request, pk=None):
        """🆕 Marca um lembrete como notificado (dispensar notificação)"""
        lembrete = self.get_object()
        
        # Verifica se o modelo tem o campo notificado
        if hasattr(lembrete, 'notificado'):
            lembrete.notificado = True
            lembrete.save()
            serializer = self.get_serializer(lembrete)
            return Response(serializer.data)
        else:
            return Response(
                {'detail': 'Campo notificado não existe no modelo. Execute as migrações.'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def notificacoes(self, request):
        """🆕 Retorna lembretes não pagos e não notificados dos próximos 7 dias"""
        hoje = date.today()
        limite = hoje + timedelta(days=7)
        
        # Filtra lembretes não pagos com vencimento até 7 dias
        queryset = LembreteParcela.objects.filter(
            usuario=request.user,
            pago=False,
            data_vencimento__lte=limite
        )
        
        # Se o campo notificado existir, filtra também
        if hasattr(LembreteParcela, 'notificado'):
            queryset = queryset.filter(notificado=False)
        
        lembretes = queryset.order_by('data_vencimento')
        
        serializer = self.get_serializer(lembretes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def proximos(self, request):
        """Retorna lembretes dos próximos 30 dias"""
        hoje = datetime.now().date()
        limite = hoje + timedelta(days=30)
        
        lembretes = LembreteParcela.objects.filter(
            usuario=request.user,
            data_vencimento__gte=hoje,
            data_vencimento__lte=limite,
            pago=False
        ).order_by('data_vencimento')
        
        serializer = self.get_serializer(lembretes, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def atrasados(self, request):
        """Retorna lembretes atrasados"""
        hoje = datetime.now().date()
        
        lembretes = LembreteParcela.objects.filter(
            usuario=request.user,
            data_vencimento__lt=hoje,
            pago=False
        ).order_by('data_vencimento')
        
        serializer = self.get_serializer(lembretes, many=True)
        return Response(serializer.data)