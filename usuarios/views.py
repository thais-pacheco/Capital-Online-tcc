import json
import bcrypt
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from .models import Usuario
from django.contrib.auth.decorators import login_required

@csrf_exempt
def cadastro(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            nome = data.get("nome")
            email = data.get("email")
            senha = data.get("senha")

            if not nome or not email or not senha:
                return JsonResponse({"error": "Preencha todos os campos."}, status=400)

            if Usuario.objects.filter(email=email).exists():
                return JsonResponse({"error": "Já existe um usuário com esse email."}, status=400)

            senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            Usuario.objects.create(nome=nome, email=email, senha=senha_hash)

            return JsonResponse({"success": "Cadastro realizado com sucesso!"})

        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

    return JsonResponse({"error": "Método não permitido"}, status=405)


@csrf_exempt
def login(request):
    if request.method != "POST":
        return JsonResponse({"error": "Método não permitido"}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "JSON inválido"}, status=400)

    email = data.get('email')
    senha = data.get('senha')

    if not email or not senha:
        return JsonResponse({"error": "Preencha todos os campos."}, status=400)

    try:
        user = Usuario.objects.get(email=email)
    except Usuario.DoesNotExist:
        return JsonResponse({"error": "Usuário não encontrado."}, status=400)

    if bcrypt.checkpw(senha.encode('utf-8'), user.senha.encode('utf-8')):
        return JsonResponse({
            "success": "Login realizado com sucesso!",
            "user": {"nome": user.nome, "email": user.email}
        })
    else:
        return JsonResponse({"error": "Senha incorreta."}, status=400)


@login_required(login_url="/auth/login")
def dashboard(request):
    return HttpResponse(f'Bem-vindo(a), {request.user.username}! Esta é a dashboard.')
