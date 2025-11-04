import resend
from django.conf import settings

def send_reset_code_email(email, nome, codigo):
    """Envia email com código de recuperação usando Resend"""
    try:
        resend.api_key = settings.RESEND_API_KEY
        
        params = {
            "from": "Capital Online <onboarding@resend.dev>",
            "to": [email],
            "subject": "Recuperação de Senha - Capital Online",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Olá {nome},</h2>
                    <p style="color: #666; font-size: 16px;">
                        Você solicitou a recuperação de senha da sua conta no Capital Online.
                    </p>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <p style="color: #666; margin-bottom: 10px;">Seu código de recuperação é:</p>
                        <p style="font-size: 32px; font-weight: bold; color: #4F46E5; letter-spacing: 8px; margin: 10px 0;">
                            {codigo}
                        </p>
                    </div>
                    <p style="color: #999; font-size: 14px;">
                        ⏱️ Este código expira em 15 minutos.
                    </p>
                    <p style="color: #999; font-size: 14px;">
                        Se você não solicitou esta recuperação, ignore este email.
                    </p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="color: #999; font-size: 14px;">
                        Atenciosamente,<br>
                        <strong>Equipe Capital Online</strong>
                    </p>
                </div>
            """
        }
        
        email_response = resend.Emails.send(params)
        print(f"✓ Resend resposta: {email_response}")
        return True, email_response
        
    except Exception as e:
        print(f"✗ Erro Resend: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return False, str(e)