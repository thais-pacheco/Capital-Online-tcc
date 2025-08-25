import React, { useState } from 'react';
import {
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
  LogOut,
  Lock,
  PiggyBank
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  birthDate: string;
  memberSince: string;
  avatar: string;
}

type NotificationKeys =
  | 'emailNotifications'
  | 'pushNotifications'
  | 'weeklyReports'
  | 'goalReminders'
  | 'transactionAlerts';

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profile, setProfile] = useState<UserProfile>({
    name: 'Plentz amanda ',
    email: 'plentzamanda@email.com',
    phone: '(11) 99999-9999',
    address: 'Porto Alegre, RS',
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

  const [notifications, setNotifications] = useState<Record<NotificationKeys, boolean>>({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: true,
    goalReminders: true,
    transactionAlerts: false
  });

  const notificationLabels: Record<NotificationKeys, { title: string; desc: string }> = {
    emailNotifications: {
      title: 'Notificações por Email',
      desc: 'Receba atualizações importantes por email'
    },
    pushNotifications: {
      title: 'Notificações Push',
      desc: 'Notificações em tempo real no navegador'
    },
    weeklyReports: {
      title: 'Relatórios Semanais',
      desc: 'Resumo semanal das suas finanças'
    },
    goalReminders: {
      title: 'Lembretes de Objetivos',
      desc: 'Lembretes sobre seus objetivos financeiros'
    },
    transactionAlerts: {
      title: 'Alertas de Transação',
      desc: 'Alertas para transações importantes'
    }
  };

  const handleSaveProfile = () => {
    setProfile(editProfile);
    setIsEditing(false);
    alert('Perfil atualizado com sucesso!');
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      alert('A nova senha deve ter pelo menos 8 caracteres!');
      return;
    }
    alert('Senha alterada com sucesso!');
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('pt-BR');

  const tabs = [
    { id: 'profile' as const, label: 'Perfil', icon: User },
    { id: 'security' as const, label: 'Segurança', icon: Shield },
    { id: 'notifications' as const, label: 'Notificações', icon: Bell }
  ];

  return (
    <div className="profile-page">
      {/* Header */}
      <header className="newtransaction-header">
        <div className="newtransaction-header-inner">
          <div className="newtransaction-header-flex">
            <div className="newtransaction-logo-group">
              <div
                className="logo"
                onClick={() => navigate('/dashboard')}
                style={{ cursor: 'pointer' }}
              >
                <PiggyBank className="logo-icon" style={{ color: '#22c55e' }} />
                <span className="logo-text">CAPITAL ONLINE</span>
              </div>
            </div>

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

            <div className="newtransaction-header-actions">
              <button
                className="icon-button"
                title="Calendário"
                onClick={() => navigate('/dashboard')}
              >
                <Calendar className="icon" />
              </button>
              <button
                className="icon-button"
                title="Gráficos"
                onClick={() => navigate('/graficos')}
              >
                <Bell className="icon" />
              </button>

              <div
                className="newtransaction-profile-circle"
                onClick={() => navigate('/perfil')}
                style={{ cursor: 'pointer' }}
              >
                P
              </div>

              <button
                className="icon-button logout"
                title="Sair"
                onClick={handleLogout}
              >
                <LogOut className="icon" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="profile-container">
        <h1 className="page-title">Meu Perfil</h1>
        <p className="page-subtitle">Gerencie suas informações pessoais e configurações da conta.</p>

        <div className="layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="profile-summary">
              <div className="avatar-wrapper">
                <div className="avatar-large">P</div>
                <button className="avatar-edit" aria-label="Alterar foto">
                  <Camera className="icon-small" />
                </button>
              </div>
              <h3 className="summary-name">{profile.name}</h3>
              <p className="summary-since">Membro desde {formatDate(profile.memberSince)}</p>
            </div>

            <nav className="tab-nav">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={activeTab === tab.id ? 'tab active' : 'tab'}
                  >
                    <Icon className="icon" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Conteúdo */}
          <section className="tab-content">
            {activeTab === 'profile' && (
              <>
                <div className="section-header">
                  <h2 className="section-title">Informações Pessoais</h2>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    {isEditing ? <X className="icon" /> : <Edit className="icon" />}
                    {isEditing ? 'Cancelar' : 'Editar'}
                  </button>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="label">Nome</label>
                    {isEditing ? (
                      <input
                        className="input"
                        value={editProfile.name}
                        onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                      />
                    ) : (
                      <div className="display-field">
                        <User className="display-icon" /> {profile.name}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="label">Email</label>
                    {isEditing ? (
                      <input
                        className="input"
                        value={editProfile.email}
                        onChange={(e) => setEditProfile({ ...editProfile, email: e.target.value })}
                      />
                    ) : (
                      <div className="display-field">
                        <Mail className="display-icon" /> {profile.email}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="label">Telefone</label>
                    {isEditing ? (
                      <input
                        className="input"
                        value={editProfile.phone}
                        onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                      />
                    ) : (
                      <div className="display-field">
                        <Phone className="display-icon" /> {profile.phone}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="label">Endereço</label>
                    {isEditing ? (
                      <input
                        className="input"
                        value={editProfile.address}
                        onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                      />
                    ) : (
                      <div className="display-field">
                        <MapPin className="display-icon" /> {profile.address}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="label">Data de Nascimento</label>
                    {isEditing ? (
                      <input
                        className="input"
                        type="date"
                        value={editProfile.birthDate}
                        onChange={(e) => setEditProfile({ ...editProfile, birthDate: e.target.value })}
                      />
                    ) : (
                      <div className="display-field">
                        <Calendar className="display-icon" /> {formatDate(profile.birthDate)}
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="actions-row">
                    <button className="btn btn-primary" onClick={handleSaveProfile}>
                      <Save className="icon" /> Salvar
                    </button>
                  </div>
                )}
              </>
            )}

            {activeTab === 'security' && (
              <div>
                <h2 className="section-title">Segurança</h2>
                <div className="security-section">
                  <h3 className="subsection-title">Alterar Senha</h3>
                  <p className="subsection-desc">
                    Mantenha sua conta segura com uma senha forte.
                  </p>

                  <div className="form-group">
                    <label className="label">Senha Atual</label>
                    <div className="password-input">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        className="input"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Digite sua senha atual"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Nova Senha</label>
                    <div className="password-input">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        className="input"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Digite sua nova senha"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Confirmar Nova Senha</label>
                    <div className="password-input">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="input"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirme sua nova senha"
                      />
                      <button
                        type="button"
                        className="password-toggle"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="icon" /> : <Eye className="icon" />}
                      </button>
                    </div>
                  </div>

                  <div className="actions-row">
                    <button className="btn btn-primary" onClick={handleSavePassword}>
                      <Lock className="icon" /> Alterar Senha
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="section-title">Notificações</h2>
                <div className="notif-list">
                  {Object.entries(notificationLabels).map(([key, { title, desc }]) => (
                    <div key={key} className="notif-row">
                      <div>
                        <p className="notif-title">{title}</p>
                        <p className="notif-desc">{desc}</p>
                      </div>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={notifications[key as NotificationKeys]}
                          onChange={(e) =>
                            setNotifications((prev) => ({
                              ...prev,
                              [key]: e.target.checked
                            }))
                          }
                        />
                        <span className="slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default Profile;
