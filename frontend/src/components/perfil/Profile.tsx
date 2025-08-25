import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User,
  Camera,
  Shield,
  Bell,
  Download,
  LogOut,
  PiggyBank
} from 'lucide-react';
import './Profile.css';

// Define Page type 
export type Page = 'dashboard' | 'new-transaction' | 'charts' | 'goals' | 'profile';

interface ProfileProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  memberSince: string;
  avatar: string;
}

interface UserStats {
  totalTransactions: number;
  totalGoals: number;
  completedGoals: number;
  averageMonthlyIncome: number;
  averageMonthlyExpense: number;
  longestStreak: number;
}

const Profile: React.FC<ProfileProps> = ({ onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'data'>('profile');
  // Removido: showConfirmPassword e setShowConfirmPassword pois não são usados

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Pedro Silva',
    email: 'pedro.silva@email.com',
    phone: '(11) 99999-9999',
    address: 'São Paulo, SP',
    birthDate: '1990-05-15',
    memberSince: '2024-01-15',
    avatar: ''
  });

  const [editProfile, setEditProfile] = useState<UserProfile>(profile);

  // Removido: passwordData e setPasswordData pois não são usados

  // Removido: notifications e setNotifications pois não são usados

  const stats: UserStats = {
    totalTransactions: 247,
    totalGoals: 8,
    completedGoals: 3,
    averageMonthlyIncome: 8500,
    averageMonthlyExpense: 6200,
    longestStreak: 45
  };

  const handleSaveProfile = () => {
    setProfile(editProfile);
    alert('Perfil atualizado com sucesso!');
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditProfile(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const tabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'data', label: 'Dados', icon: Download }
  ];

  return (
    <div className="profile-container">
      {/* Header igual ao Dashboard */}
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
                onClick={() => onNavigate('dashboard')}
              >
                Dashboard
              </button>
              <button
                className="newtransaction-nav-button"
                onClick={() => onNavigate('new-transaction')}
              >
                Nova movimentação
              </button>
              <button
                className="newtransaction-nav-button"
                onClick={() => onNavigate('charts')}
              >
                Gráficos
              </button>
              <button
                className="newtransaction-nav-button"
                onClick={() => onNavigate('goals')}
              >
                Objetivos
              </button>
              <button
                className="newtransaction-nav-button active"
                onClick={() => onNavigate('profile')}
              >
                Perfil
              </button>
            </nav>

            {/* Perfil e Logout */}
            <div className="newtransaction-header-actions">
              <div 
                className="newtransaction-profile-circle" 
                onClick={() => onNavigate('profile')} 
                style={{ cursor: 'pointer' }}
              >
                P
              </div>
              <button 
                className="icon-button logout" 
                title="Sair"
                onClick={onLogout}
              >
                <LogOut className="icon" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo do perfil */}
      <div className="profile-content">
        <div className="page-header">
          <button 
            onClick={() => onNavigate('dashboard')}
            className="back-button"
          >
            <ArrowLeft className="icon" />
            <span>Voltar ao Dashboard</span>
          </button>
          <div className="page-title-container">
            <div>
              <h1 className="page-title">Meu Perfil</h1>
              <p className="page-subtitle">Gerencie suas informações pessoais e configurações da conta.</p>
            </div>
          </div>
        </div>

        <div className="profile-grid">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-card">
              {/* Profile Summary */}
              <div className="profile-summary">
                <div className="avatar-container">
                  <div className="profile-avatar">
                    <span className="avatar-large-text">P</span>
                  </div>
                  <button className="avatar-edit-button">
                    <Camera className="icon" />
                  </button>
                </div>
                <h3 className="profile-name">{profile.name}</h3>
                <p className="profile-member-since">Membro desde {formatDate(profile.memberSince)}</p>
              </div>

              {/* Navigation Tabs */}
              <nav className="tab-navigation">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
                    >
                      <Icon className="tab-icon" />
                      <span className="tab-label">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Stats Card */}
            <div className="stats-card">
              <h3 className="stats-title">Suas Estatísticas</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Transações</span>
                  <span className="stat-value">{stats.totalTransactions}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Objetivos</span>
                  <span className="stat-value">{stats.totalGoals}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Concluídos</span>
                  <span className="stat-value completed">{stats.completedGoals}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Sequência</span>
                  <span className="stat-value">{stats.longestStreak} dias</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="main-content">
            <div className="content-card">
              {/* Tabs Content */}
              {activeTab === 'profile' && (
                <div className="tab-content">
                  {/* Conteúdo da aba Perfil */}
                  <form
                    className="profile-form"
                    onSubmit={e => {
                      e.preventDefault();
                      handleSaveProfile();
                    }}
                  >
                    <div className="form-group">
                      <label htmlFor="name">Nome</label>
                      <input
                        id="name"
                        type="text"
                        value={editProfile.name}
                        onChange={e => handleInputChange('name', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        id="email"
                        type="email"
                        value={editProfile.email}
                        onChange={e => handleInputChange('email', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone">Telefone</label>
                      <input
                        id="phone"
                        type="text"
                        value={editProfile.phone}
                        onChange={e => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="address">Endereço</label>
                      <input
                        id="address"
                        type="text"
                        value={editProfile.address}
                        onChange={e => handleInputChange('address', e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="birthDate">Data de Nascimento</label>
                      <input
                        id="birthDate"
                        type="date"
                        value={editProfile.birthDate}
                        onChange={e => handleInputChange('birthDate', e.target.value)}
                      />
                    </div>
                    <button type="submit" className="save-profile-button">
                      Salvar Perfil
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="tab-content">
                  {/* Aba Segurança */}
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="tab-content">
                  {/* Aba Notificações */}
                </div>
              )}

              {activeTab === 'data' && (
                <div className="tab-content">
                  {/* Aba Dados */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
