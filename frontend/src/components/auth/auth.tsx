import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, Eye, EyeOff, Mail, Lock, User, TrendingUp } from 'lucide-react';
import './auth.css';

interface FormData {
  nome?: string;
  email: string;
  senha: string;
  confirmPassword?: string;
}

interface FormErrors {
  nome?: string;
  email?: string;
  senha?: string;
  confirmPassword?: string;
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    email: '',
    senha: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [serverMessage, setServerMessage] = useState('');
  const [serverMessageIsError, setServerMessageIsError] = useState(false);

  const navigate = useNavigate();

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!isLogin && (!formData.nome || formData.nome.trim().length < 2)) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.senha || formData.senha.length < 6) {
      newErrors.senha = 'Senha deve ter pelo menos 6 caracteres';
    }

    if (!isLogin && formData.senha !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerMessage('');
    setServerMessageIsError(false);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login/' : '/auth/cadastro/';
      const payload = isLogin
        ? { email: formData.email, senha: formData.senha }
        : { nome: formData.nome, email: formData.email, senha: formData.senha };

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        credentials: 'include', // caso o backend use cookies (ajuste se não usar)
      });

      const data = await response.json();

      if (response.ok) {
        setServerMessage(data.success || 'Sucesso!');
        setServerMessageIsError(false);

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      } else {
        setServerMessage(data.error || 'Erro inesperado.');
        setServerMessageIsError(true);
      }
    } catch (error) {
      setServerMessage('Erro na conexão.');
      setServerMessageIsError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }

    if (serverMessage) {
      setServerMessage('');
      setServerMessageIsError(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      confirmPassword: '',
    });
    setErrors({});
    setServerMessage('');
    setServerMessageIsError(false);
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
            <PiggyBank className="logo-icon" style={{ color: '#22c55e' }} />
            <span className="logo-text">Capital Online</span>
          </div>

          <div className="tagline">
            <TrendingUp className="tagline-icon" />
            <span>Gerencie suas finanças com inteligência</span>
          </div>
        </div>

        <div className="auth-form-container">
          <div className="auth-toggle">
            <button
              type="button"
              className={`toggle-btn ${isLogin ? 'active' : ''}`}
              onClick={() => isLogin || toggleMode()}
            >
              Entrar
            </button>
            <button
              type="button"
              className={`toggle-btn ${!isLogin ? 'active' : ''}`}
              onClick={() => !isLogin || toggleMode()}
            >
              Cadastrar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form" autoComplete="off">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="nome">Nome Completo</label>
                <div className="input-wrapper">
                  <User className="input-icon" />
                  <input
                    type="text"
                    id="nome"
                    name="nome"
                    value={formData.nome || ''}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome completo"
                    className={errors.nome ? 'error' : ''}
                    autoComplete="name"
                  />
                </div>
                {errors.nome && <span className="error-message">{errors.nome}</span>}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Digite seu email"
                  className={errors.email ? 'error' : ''}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="senha"
                  name="senha"
                  value={formData.senha}
                  onChange={handleInputChange}
                  placeholder="Digite sua senha"
                  className={errors.senha ? 'error' : ''}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
              {errors.senha && <span className="error-message">{errors.senha}</span>}
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Senha</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword || ''}
                    onChange={handleInputChange}
                    placeholder="Confirme sua senha"
                    className={errors.confirmPassword ? 'error' : ''}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? <div className="loading-spinner"></div> : isLogin ? 'Entrar' : 'Criar Conta'}
            </button>

            {serverMessage && (
              <div
                style={{
                  marginTop: 12,
                  color: serverMessageIsError ? 'red' : 'green',
                  fontWeight: 'bold',
                  textAlign: 'center',
                }}
                role="alert"
              >
                {serverMessage}
              </div>
            )}
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}{' '}
              <button type="button" className="link-btn" onClick={toggleMode}>
                {isLogin ? 'Cadastre-se' : 'Faça login'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;