import React, { useState } from 'react';
import { User, Lock, Bell, Palette, Shield, Save } from 'lucide-react';
import './Profile.css';

export default function Profile() {
  // Removendo o useAuth que está causando problema e usando dados mockados
  const user = {
    name: 'João Silva',
    email: 'joao@exemplo.com'
  };

  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
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
    { id: 'security', name: 'Segurança', icon: Shield },
    { id: 'notifications', name: 'Notificações', icon: Bell },
    { id: 'appearance', name: 'Aparência', icon: Palette },
  ];

  return (
    <div className="profile-container">
      <div>
        <h1 className="profile-title">Configurações</h1>
        <p className="profile-subtitle">Gerencie suas preferências e configurações de conta</p>
      </div>

      <div className="profile-grid">
        <div className="lg:col-span-1">
          <nav className="sidebar-nav">
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

        <div className="lg:col-span-3">
          <div className="content-box">
            {activeTab === 'profile' && (
              <div>
                <h2 className="section-title">Informações do Perfil</h2>
                <form onSubmit={handleSubmit} className="form-space">
                  <div className="avatar-container">
                    <div className="avatar-bg">
                      <User className="avatar-icon" />
                    </div>
                    <div>
                      <button
                        type="button"
                        className="btn-primary"
                      >
                        Alterar Foto
                      </button>
                      <p className="text-muted">JPG, GIF ou PNG. Máximo 1MB.</p>
                    </div>
                  </div>

                  <div>
                    <label className="form-label">
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-save"
                    >
                      <Save className="btn-icon" />
                      Salvar Alterações
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="section-title">Segurança</h2>
                <form onSubmit={handleSubmit} className="form-space">
                  <div>
                    <label className="form-label">
                      Senha Atual
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Nova Senha
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="form-input"
                    />
                  </div>

                  <div className="form-actions">
                    <button
                      type="submit"
                      className="btn-save"
                    >
                      <Lock className="btn-icon" />
                      Alterar Senha
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="section-title">Notificações</h2>
                <div className="form-space">
                  <div className="toggle-row">
                    <div>
                      <h3 className="toggle-title">Notificações por Email</h3>
                      <p className="text-muted">Receba atualizações sobre suas transações</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="toggle-row">
                    <div>
                      <h3 className="toggle-title">Resumos Semanais</h3>
                      <p className="text-muted">Receba um resumo semanal das suas finanças</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" />
                      <span className="slider"></span>
                    </label>
                  </div>

                  <div className="toggle-row">
                    <div>
                      <h3 className="toggle-title">Alertas de Orçamento</h3>
                      <p className="text-muted">Seja notificado quando se aproximar do limite</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div>
                <h2 className="section-title">Aparência</h2>
                <div className="form-space">
                  <div>
                    <h3 className="form-label">Tema</h3>
                    <div className="theme-grid">
                      <button className="theme-card active">
                        <div className="theme-light"></div>
                        <span className="theme-label active">Claro</span>
                      </button>
                      <button className="theme-card">
                        <div className="theme-dark"></div>
                        <span className="theme-label">Escuro</span>
                      </button>
                      <button className="theme-card">
                        <div className="theme-auto"></div>
                        <span className="theme-label">Auto</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="form-label">Cor Principal</h3>
                    <div className="color-palette">
                      <button className="color-dot blue active"></button>
                      <button className="color-dot green"></button>
                      <button className="color-dot purple"></button>
                      <button className="color-dot red"></button>
                      <button className="color-dot yellow"></button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}