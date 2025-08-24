import React, { useState } from 'react';
import { 
  DollarSign, 
  ArrowLeft, 
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Save,
  X,
  Camera,
  Shield,
  Bell,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Target,
  PlusCircle,
  LogOut,
  Lock
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
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'data'>('profile');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    goalReminders: true,
    transactionAlerts: false
  });

  const stats: UserStats = {
    totalTransactions: 247,
    totalGoals: 8,
    completedGoals: 3,
    averageMonthlyIncome: 8500,
    averageMonthlyExpense: 6200,
    longestStreak: 45
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditProfile(profile);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = () => {
    setProfile(editProfile);
    setIsEditing(false);
    alert('Perfil atualizado com sucesso!');
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditProfile(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      alert('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    alert('Senha alterada com sucesso!');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleExportData = () => {
    alert('Seus dados serão exportados em breve. Você receberá um email com o arquivo.');
  };

  const handleDeleteAccount = () => {
    if (confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      alert('Conta excluída com sucesso.');
      onLogout();
    }
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
      {/* Header */}
      <header className="profile-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-container">
              <div className="logo-icon">
                <DollarSign className="icon" />
              </div>
              <span className="logo-text">CAPITAL ONLINE</span>
            </div>
            <nav className="nav-menu">
              <button 
                onClick={() => onNavigate('dashboard')}
                className="nav-button"
              >
                Dashboard
              </button>
              <button 
                onClick={() => onNavigate('new-transaction')}
                className="nav-button with-icon"
              >
                <PlusCircle className="nav-icon" />
                <span>Nova movimentação</span>
              </button>
              <button 
                onClick={() => onNavigate('goals')}
                className="nav-button with-icon"
              >
                <Target className="nav-icon" />
                <span>Objetivos</span>
              </button>
              <button className="nav-button active with-icon">
                <User className="nav-icon" />
                <span>Perfil</span>
              </button>
            </nav>
          </div>
          <div className="header-right">
            <button className="icon-button">
              <Calendar className="icon" />
            </button>
            <button 
              onClick={onLogout}
              className="icon-button logout"
              title="Sair"
            >
              <LogOut className="icon" />
            </button>
            <div className="avatar">
              <span className="avatar-text">P</span>
            </div>
          </div>
        </div>
      </header>

      <div className="profile-content">
        {/* Page Header */}
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
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="tab-content">
                  <div className="tab-header">
                    <h2 className="tab-title">Informações Pessoais</h2>
                    <button
                      onClick={isEditing ? handleSaveProfile : handleEditToggle}
                      className={`edit-button ${isEditing ? 'save' : 'edit'}`}
                    >
                      {isEditing ? <Save className="icon" /> : <Edit className="icon" />}
                      <span>{isEditing ? 'Salvar' : 'Editar'}</span>
                    </button>
                  </div>

                  <div className="form-grid">
                    <div className="form-field">
                      <label className="field-label">
                        Nome Completo
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editProfile.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className="field-input"
                        />
                      ) : (
                        <div className="field-display">
                          <User className="field-icon" />
                          <span className="field-text">{profile.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label">
                        Email
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          value={editProfile.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="field-input"
                        />
                      ) : (
                        <div className="field-display">
                          <Mail className="field-icon" />
                          <span className="field-text">{profile.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label">
                        Telefone
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={editProfile.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="field-input"
                        />
                      ) : (
                        <div className="field-display">
                          <Phone className="field-icon" />
                          <span className="field-text">{profile.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label">
                        Localização
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editProfile.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          className="field-input"
                        />
                      ) : (
                        <div className="field-display">
                          <MapPin className="field-icon" />
                          <span className="field-text">{profile.address}</span>
                        </div>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label">
                        Data de Nascimento
                      </label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={editProfile.birthDate}
                          onChange={(e) => handleInputChange('birthDate', e.target.value)}
                          className="field-input"
                        />
                      ) : (
                        <div className="field-display">
                          <Calendar className="field-icon" />
                          <span className="field-text">{formatDate(profile.birthDate)}</span>
                        </div>
                      )}
                    </div>

                    <div className="form-field">
                      <label className="field-label">
                        Membro Desde
                      </label>
                      <div className="field-display">
                        <Calendar className="field-icon" />
                        <span className="field-text">{formatDate(profile.memberSince)}</span>
                      </div>
                    </div>
                  </div>

                  {isEditing && (
                    <div className="form-actions">
                      <button
                        onClick={handleSaveProfile}
                        className="save-button"
                      >
                        <Save className="icon" />
                        <span>Salvar Alterações</span>
                      </button>
                      <button
                        onClick={handleEditToggle}
                        className="cancel-button"
                      >
                        <X className="icon" />
                        <span>Cancelar</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className="tab-content">
                  <h2 className="tab-title">Segurança da Conta</h2>
                  
                  <form onSubmit={handlePasswordSubmit} className="password-form">
                    <div className="password-field">
                      <label className="field-label">
                        Senha Atual
                      </label>
                      <div className="password-input-container">
                        <Lock className="password-icon" />
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                          className="password-input"
                          placeholder="Digite sua senha atual"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="password-toggle"
                        >
                          {showCurrentPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                        </button>
                      </div>
                    </div>

                    <div className="password-field">
                      <label className="field-label">
                        Nova Senha
                      </label>
                      <div className="password-input-container">
                        <Lock className="password-icon" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                          className="password-input"
                          placeholder="Digite sua nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="password-toggle"
                        >
                          {showNewPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                        </button>
                      </div>
                    </div>

                    <div className="password-field">
                      <label className="field-label">
                        Confirmar Nova Senha
                      </label>
                      <div className="password-input-container">
                        <Lock className="password-icon" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                          className="password-input"
                          placeholder="Confirme sua nova senha"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="password-toggle"
                        >
                          {showConfirmPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="change-password-button"
                    >
                      Alterar Senha
                    </button>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="tab-content">
                  <h2 className="tab-title">Preferências de Notificação</h2>
                  
                  <div className="notifications-list">
                    {Object.entries(notifications).map(([key, value]) => {
                      const labels = {
                        emailNotifications: 'Notificações por Email',
                        pushNotifications: 'Notificações Push',
                        weeklyReports: 'Relatórios Semanais',
                        goalReminders: 'Lembretes de Objetivos',
                        transactionAlerts: 'Alertas de Transação'
                      };

                      return (
                        <div key={key} className="notification-item">
                          <div>
                            <h3 className="notification-title">{labels[key as keyof typeof labels]}</h3>
                            <p className="notification-description">
                              {key === 'emailNotifications' && 'Receba atualizações importantes por email'}
                              {key === 'pushNotifications' && 'Notificações em tempo real no navegador'}
                              {key === 'weeklyReports' && 'Resumo semanal das suas finanças'}
                              {key === 'goalReminders' && 'Lembretes sobre seus objetivos financeiros'}
                              {key === 'transactionAlerts' && 'Alertas para transações importantes'}
                            </p>
                          </div>
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => handleNotificationChange(key, e.target.checked)}
                              className="toggle-input"
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Data Tab */}
              {activeTab === 'data' && (
                <div className="tab-content">
                  <h2 className="tab-title">Gerenciar Dados</h2>
                  
                  <div className="data-management">
                    <div className="data-card export">
                      <div className="data-card-icon">
                        <Download className="icon" />
                      </div>
                      <div className="data-card-content">
                        <h3 className="data-card-title">Exportar Dados</h3>
                        <p className="data-card-description">
                          Baixe uma cópia de todos os seus dados em formato JSON.
                        </p>
                        <button
                          onClick={handleExportData}
                          className="data-card-button"
                        >
                          Exportar Dados
                        </button>
                      </div>
                    </div>

                    <div className="data-card delete">
                      <div className="data-card-icon">
                        <Trash2 className="icon" />
                      </div>
                      <div className="data-card-content">
                        <h3 className="data-card-title">Excluir Conta</h3>
                        <p className="data-card-description">
                          Exclua permanentemente sua conta e todos os dados associados. Esta ação não pode ser desfeita.
                        </p>
                        <button
                          onClick={handleDeleteAccount}
                          className="data-card-button delete-btn"
                        >
                          Excluir Conta
                        </button>
                      </div>
                    </div>
                  </div>
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