from rest_framework.decorators import api_view
from rest_framework.response import Response
from supabase import create_client
import os
from dotenv import load_dotenv

load_dotenv()

supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_KEY'))

@api_view(['GET', 'POST'])
def movimentacoes_view(request):
    if request.method == 'GET':
        try:
            response = supabase.from_('movimentacoes').select('*').execute()
            return Response(response.data)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    elif request.method == 'POST':
        try:
            data = request.data  # já é JSON graças ao DRF

            required_fields = ['tipo', 'descricao', 'valor', 'categoria', 'data']
            if not all(field in data for field in required_fields):
                return Response({'error': 'Campos obrigatórios faltando'}, status=400)
            
            insert_data = {
                'tipo': data['tipo'],
                'descricao': data['descricao'],
                'valor': data['valor'],
                'categoria': data['categoria'],
                'data': data['data'],
                'observacoes': data.get('observacoes', '')
            }

            response = supabase.from_('movimentacoes').insert(insert_data).execute()
            return Response(response.data, status=201)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

@api_view(['GET'])
def categorias_view(request):
    try:
        response = supabase.from_('categorias').select('*').execute()
        return Response(response.data)
    except Exception as e:
        return Response({'error': str(e)}, status=400)
