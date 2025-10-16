from functools import wraps
from django.http import JsonResponse
import jwt
from .models import Usuario
from django.conf import settings

def token_required(view_func):
    @wraps(view_func)
    def wrapper(request, *args, **kwargs):
        token = request.headers.get("Authorization")
        if not token:
            return JsonResponse({"error": "Token não fornecido"}, status=403)
        try:
            token = token.split(" ")[1]
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            request.user = Usuario.objects.get(id=payload["user_id"])
        except:
            return JsonResponse({"error": "Token inválido"}, status=403)
        return view_func(request, *args, **kwargs)
    return wrapper
