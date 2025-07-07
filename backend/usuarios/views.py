from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login as login_django
from django.contrib.auth.decorators import login_required
from .supabase_client import supabase
import bcrypt


def cadastro(request):
    if request.method == "GET":
        return render(request, 'cadastro.html')

    username = request.POST.get('username')
    email = request.POST.get('email')
    senha = request.POST.get('senha')

    if not username or not email or not senha:
        return HttpResponse("Preencha todos os campos.", status=400)

    # Verifica se o email já existe no Supabase
    existing = supabase.from_("usuarios").select("email").eq("email", email).execute()
    if existing.data and len(existing.data) > 0:
        return HttpResponse("Já existe um usuário com esse email.", status=400)

    # Criptografa a senha
    senha_hash = bcrypt.hashpw(senha.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Insere no Supabase
    response = supabase.from_("usuarios").insert({
        "nome": username,
        "email": email,
        "senha": senha_hash
    }).execute()

    if response.status_code == 201:
        return HttpResponse("Usuário cadastrado com sucesso!")
    else:
        return HttpResponse(f"Erro ao cadastrar: {response.data}", status=500)


# Se quiser continuar usando o login padrão Django, precisa manter a tabela do Django User, 
# mas para autenticar via Supabase teria que criar sua própria lógica de autenticação.
# Login usando Django interno (padrão):
def login(request):
    if request.method == "GET":
        return render(request, 'login.html')
    else:
        username = request.POST.get('username')
        senha = request.POST.get('senha')

        user = authenticate(username=username, password=senha)

        if user:
            login_django(request, user)
            return redirect('plataforma')
        else:
            return HttpResponse('Usuário ou senha inválidos')


@login_required(login_url="/auth/login")
def plataforma(request):
    return HttpResponse(f'Bem-vindo(a), {request.user.username}! Esta é a plataforma.')
