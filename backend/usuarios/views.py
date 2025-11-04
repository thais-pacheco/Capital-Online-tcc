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
            # Parse do JSON
            try:
                data = json.loads(request.body)
            except json.JSONDecodeError:
                return JsonResponse({"error": "JSON inválido"}, status=400)

            email = data.get("email")

            if not email:
                return JsonResponse({"error": "Email é obrigatório."}, status=400)

            # Busca o usuário
            try:
                usuario = Usuario.objects.filter(email=email).first()
            except Exception as db_error:
                print(f"✗ Erro ao buscar usuário: {str(db_error)}")
                return JsonResponse({"error": "Erro ao acessar banco de dados"}, status=500)

            if not usuario:
                # Por segurança, não revelar se o email existe ou não
                return JsonResponse({
                    "message": "Se o email existir, um código de recuperação será enviado."
                }, status=200)

            # Gera código de 6 dígitos
            codigo = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
            
            # Remove tokens antigos do usuário
            try:
                PasswordResetToken.objects.filter(usuario=usuario).delete()
            except Exception as del_error:
                print(f"⚠ Aviso ao deletar tokens antigos: {str(del_error)}")
                # Continua mesmo se não conseguir deletar tokens antigos
            
            # Cria novo token
            expiracao = timezone.now() + timezone.timedelta(minutes=15)
            
            try:
                PasswordResetToken.objects.create(
                    usuario=usuario,
                    token=codigo,
                    expira_em=expiracao
                )
            except Exception as token_error:
                print(f"✗ Erro ao criar token: {str(token_error)}")
                import traceback
                print(traceback.format_exc())
                return JsonResponse({
                    "error": "Erro ao criar código de recuperação. Verifique se a tabela existe."
                }, status=500)

            # Debug - logs detalhados
            print("=" * 60)
            print("DEBUG - FORGOT PASSWORD")
            print("=" * 60)
            print(f"EMAIL_BACKEND: {settings.EMAIL_BACKEND}")
            print(f"EMAIL_HOST: {settings.EMAIL_HOST}")
            print(f"EMAIL_PORT: {settings.EMAIL_PORT}")
            print(f"EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}")
            print(f"EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}")
            print(f"EMAIL_HOST_PASSWORD: {'*' * len(settings.EMAIL_HOST_PASSWORD)}")
            print(f"Destinatário: {email}")
            print(f"Usuário: {usuario.nome}")
            print(f"Código gerado: {codigo}")
            print(f"Token expira em: {expiracao}")
            print("=" * 60)

            # Envia email
            try:
                mensagem = f'''Olá {usuario.nome},

Você solicitou a recuperação de senha da sua conta no Capital Online.

Seu código de recuperação é: {codigo}

Este código expira em 15 minutos.

Se você não solicitou esta recuperação, ignore este email.

Atenciosamente,
Equipe Capital Online'''

                resultado = send_mail(
                    subject='Recuperação de Senha - Capital Online',
                    message=mensagem,
                    from_email=settings.EMAIL_HOST_USER,
                    recipient_list=[email],
                    fail_silently=False,
                )
                
                print(f"✓ Email enviado! Resultado: {resultado}")
                print("=" * 60)
                
                return JsonResponse({
                    "message": "Código de recuperação enviado para o email.",
                    "success": True
                }, status=200)
                
            except Exception as email_error:
                print("✗ ERRO AO ENVIAR EMAIL")
                print(f"Tipo do erro: {type(email_error).__name__}")
                print(f"Mensagem: {str(email_error)}")
                
                # Detalhes do erro SMTP
                import traceback
                print("Traceback completo:")
                traceback_str = traceback.format_exc()
                print(traceback_str)
                print("=" * 60)
                
                # Retorna erro mais específico
                error_msg = str(email_error)
                if "authentication" in error_msg.lower():
                    error_msg = "Erro de autenticação no servidor de email"
                elif "connection" in error_msg.lower():
                    error_msg = "Erro de conexão com servidor de email"
                elif "timeout" in error_msg.lower():
                    error_msg = "Timeout ao conectar no servidor de email"
                
                return JsonResponse({
                    "error": f"Erro ao enviar email: {error_msg}",
                    "details": str(email_error) if settings.DEBUG else None
                }, status=500)

        except Exception as e:
            print("✗ ERRO GERAL NA FUNÇÃO")
            print(f"Tipo do erro: {type(e).__name__}")
            print(f"Mensagem: {str(e)}")
            
            import traceback
            print("Traceback completo:")
            print(traceback.format_exc())
            print("=" * 60)
            
            return JsonResponse({
                "error": f"Erro interno: {str(e)}"
            }, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)
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
                return JsonResponse({
                    "message": "Se o email existir, um código de recuperação será enviado."
                }, status=200)

            # Gera código de 6 dígitos
            codigo = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
            
            # Remove tokens antigos
            PasswordResetToken.objects.filter(usuario=usuario).delete()
            
            # Cria novo token
            expiracao = timezone.now() + timezone.timedelta(minutes=15)
            PasswordResetToken.objects.create(
                usuario=usuario,
                token=codigo,
                expira_em=expiracao
            )

            print(f"Enviando email para {email} com código {codigo}")

            # Envia email usando Resend
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
def verify_token_view(request):
    """
    Endpoint para verificar se o token JWT é válido.
    O middleware já validou o token e adicionou request.user
    """
    if request.method == "GET":
        try:
            # O middleware já validou tudo, só retornamos os dados
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
    """
    Endpoint para renovar o token JWT (opcional, mas recomendado).
    Gera um novo token com 12 horas de validade.
    """
    if request.method == "POST":
        try:
            if hasattr(request, 'user') and request.user:
                usuario = request.user
                
                # Gera novo token com 12 horas de validade
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