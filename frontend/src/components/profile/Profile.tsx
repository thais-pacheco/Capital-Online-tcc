import React, { useState } from 'react';
import { User, Lock, ArrowLeft, PiggyBank, Calendar, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();

  // Dados mockados do usuário
  const user = {
    name: 'João Silva',
    email: 'joao@exemplo.com'
  };

  const [activeTab, setActiveTab] = useState('profile');
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

  return (
    <div className="profile-page">
      {/* ===== Header ===== */}
      <header className="newtransaction-header">
        <div className="newtransaction-header-inner">
          <div className="newtransaction-header-flex">
            {/* Logo */}
            <div className="newtransaction-logo-group">
              <div className="logo">
                <PiggyBank className="logo-icon" style={{ color: '#22c55e' }} />
                <span className="logo-text">CAPITAL ONLINE</span>
              </div>
            </div>

            {/* Navegação */}
            <nav className="newtransaction-nav">
              <button
                className="newtransaction-nav-button"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button
                className="newtransaction-nav-button"
                onClick={() => navigate('/nova-movimentacao')}
              >
                Nova movimentação
              </button>
              <button
                className="newtransaction-nav-button"
                onClick={() => navigate('/graficos')}
              >
                Gráficos
              </button>
              <button
                className="newtransaction-nav-button"
                onClick={() => navigate('/objetivos')}
              >
                Objetivos
              </button>
            </nav>

            {/* Ações do header */}
            <div className="newtransaction-header-actions">
              <button className="icon-btn">
                <Calendar size={20} />
              </button>
              <button className="icon-btn">
                <Bell size={20} />
              </button>
              <div className="newtransaction-profile-circle">J</div>
              <button className="icon-btn">
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ===== Conteúdo da página de perfil ===== */}
      <div className="profile-container">
        <div className="profile-header">
          <a href="#" onClick={() => navigate('/dashboard')} className="back-button">
            <ArrowLeft className="back-icon" />
            Voltar ao Dashboard
          </a>
        </div>

        <div>
          <h1 className="profile-title">Meu perfil</h1>
          <p className="profile-subtitle">
            Gerencie suas informações pessoais e configurações da conta.
          </p>
        </div>

        <div className="profile-grid">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="sidebar-nav">
              <div className="avatar-section">
                <div className="avatar-circle">J</div>
                <div className="user-name">Julia Silva</div>
                <div className="member-since">Membro desde 14/01/2024</div>
              </div>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`sidebar-btn ${activeTab === tab.id ? 'active' : ''}`}
                  >
                    <Icon className="sidebar-icon" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Conteúdo */}
          <div className="lg:col-span-3">
            <div className="content-box">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="section-title">Informações pessoais</h2>
                  <form onSubmit={handleSubmit} className="form-space">
                    <div>
                      <label className="form-label">Nome completo:</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Telefone:</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Data de nascimento:</label>
                      <input
                        type="date"
                        name="birthdate"
                        value={formData.birthdate}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Email:</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div>
                  <h2 className="section-title">Segurança</h2>
                  <form onSubmit={handleSubmit} className="form-space">
                    <div>
                      <label className="form-label">Senha Atual</label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Nova Senha</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>

                    <div>
                      <label className="form-label">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-save">
                        <Lock className="btn-icon" />
                        Alterar Senha
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
