import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from config.supabase_client import supabase
from uuid import UUID

def _parse_response(response):
    """
    Função auxiliar para extrair dados e erro da resposta do supabase
    considerando que pode ser dict ou objeto.
    """
    data = None
    error = None

    if isinstance(response, dict):
        data = response.get("data")
        error = response.get("error")
    else:
        data = getattr(response, "data", None)
        error = getattr(response, "error", None)

    return data, error

@csrf_exempt
def objetivos_view(request):
    try:
        if request.method == "POST":
            data = json.loads(request.body)
            insert_data = {
                "usuario_id": data.get("usuario_id"),
                "titulo": data.get("titulo"),
                "descricao": data.get("descricao"),
                "valor_meta": data.get("valor_meta"),
                "valor_atual": data.get("valor_atual", 0),
                "data_vencimento": data.get("data_vencimento"),
                "status": data.get("status", "ativo")
            }

            if not insert_data["usuario_id"] or not insert_data["titulo"] or not insert_data["valor_meta"]:
                return JsonResponse({"error": "Campos usuario_id, titulo e valor_meta são obrigatórios."}, status=400)

            try:
                UUID(insert_data["usuario_id"])
            except:
                return JsonResponse({"error": "usuario_id deve ser um UUID válido."}, status=400)

            response = supabase.table("objetivos").insert(insert_data).execute()
            data, error = _parse_response(response)
            if error:
                return JsonResponse({"error": str(error)}, status=400)

            return JsonResponse({"message": "Objetivo criado com sucesso!", "id": data[0]["id"]}, status=201)

        elif request.method == "GET":
            usuario_id = request.GET.get("usuario_id")
            objetivo_id = request.GET.get("id")

            if objetivo_id:
                response = supabase.table("objetivos").select("*").eq("id", int(objetivo_id)).execute()
            elif usuario_id:
                response = supabase.table("objetivos").select("*").eq("usuario_id", usuario_id).execute()
            else:
                response = supabase.table("objetivos").select("*").execute()

            data, error = _parse_response(response)
            if error:
                return JsonResponse({"error": str(error)}, status=400)

            return JsonResponse({"objetivos": data}, status=200, safe=False)

        elif request.method == "PUT":
            data = json.loads(request.body)
            objetivo_id = data.get("id")
            if not objetivo_id:
                return JsonResponse({"error": "ID do objetivo é obrigatório para atualizar."}, status=400)

            update_data = {k: v for k, v in data.items() if k != "id" and v is not None}

            if not update_data:
                return JsonResponse({"error": "Nenhum dado para atualizar."}, status=400)

            response = supabase.table("objetivos").update(update_data).eq("id", int(objetivo_id)).execute()
            data, error = _parse_response(response)
            if error:
                return JsonResponse({"error": str(error)}, status=400)
            if not data:
                return JsonResponse({"error": "Objetivo não encontrado."}, status=404)

            return JsonResponse({"message": "Objetivo atualizado com sucesso!"}, status=200)

        elif request.method == "DELETE":
            data = json.loads(request.body)
            objetivo_id = data.get("id")
            if not objetivo_id:
                return JsonResponse({"error": "ID do objetivo é obrigatório para deletar."}, status=400)

            response = supabase.table("objetivos").delete().eq("id", int(objetivo_id)).execute()
            data, error = _parse_response(response)
            if error:
                return JsonResponse({"error": str(error)}, status=400)
            if not data:
                return JsonResponse({"error": "Objetivo não encontrado."}, status=404)

            return JsonResponse({"message": "Objetivo deletado com sucesso!"}, status=200)

        else:
            return JsonResponse({"error": "Método não permitido"}, status=405)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
