from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    
    path('forgot-password/', views.forgot_password_view, name='forgot_password'),
    path('verify-reset-code/', views.verify_reset_code_view, name='verify_reset_code'),
    path('reset-password/', views.reset_password_view, name='reset_password'),
    
    path('verify-token/', views.verify_token_view, name='verify_token'),
    path('refresh-token/', views.refresh_token_view, name='refresh_token'),
    path('test-email/', views.test_email_view, name='test_email'),
]