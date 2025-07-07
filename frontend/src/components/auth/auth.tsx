import React, { useState } from 'react';
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
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

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
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const endpoint = isLogin ? '/login/' : '/cadastrar/';
      const payload = isLogin 
        ? { email: formData.email, senha: formData.senha }
        : { nome: formData.nome, email: formData.email, senha: formData.senha };

      const response = await fetch(`http://localhost:8000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Success:', data);
        // Aqui você pode redirecionar ou salvar o token
      } else {
        const errorData = await response.json();
        console.error('Error:', errorData);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      confirmPassword: ''
    });
    setErrors({});
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

          <form onSubmit={handleSubmit} className="auth-form">
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
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
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
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <div className="loading-spinner"></div>
              ) : (
                isLogin ? 'Entrar' : 'Criar Conta'
              )}
            </button>
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