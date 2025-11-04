from django.http import JsonResponse
from django.conf import settings
from django.utils import timezone
import jwt
from .models import Usuario

class JWTAuthenticationMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        public_paths = [
            '/api/auth/register/',
            '/api/auth/login/',
            '/api/auth/forgot-password/',     
            '/api/auth/verify-reset-code/',
            '/api/auth/reset-password/',           
            '/api/auth/test-email/', 
            '/admin/',
            '/static/',
            '/media/',
        ]

        if any(request.path.startswith(path) for path in public_paths):
            return self.get_response(request)

        if request.method == 'OPTIONS':
            return self.get_response(request)

        auth_header = request.headers.get('Authorization', '')
        
        if not auth_header.startswith('Bearer '):
            return JsonResponse({
                'error': 'Token de autenticação não fornecido.',
                'detail': 'Envie o token no formato: Authorization: Bearer <token>'
            }, status=401)

        token = auth_header.replace('Bearer ', '').strip().replace('"', '')

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            
            user_id = payload.get('id')
            if not user_id:
                return JsonResponse({
                    'error': 'Token inválido.',
                    'detail': 'Token não contém ID do usuário.'
                }, status=401)

            usuario = Usuario.objects.filter(id=user_id, is_active=True).first()
            
            if not usuario:
                return JsonResponse({
                    'error': 'Usuário não encontrado ou inativo.',
                    'detail': 'O usuário associado ao token não existe ou está desativado.'
                }, status=401)

            request.user = usuario
            request.user_id = usuario.id

        except jwt.ExpiredSignatureError:
            return JsonResponse({
                'error': 'Token expirado.',
                'detail': 'Seu token expirou. Faça login novamente.'
            }, status=401)
            
        except jwt.InvalidTokenError as e:
            return JsonResponse({
                'error': 'Token inválido.',
                'detail': f'O token fornecido é inválido: {str(e)}'
            }, status=401)
            
        except Exception as e:
            return JsonResponse({
                'error': 'Erro ao validar token.',
                'detail': str(e)
            }, status=500)

        response = self.get_response(request)
        return response