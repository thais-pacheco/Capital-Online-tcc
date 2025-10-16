# usuarios/authentication.py
import jwt
from django.conf import settings
from rest_framework import authentication, exceptions
from .models import Usuario

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return None

        try:
            token_type, token = auth_header.split()
            if token_type.lower() != "bearer":
                return None

            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
            user = Usuario.objects.get(id=payload["id"])
            return (user, None)

        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed("Token expirado")
        except (jwt.InvalidTokenError, Usuario.DoesNotExist):
            raise exceptions.AuthenticationFailed("Token inválido")
