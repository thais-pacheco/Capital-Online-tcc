import React, { useState, useEffect } from 'react';
import { User, ArrowLeft, PiggyBank, Calendar, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CalendarPopup from '../calendario/CalendarPopup';
import NotificationsPopup from '../notificacoes/NotificationsPopup';
import './Profile.css';

interface ProfileProps {
  onLogout?: () => void;
}

export default function Profile({ onLogout }: ProfileProps) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [memberSince, setMemberSince] = useState('');
  
  // States para os popups
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  // 🔹 Buscar dados do usuário do localStorage
  useEffect(() => {
    const loadUserData = () => {
      const token = localStorage.getItem('token')?.replace(/"/g, '');
      const storedUser = localStorage.getItem('usuario');
      
      if (!token) {
        setError('Token não encontrado. Faça login novamente.');
        setLoading(false);
        navigate('/');
        return;
      }

      // Carregar dados do localStorage
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setFormData({
            name: user.nome || user.username || user.name || '',
            email: user.email || ''
          });

          // Definir email para o CalendarPopup
          setUserEmail(user.email || '');

          // Definir data de membro se existir
          if (user.date_joined || user.created_at) {
            const date = new Date(user.date_joined || user.created_at);
            setMemberSince(date.toLocaleDateString('pt-BR'));
          }
        } catch (e) {
          console.error('Erro ao carregar dados do localStorage:', e);
          setError('Erro ao carregar dados do perfil.');
        }
      } else {
        setError('Nenhum dado de usuário encontrado.');
      }

      setLoading(false);
    };

    loadUserData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
    setSuccess('');
  };

  // 🔹 Atualizar perfil no localStorage
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token')?.replace(/"/g, '');

    if (!token) {
      setError('Token não encontrado. Faça login novamente.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const storedUser = localStorage.getItem('usuario');
      const userToSave = storedUser ? JSON.parse(storedUser) : {};
      
      // Atualizar dados no localStorage
      userToSave.nome = formData.name;
      userToSave.email = formData.email;
      
      localStorage.setItem('usuario', JSON.stringify(userToSave));
      
      setSuccess('Perfil atualizado com sucesso!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Erro ao salvar no localStorage:', err);
      setError('Erro ao salvar alterações.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    if (onLogout) onLogout();
    else navigate('/');
  };

  if (loading && !formData.email) {
    return (
      <div className="profile-page">
        <div className="profile-loading">Carregando dados do perfil...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <header className="profile-header-bar">
        <div className="profile-header-container">
          <div className="profile-header-left">
            <div className="profile-logo">
              <div className="profile-logo-icon">
                <PiggyBank size={32} />
              </div>
              <span className="profile-logo-text">CAPITAL ONLINE</span>
            </div>
          </div>

          <div className="profile-header-center">
            <button className="profile-nav-button" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="profile-nav-button" onClick={() => navigate('/nova-movimentacao')}>Nova movimentação</button>
            <button className="profile-nav-button" onClick={() => navigate('/graficos')}>Gráficos</button>
            <button className="profile-nav-button" onClick={() => navigate('/objetivos')}>Objetivos</button>
          </div>

          <div className="profile-header-right">
            <button className="profile-icon-button" onClick={() => setIsCalendarOpen(true)}>
              <Calendar size={20} />
            </button>
            <button className="profile-icon-button" onClick={() => setIsNotificationsOpen(true)}>
              <Bell size={20} />
            </button>
            <div className="profile-avatar" onClick={() => navigate('/profile')}>
              <User size={20} />
            </div>
            <button className="profile-icon-button logout" onClick={handleLogoutClick}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <div className="profile-container">
        <div>
          <h1 className="profile-title">Meu perfil</h1>
          <p className="profile-subtitle">Gerencie suas informações pessoais e configurações da conta.</p>
        </div>

        {error && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '16px',
            backgroundColor: '#fee2e2',
            border: '1px solid #ef4444',
            borderRadius: '8px',
            color: '#991b1b'
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '12px 16px',
            marginBottom: '16px',
            backgroundColor: '#d1fae5',
            border: '1px solid #22c55e',
            borderRadius: '8px',
            color: '#065f46'
          }}>
            {success}
          </div>
        )}

        <div className="profile-grid">
          <div className="lg:col-span-1">
            <nav className="profile-sidebar-nav">
              <div className="profile-avatar-section">
                <div className="profile-avatar-circle">
                  {formData.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="profile-user-name">{formData.name || 'Usuário'}</div>
                <div className="profile-member-since">
                  {memberSince ? `Membro desde ${memberSince}` : 'Membro'}
                </div>
              </div>
              <button className="profile-sidebar-btn active">
                <User className="profile-sidebar-icon" />
                Perfil
              </button>
            </nav>
          </div>

          <div className="lg:col-span-3">
            <div className="profile-content-box">
              <div>
                <h2 className="profile-section-title">Informações pessoais</h2>
                <form onSubmit={handleProfileSubmit} className="profile-form-space">
                  <div>
                    <label className="profile-form-label">Nome completo:</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      className="profile-form-input"
                      required
                    />
                  </div>
                  <div>
                    <label className="profile-form-label">Email:</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email} 
                      onChange={handleInputChange} 
                      className="profile-form-input"
                      required
                    />
                  </div>
                  <div className="profile-form-actions">
                    <button 
                      type="submit" 
                      className="profile-btn-save"
                      disabled={loading}
                    >
                      <User className="profile-btn-icon" /> 
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popups */}
      <CalendarPopup 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)} 
        userEmail={userEmail} 
      />
      <NotificationsPopup 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </div>
  );
}