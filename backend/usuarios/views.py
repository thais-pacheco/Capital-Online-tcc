from django.contrib.auth.hashers import make_password, check_password
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.utils import timezone
import jwt
from django.conf import settings
import json
from .models import Usuario

SECRET_KEY = settings.SECRET_KEY

@csrf_exempt
def register_view(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            nome = data.get("nome")
            email = data.get("email")
            password = data.get("password")  # 🔑 usar 'password', não 'senha'

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
            password = data.get("password")  # 🔑 usar 'password', não 'senha'

            if not email or not password:
                return JsonResponse({"error": "Email e senha são obrigatórios."}, status=400)

            usuario = Usuario.objects.filter(email=email).first()
            if usuario is None:
                return JsonResponse({"error": "Usuário não encontrado."}, status=404)

            if not usuario.check_password(password):  # 🔑 AbstractBaseUser usa check_password
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