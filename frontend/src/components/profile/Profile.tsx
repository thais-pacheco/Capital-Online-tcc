import React, { useState } from 'react';
import { User, Lock, ArrowLeft, PiggyBank, Calendar, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

interface ProfileProps {
  onLogout?: () => void;
}

export default function Profile({ onLogout }: ProfileProps) {
  const navigate = useNavigate();

  // Dados mockados do usuário
  const user = {
    name: 'João Silva',
    email: 'joao@exemplo.com'
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    birthdate: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Profile updated:', formData);
    alert('Perfil atualizado com sucesso!');
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'security', name: 'Segurança', icon: Lock }
  ];

  const handleLogoutClick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="profile-page">
      {/* Header */}
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
            <button className="profile-icon-button"><Calendar size={20} /></button>
            <button className="profile-icon-button"><Bell size={20} /></button>
            <div className="profile-avatar" onClick={() => navigate('/profile')}><User size={20} /></div>
            <button className="profile-icon-button logout" onClick={handleLogoutClick}><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="profile-container">
        <div className="profile-header">
          <a href="#" onClick={() => navigate('/dashboard')} className="profile-back-button">
            <ArrowLeft className="profile-back-icon" /> Voltar ao Dashboard
          </a>
        </div>

        <div>
          <h1 className="profile-title">Meu perfil</h1>
          <p className="profile-subtitle">Gerencie suas informações pessoais e configurações da conta.</p>
        </div>

        <div className="profile-grid">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="profile-sidebar-nav">
              <div className="profile-avatar-section">
                <div className="profile-avatar-circle">J</div>
                <div className="profile-user-name">Julia Silva</div>
                <div className="profile-member-since">Membro desde 14/01/2024</div>
              </div>
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as 'profile' | 'security')}
                    className={`profile-sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon className="profile-sidebar-icon" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Conteúdo principal */}
          <div className="lg:col-span-3">
            <div className="profile-content-box">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="profile-section-title">Informações pessoais</h2>
                  <form onSubmit={handleSubmit} className="profile-form-space">
                    <div>
                      <label className="profile-form-label">Nome completo:</label>
                      <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="profile-form-input" />
                    </div>
                    <div>
                      <label className="profile-form-label">Telefone:</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="profile-form-input" />
                    </div>
                    <div>
                      <label className="profile-form-label">Data de nascimento:</label>
                      <input type="date" name="birthdate" value={formData.birthdate} onChange={handleInputChange} className="profile-form-input" />
                    </div>
                    <div>
                      <label className="profile-form-label">Email:</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="profile-form-input" />
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="profile-section-title">Segurança</h2>
                  <form onSubmit={handleSubmit} className="profile-form-space">
                    <div>
                      <label className="profile-form-label">Senha Atual</label>
                      <input type="password" name="currentPassword" value={formData.currentPassword} onChange={handleInputChange} className="profile-form-input" />
                    </div>
                    <div>
                      <label className="profile-form-label">Nova Senha</label>
                      <input type="password" name="newPassword" value={formData.newPassword} onChange={handleInputChange} className="profile-form-input" />
                    </div>
                    <div>
                      <label className="profile-form-label">Confirmar Nova Senha</label>
                      <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="profile-form-input" />
                    </div>
                    <div className="profile-form-actions">
                      <button type="submit" className="profile-btn-save">
                        <Lock className="profile-btn-icon" /> Alterar Senha
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
