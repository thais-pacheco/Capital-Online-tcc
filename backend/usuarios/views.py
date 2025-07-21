import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from config.supabase_client import supabase
import bcrypt
from django.contrib.auth.decorators import login_required

@csrf_exempt 
def cadastro(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)

            username = data.get("nome")
            email = data.get("email")
            senha = data.get("senha")

            if not username or not email or not senha:
                return JsonResponse({"error": "Preencha todos os campos."}, status=400)

            existing = supabase.from_("usuarios").select("email").eq("email", email).execute()
            if existing.data and len(existing.data) > 0:
                return JsonResponse({"error": "Já existe um usuário com esse email."}, status=400)

            senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

            response = supabase.from_("usuarios").insert({
                "nome": username,
                "email": email,
                "senha": senha_hash
            }).execute()

            if response.status_code in [200, 201]:
                return JsonResponse({"success": "Cadastro realizado com sucesso!"})
            else:
                return JsonResponse({"error": "Erro ao cadastrar"}, status=500)

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

    user_response = supabase.from_("usuarios").select("*").eq("email", email).execute()

    if not user_response.data or len(user_response.data) == 0:
        return JsonResponse({"error": "Usuário não encontrado."}, status=400)

    user = user_response.data[0]
    senha_hash = user['senha']

    if bcrypt.checkpw(senha.encode('utf-8'), senha_hash.encode('utf-8')):
        # Aqui você pode gerar um token JWT ou sessão para autenticação real
        return JsonResponse({"success": "Login realizado com sucesso!", "user": {"nome": user["nome"], "email": user["email"]}})
    else:
        return JsonResponse({"error": "Senha incorreta."}, status=400)


@login_required(login_url="/auth/login")
def dashboard(request):
    return HttpResponse(f'Bem-vindo(a), {request.user.username}! Esta é a dashboard.')
