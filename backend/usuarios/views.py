from django.contrib.auth.hashers import make_password, check_password
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from django.conf import settings
import jwt
import json
import secrets
from .models import Usuario, PasswordResetToken

SECRET_KEY = settings.SECRET_KEY

@csrf_exempt
def register_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            nome = data.get("nome")
            email = data.get("email")
            password = data.get("password")

            if not nome or not email or not password:
                return JsonResponse({"error": "Todos os campos são obrigatórios."}, status=400)

            if Usuario.objects.filter(email=email).exists():
                return JsonResponse({"error": "Email já cadastrado."}, status=409)

            usuario = Usuario.objects.create_user(
                nome=nome,
                email=email,
                password=password
            )

            payload = {
                "id": usuario.id,
                "email": usuario.email,
                "exp": timezone.now() + timezone.timedelta(hours=12)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

            return JsonResponse({
                "message": "Usuário criado com sucesso!",
                "usuario": {
                    "id": usuario.id,
                    "nome": usuario.nome,
                    "email": usuario.email
                },
                "token": token
            }, status=201)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def login_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            password = data.get("password")

            if not email or not password:
                return JsonResponse({"error": "Email e senha são obrigatórios."}, status=400)

            usuario = Usuario.objects.filter(email=email).first()
            if usuario is None:
                return JsonResponse({"error": "Usuário não encontrado."}, status=404)

            if not usuario.check_password(password):
                return JsonResponse({"error": "Senha incorreta."}, status=401)

            payload = {
                "id": usuario.id,
                "email": usuario.email,
                "exp": timezone.now() + timezone.timedelta(hours=12)
            }
            token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

            return JsonResponse({
                "message": "Login realizado com sucesso!",
                "usuario": {
                    "id": usuario.id,
                    "nome": usuario.nome,
                    "email": usuario.email
                },
                "token": token
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def test_email_view(request):
    if request.method == "GET":
        try:
            print("=" * 60)
            print("TESTE DE EMAIL")
            print("=" * 60)
            print(f"RESEND_API_KEY presente: {bool(settings.RESEND_API_KEY)}")
            print("=" * 60)
            
            from .email_service import send_reset_code_email
            sucesso, resultado = send_reset_code_email('capitalonline.tcc@gmail.com', 'Teste', '123456')
            
            if sucesso:
                print(f"✓ Email enviado com sucesso!")
                return JsonResponse({
                    "success": True,
                    "message": "Email de teste enviado com sucesso!",
                    "result": str(resultado)
                }, status=200)
            else:
                return JsonResponse({
                    "success": False,
                    "error": str(resultado)
                }, status=500)
            
        except Exception as e:
            print(f"✗ ERRO: {str(e)}")
            import traceback
            print(traceback.format_exc())
            
            return JsonResponse({
                "success": False,
                "error": str(e),
                "error_type": type(e).__name__
            }, status=500)
    
    return JsonResponse({"error": "Use GET"}, status=405)


@csrf_exempt
def forgot_password_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")

            if not email:
                return JsonResponse({"error": "Email é obrigatório."}, status=400)

            usuario = Usuario.objects.filter(email=email).first()
            if not usuario:
                return JsonResponse({
                    "message": "Se o email existir, um código de recuperação será enviado."
                }, status=200)

            codigo = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
            
            PasswordResetToken.objects.filter(usuario=usuario).delete()
            
            expiracao = timezone.now() + timezone.timedelta(minutes=15)
            PasswordResetToken.objects.create(
                usuario=usuario,
                token=codigo,
                expira_em=expiracao
            )

            print(f"=" * 60)
            print(f"Enviando código para: {email}")
            print(f"Usuário: {usuario.nome}")
            print(f"Código: {codigo}")
            print(f"=" * 60)

            from .email_service import send_reset_code_email
            sucesso, resultado = send_reset_code_email(email, usuario.nome, codigo)
            
            if sucesso:
                print(f"✓ Email enviado com sucesso!")
                return JsonResponse({
                    "message": "Código de recuperação enviado para o email."
                }, status=200)
            else:
                print(f"✗ Falha ao enviar email: {resultado}")
                return JsonResponse({
                    "error": "Erro ao enviar email. Tente novamente."
                }, status=500)

        except Exception as e:
            print(f"✗ Erro geral: {str(e)}")
            import traceback
            print(traceback.format_exc())
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def verify_reset_code_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            codigo = data.get("codigo")

            if not email or not codigo:
                return JsonResponse({"error": "Email e código são obrigatórios."}, status=400)

            usuario = Usuario.objects.filter(email=email).first()
            if not usuario:
                return JsonResponse({"error": "Código inválido."}, status=400)

            token = PasswordResetToken.objects.filter(
                usuario=usuario,
                token=codigo,
                usado=False,
                expira_em__gt=timezone.now()
            ).first()

            if not token:
                return JsonResponse({"error": "Código inválido ou expirado."}, status=400)

            return JsonResponse({
                "message": "Código válido.",
                "valid": True
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def reset_password_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")
            codigo = data.get("codigo")
            nova_senha = data.get("nova_senha")

            if not email or not codigo or not nova_senha:
                return JsonResponse({"error": "Todos os campos são obrigatórios."}, status=400)

            if len(nova_senha) < 6:
                return JsonResponse({"error": "Senha deve ter pelo menos 6 caracteres."}, status=400)

            usuario = Usuario.objects.filter(email=email).first()
            if not usuario:
                return JsonResponse({"error": "Código inválido."}, status=400)

            token = PasswordResetToken.objects.filter(
                usuario=usuario,
                token=codigo,
                usado=False,
                expira_em__gt=timezone.now()
            ).first()

            if not token:
                return JsonResponse({"error": "Código inválido ou expirado."}, status=400)

            usuario.set_password(nova_senha)
            usuario.save()

            token.usado = True
            token.save()

            PasswordResetToken.objects.filter(usuario=usuario).exclude(id=token.id).delete()

            return JsonResponse({
                "message": "Senha alterada com sucesso!"
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def verify_token_view(request):
    if request.method == "GET":
        try:
            if hasattr(request, 'user') and request.user:
                usuario = request.user
                return JsonResponse({
                    "valid": True,
                    "usuario": {
                        "id": usuario.id,
                        "nome": usuario.nome,
                        "email": usuario.email,
                        "data_criacao": usuario.data_criacao.isoformat() if usuario.data_criacao else None
                    }
                }, status=200)
            else:
                return JsonResponse({
                    "valid": False,
                    "error": "Usuário não autenticado."
                }, status=401)

        except Exception as e:
            return JsonResponse({
                "error": f"Erro ao verificar token: {str(e)}"
            }, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def refresh_token_view(request):
    if request.method == "POST":
        try:
            if hasattr(request, 'user') and request.user:
                usuario = request.user
                
                payload = {
                    "id": usuario.id,
                    "email": usuario.email,
                    "exp": timezone.now() + timezone.timedelta(hours=12)
                }
                new_token = jwt.encode(payload, SECRET_KEY, algorithm="HS256")

                return JsonResponse({
                    "message": "Token renovado com sucesso!",
                    "token": new_token,
                    "expires_in": "12 horas"
                }, status=200)
            else:
                return JsonResponse({
                    "error": "Usuário não autenticado."
                }, status=401)

        except Exception as e:
            return JsonResponse({
                "error": f"Erro ao renovar token: {str(e)}"
            }, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)