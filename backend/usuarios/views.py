from django.contrib.auth.hashers import make_password, check_password
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
from django.core.mail import send_mail
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

            # Cria o usuário usando create_user do manager
            usuario = Usuario.objects.create_user(
                nome=nome,
                email=email,
                password=password
            )

            # Gera token JWT
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
def forgot_password_view(request):
    """Envia email com código de recuperação de senha"""
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            email = data.get("email")

            if not email:
                return JsonResponse({"error": "Email é obrigatório."}, status=400)

            usuario = Usuario.objects.filter(email=email).first()
            if not usuario:
                # Por segurança, não revelar se o email existe ou não
                return JsonResponse({
                    "message": "Se o email existir, um código de recuperação será enviado."
                }, status=200)

            # Gera código de 6 dígitos
            codigo = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
            
            # Remove tokens antigos do usuário
            PasswordResetToken.objects.filter(usuario=usuario).delete()
            
            # Cria novo token
            expiracao = timezone.now() + timezone.timedelta(minutes=15)
            PasswordResetToken.objects.create(
                usuario=usuario,
                token=codigo,
                expira_em=expiracao
            )

            # Envia email
            try:
                send_mail(
                    subject='Recuperação de Senha - Capital Online',
                    message=f'''
Olá {usuario.nome},

Você solicitou a recuperação de senha da sua conta no Capital Online.

Seu código de recuperação é: {codigo}

Este código expira em 15 minutos.

Se você não solicitou esta recuperação, ignore este email.

Atenciosamente,
Equipe Capital Online
                    ''',
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                return JsonResponse({
                    "message": "Código de recuperação enviado para o email."
                }, status=200)
                
            except Exception as email_error:
                print(f"Erro ao enviar email: {email_error}")
                return JsonResponse({
                    "error": "Erro ao enviar email. Tente novamente mais tarde."
                }, status=500)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def verify_reset_code_view(request):
    """Verifica se o código de recuperação é válido"""
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
    """Reseta a senha usando o código de recuperação"""
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

            # Atualiza a senha
            usuario.set_password(nova_senha)
            usuario.save()

            # Marca o token como usado
            token.usado = True
            token.save()

            # Remove outros tokens do usuário
            PasswordResetToken.objects.filter(usuario=usuario).exclude(id=token.id).delete()

            return JsonResponse({
                "message": "Senha alterada com sucesso!"
            }, status=200)

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)