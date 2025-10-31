import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, Mail, Lock, ArrowLeft } from 'lucide-react';
import './auth.css';

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<'email' | 'code' | 'password'>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const navigate = useNavigate();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setMessage('Por favor, insira um email válido');
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/forgot-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Código enviado para seu email!');
        setIsError(false);
        setTimeout(() => setStep('code'), 1500);
      } else {
        setMessage(data.error || 'Erro ao enviar código');
        setIsError(true);
      }
    } catch (err) {
      setMessage('Erro na conexão com o servidor');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!code || code.length !== 6) {
      setMessage('Código deve ter 6 dígitos');
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/verify-reset-code/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo: code }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Código válido!');
        setIsError(false);
        setTimeout(() => setStep('password'), 1000);
      } else {
        setMessage(data.error || 'Código inválido ou expirado');
        setIsError(true);
      }
    } catch (err) {
      setMessage('Erro na conexão com o servidor');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!newPassword || newPassword.length < 6) {
      setMessage('Senha deve ter pelo menos 6 caracteres');
      setIsError(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage('Senhas não coincidem');
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/auth/reset-password/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, codigo: code, nova_senha: newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Senha alterada com sucesso!');
        setIsError(false);
        setTimeout(() => navigate('/'), 2000);
      } else {
        setMessage(data.error || 'Erro ao alterar senha');
        setIsError(true);
      }
    } catch (err) {
      setMessage('Erro na conexão com o servidor');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <PiggyBank className="logo-icon" />
            <span className="logo-text">Capital Online</span>
          </div>
          <h2 style={{ marginTop: '1rem', fontSize: '1.5rem' }}>
            {step === 'email' && 'Recuperar Senha'}
            {step === 'code' && 'Verificar Código'}
            {step === 'password' && 'Nova Senha'}
          </h2>
        </div>

        <div className="auth-form-container">
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="auth-form">
              <p style={{ marginBottom: '1.5rem', color: '#6b7280', textAlign: 'center' }}>
                Digite seu email para receber o código de recuperação
              </p>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu email"
                    autoComplete="email"
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <div className="loading-spinner"></div> : 'Enviar Código'}
              </button>

              {message && (
                <div style={{ marginTop: 12, color: isError ? 'red' : 'green', fontWeight: 'bold', textAlign: 'center' }}>
                  {message}
                </div>
              )}
            </form>
          )}

          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="auth-form">
              <p style={{ marginBottom: '1.5rem', color: '#6b7280', textAlign: 'center' }}>
                Digite o código de 6 dígitos enviado para {email}
              </p>

              <div className="form-group">
                <label htmlFor="code">Código</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    style={{ letterSpacing: '0.5rem', textAlign: 'center', fontSize: '1.5rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <div className="loading-spinner"></div> : 'Verificar Código'}
              </button>

              <button
                type="button"
                className="link-btn"
                onClick={() => setStep('email')}
                style={{ marginTop: '1rem', width: '100%' }}
              >
                Voltar
              </button>

              {message && (
                <div style={{ marginTop: 12, color: isError ? 'red' : 'green', fontWeight: 'bold', textAlign: 'center' }}>
                  {message}
                </div>
              )}
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleResetPassword} className="auth-form">
              <p style={{ marginBottom: '1.5rem', color: '#6b7280', textAlign: 'center' }}>
                Digite sua nova senha
              </p>

              <div className="form-group">
                <label htmlFor="newPassword">Nova Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Digite sua nova senha"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirme sua nova senha"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? <div className="loading-spinner"></div> : 'Alterar Senha'}
              </button>

              {message && (
                <div style={{ marginTop: 12, color: isError ? 'red' : 'green', fontWeight: 'bold', textAlign: 'center' }}>
                  {message}
                </div>
              )}
            </form>
          )}

          <div className="auth-footer">
            <button type="button" className="link-btn" onClick={() => navigate('/')}>
              <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
              Voltar para login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;