import React, { useState, useEffect } from 'react';
import { PiggyBank, Calendar, Bell, LogOut, User, Clock, AlertCircle, Edit, Trash2, Plus, Wallet, MinusCircle, TrendingUp, Target, CheckCircle } from 'lucide-react';
import CalendarPopup from '../calendario/CalendarPopup';
import NotificationsPopup from '../notificacoes/NotificationsPopup';
import './objectives.css';
import type { Page } from '../../types';

interface Goal {
  id: number;
  titulo: string;
  descricao: string;
  valor: number;
  valor_atual: number;
  data_limite: string;
  criado_em: string;
  categoria?: string;
  status: 'active' | 'completed' | 'overdue';
}

interface GoalsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Goals: React.FC<GoalsProps> = ({ onNavigate, onLogout }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const handleAmountChange = (value: string, setter: (val: string) => void) => {
    const apenasNumeros = value.replace(/\D/g, '');
    
    if (apenasNumeros === '') {
      setter('0,00');
      return;
    }
    
    const valorNumerico = parseInt(apenasNumeros) / 100;
    const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    setter(valorFormatado);
  };
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor_necessario: '0,00',
    prazo: '',
    categoria: '',
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const token = localStorage.getItem('token')?.replace(/"/g, '');

  useEffect(() => {
    if (!token) {
      onNavigate('dashboard');
    }

    const storedUser = localStorage.getItem('usuario');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserEmail(user.email || '');
      } catch (e) {
        console.error('Erro ao parse do usuário:', e);
      }
    }

    // Inicializar valores formatados
    setDepositAmount('0,00');
    setWithdrawAmount('0,00');
  }, [token, onNavigate]);

  const calculateStatus = (goal: Goal): 'active' | 'completed' | 'overdue' => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const prazo = new Date(goal.data_limite);
    prazo.setHours(0, 0, 0, 0);
    if (goal.valor_atual >= goal.valor) return 'completed';
    if (prazo < hoje) return 'overdue';
    return 'active';
  };

  const fetchGoals = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('https://capital-online-tcc.onrender.com/api/objetivos/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        onNavigate('dashboard');
        return;
      }

      const data = await response.json();
      const results = Array.isArray(data) ? data : data.results || [];

      const withStatus = results.map((goal: any) => ({
        ...goal,
        valor: parseFloat(goal.valor) || 0,
        valor_atual: parseFloat(goal.valor_atual) || 0,
        status: calculateStatus({
          ...goal,
          valor: parseFloat(goal.valor) || 0,
          valor_atual: parseFloat(goal.valor_atual) || 0,
        } as Goal),
      }));

      setGoals(withStatus);
      setErrorMessage('');
    } catch (error) {
      console.error(error);
      setErrorMessage('Erro ao carregar objetivos do servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [token]);

  const handleInputChange = (field: string, value: string) => {
    if (field === 'valor_necessario') {
      const apenasNumeros = value.replace(/\D/g, '');
      
      if (apenasNumeros === '') {
        setFormData(prev => ({ ...prev, valor_necessario: '0,00' }));
        return;
      }
      
      const valorNumerico = parseInt(apenasNumeros) / 100;
      const valorFormatado = valorNumerico.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
      
      setFormData(prev => ({ ...prev, valor_necessario: valorFormatado }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.titulo || !formData.valor_necessario || !formData.prazo) return;

    const valorConvertido = parseFloat(formData.valor_necessario.replace(/\./g, '').replace(',', '.'));

    const payload = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      valor: valorConvertido,
      data_limite: formData.prazo,
      categoria: formData.categoria || 'outro',
    };

    try {
      let response;
      if (editingGoal) {
        response = await fetch(`https://capital-online-tcc.onrender.com/api/objetivos/${editingGoal.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('https://capital-online-tcc.onrender.com/api/objetivos/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      }

      if (response.status === 401) {
        localStorage.removeItem('token');
        onNavigate('dashboard');
        return;
      }

      if (response.ok) {
        await fetchGoals();
        setShowCreateForm(false);
        setEditingGoal(null);
        setFormData({ titulo: '', descricao: '', valor_necessario: '0,00', prazo: '', categoria: '' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeposit = async () => {
    if (!selectedGoal || !depositAmount || !token) return;

    const amount = parseFloat(depositAmount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;

    const newTotal = selectedGoal.valor_atual + amount;

    try {
      const response = await fetch(`https://capital-online-tcc.onrender.com/api/objetivos/${selectedGoal.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ valor_atual: newTotal }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        onNavigate('dashboard');
        return;
      }

      if (response.ok) {
        await fetchGoals();
        setShowDepositModal(false);
        setSelectedGoal(null);
        setDepositAmount('0,00');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleWithdraw = async () => {
    if (!selectedGoal || !withdrawAmount || !token) return;

    const amount = parseFloat(withdrawAmount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(amount) || amount <= 0) return;
    if (amount > selectedGoal.valor_atual) return;

    const newTotal = selectedGoal.valor_atual - amount;

    try {
      const response = await fetch(`https://capital-online-tcc.onrender.com/api/objetivos/${selectedGoal.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ valor_atual: newTotal }),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        onNavigate('dashboard');
        return;
      }

      if (response.ok) {
        await fetchGoals();
        setShowWithdrawModal(false);
        setSelectedGoal(null);
        setWithdrawAmount('0,00');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;

    try {
      const response = await fetch(`https://capital-online-tcc.onrender.com/api/objetivos/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        onNavigate('dashboard');
        return;
      }

      if (response.ok) await fetchGoals();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    const valorFormatado = goal.valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    setFormData({
      titulo: goal.titulo,
      descricao: goal.descricao || '',
      valor_necessario: valorFormatado,
      prazo: goal.data_limite,
      categoria: goal.categoria || '',
    });
    setShowCreateForm(true);
  };

  const calculateProgress = (goal: Goal) =>
    goal.valor === 0 ? 0 : Math.min(100, (goal.valor_atual / goal.valor) * 100);

  const calculateRemaining = (goal: Goal) =>
    Math.max(0, goal.valor - goal.valor_atual);

  const formatCurrency = (value: number | undefined) =>
    typeof value === 'number'
      ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : 'R$ 0,00';

  const handleLogout = () => {
    localStorage.removeItem('token');
    onLogout();
  };

  const totalSaved = goals.reduce((sum, goal) => sum + goal.valor_atual, 0);
  const totalGoals = goals.reduce((sum, goal) => sum + goal.valor, 0);
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedList = goals.filter(g => g.status === 'completed');

  return (
    <div className="goals-page">
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <PiggyBank className="logo-icon" />
              <span className="logo-text">CAPITAL ONLINE</span>
            </div>
          </div>
          <nav className="nav">
            <button className="nav-button" onClick={() => onNavigate('dashboard')}>Dashboard</button>
            <button className="nav-button" onClick={() => onNavigate('new-transaction')}>Nova movimentação</button>
            <button className="nav-button" onClick={() => onNavigate('charts')}>Gráficos</button>
            <button className="nav-button active" onClick={() => onNavigate('objetivos')}>Objetivos</button>
          </nav>
          <div className="header-right">
            <button className="icon-button" onClick={() => setIsCalendarOpen(true)}>
              <Calendar size={18} />
            </button>
            <button className="icon-button" onClick={() => setIsNotificationsOpen(true)}>
              <Bell size={18} />
            </button>
            <div className="profile-avatar" onClick={() => onNavigate('profile')} style={{ cursor: 'pointer' }}>
              <User size={18} />
            </div>
            <button className="icon-button logout" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        {errorMessage && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon green">
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Total Economizado</span>
              <span className="stat-value">{formatCurrency(totalSaved)}</span>
              <span className="stat-detail">
                {totalGoals > 0 ? ((totalSaved / totalGoals) * 100).toFixed(1) : '0'}% do total
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon blue">
              <Target size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Objetivos Ativos</span>
              <span className="stat-value">{goals.length}</span>
              <span className="stat-detail">{completedGoals} concluídos</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orange">
              <Clock size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-label">Falta Economizar</span>
              <span className="stat-value">{formatCurrency(totalGoals - totalSaved)}</span>
              <span className="stat-detail">Para atingir as metas</span>
            </div>
          </div>
        </div>

        <div className="page-header">
          <div>
            <h1>Objetivos Financeiros</h1>
            <p>Gerencie seus objetivos e acompanhe o progresso</p>
          </div>
          <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
            <Plus size={20} />
            Novo Objetivo
          </button>
        </div>

        {showCreateForm && (
          <div className="form-card">
            <h2>{editingGoal ? 'Editar Objetivo' : 'Criar Novo Objetivo'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Título</label>
                  <input
                    type="text"
                    placeholder="Nome do objetivo"
                    value={formData.titulo}
                    onChange={e => handleInputChange('titulo', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Categoria</label>
                  <select value={formData.categoria} onChange={e => handleInputChange('categoria', e.target.value)}>
                    <option value="">Selecione</option>
                    <option value="investimento">Investimento</option>
                    <option value="compra">Compra</option>
                    <option value="viagem">Viagem</option>
                    <option value="educacao">Educação</option>
                    <option value="emergencia">Emergência</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descrição</label>
                <textarea
                  placeholder="Descreva seu objetivo..."
                  value={formData.descricao}
                  onChange={e => handleInputChange('descricao', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Valor da Meta (R$)</label>
                  <input
                    type="text"
                    placeholder="0,00"
                    value={formData.valor_necessario}
                    onChange={e => handleInputChange('valor_necessario', e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Data Limite</label>
                  <input
                    type="date"
                    value={formData.prazo}
                    onChange={e => handleInputChange('prazo', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingGoal ? 'Salvar' : 'Criar'}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingGoal(null);
                    setFormData({ titulo: '', descricao: '', valor_necessario: '0,00', prazo: '', categoria: '' });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="loading">Carregando objetivos...</div>
        ) : goals.length === 0 ? (
          <div className="empty-state">
            <Target size={64} />
            <h3>Nenhum objetivo cadastrado</h3>
            <p>Comece criando seu primeiro objetivo financeiro</p>
          </div>
        ) : (
          <>
            {activeGoals.length > 0 && (
              <section className="goals-section">
                <h2 className="section-title">
                  <Target size={20} />
                  Em Progresso
                </h2>
                <div className="goals-grid">
                  {activeGoals.map(goal => {
                    const progress = calculateProgress(goal);
                    const remaining = calculateRemaining(goal);

                    return (
                      <div key={goal.id} className="goal-card">
                        <div className="goal-header">
                          <span className="goal-category">{goal.categoria || 'Outro'}</span>
                          <div className="goal-actions">
                            <button onClick={() => handleEdit(goal)}><Edit size={16} /></button>
                            <button onClick={() => handleDelete(goal.id)} className="delete"><Trash2 size={16} /></button>
                          </div>
                        </div>

                        <h3 className="goal-title">{goal.titulo}</h3>
                        {goal.descricao && <p className="goal-description">{goal.descricao}</p>}

                        <div className="goal-amount">
                          <span className="label">Falta economizar</span>
                          <span className="value">{formatCurrency(remaining)}</span>
                        </div>

                        <div className="progress-section">
                          <div className="progress-info">
                            <span>Progresso</span>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${progress}%` }} />
                          </div>
                          <div className="progress-values">
                            <span>{formatCurrency(goal.valor_atual)}</span>
                            <span>{formatCurrency(goal.valor)}</span>
                          </div>
                        </div>

                        <div className="goal-footer">
                          <button className="btn-add" onClick={() => { setSelectedGoal(goal); setShowDepositModal(true); }}>
                            <Wallet size={18} />
                            Adicionar
                          </button>
                          <button className="btn-remove" onClick={() => { setSelectedGoal(goal); setShowWithdrawModal(true); }}>
                            <MinusCircle size={18} />
                            Remover
                          </button>
                        </div>

                        <div className="goal-deadline">
                          <Clock size={16} />
                          <span>Prazo: {new Date(goal.data_limite).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {completedList.length > 0 && (
              <section className="goals-section">
                <h2 className="section-title">
                  <CheckCircle size={20} />
                  Concluídos ({completedList.length})
                </h2>
                <div className="goals-grid">
                  {completedList.map(goal => (
                    <div key={goal.id} className="goal-card completed">
                      <div className="completed-badge">Concluído</div>
                      <div className="goal-header">
                        <span className="goal-category">{goal.categoria || 'Outro'}</span>
                        <div className="goal-actions">
                          <button onClick={() => handleEdit(goal)}><Edit size={16} /></button>
                          <button onClick={() => handleDelete(goal.id)} className="delete"><Trash2 size={16} /></button>
                        </div>
                      </div>

                      <h3 className="goal-title">{goal.titulo}</h3>
                      {goal.descricao && <p className="goal-description">{goal.descricao}</p>}

                      <div className="goal-success">
                        <span className="label">Meta atingida</span>
                        <span className="value">{formatCurrency(goal.valor)}</span>
                      </div>

                      <div className="progress-section">
                        <div className="progress-bar completed">
                          <div className="progress-fill" style={{ width: '100%' }} />
                        </div>
                      </div>

                      <div className="goal-completion">
                        <CheckCircle size={16} />
                        <span>Concluído em {new Date(goal.data_limite).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      {showDepositModal && selectedGoal && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon green">
                <Wallet size={24} />
              </div>
              <div>
                <h3>Adicionar Valor</h3>
                <p>Contribua para: {selectedGoal.titulo}</p>
              </div>
            </div>

            <div className="modal-info">
              <div className="info-item">
                <span>Valor atual</span>
                <strong>{formatCurrency(selectedGoal.valor_atual)}</strong>
              </div>
              <div className="info-item">
                <span>Ainda falta</span>
                <strong>{formatCurrency(calculateRemaining(selectedGoal))}</strong>
              </div>
            </div>

            <div className="form-group">
              <label>Valor a adicionar (R$)</label>
              <input
                type="text"
                placeholder="0,00"
                value={depositAmount}
                onChange={e => handleAmountChange(e.target.value, setDepositAmount)}
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button className="btn-primary" onClick={handleDeposit}>Confirmar</button>
              <button className="btn-secondary" onClick={() => { setShowDepositModal(false); setDepositAmount('0,00'); }}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {showWithdrawModal && selectedGoal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-icon red">
                <MinusCircle size={24} />
              </div>
              <div>
                <h3>Remover Valor</h3>
                <p>Retirar de: {selectedGoal.titulo}</p>
              </div>
            </div>

            <div className="modal-warning">
              <AlertCircle size={20} />
              <p>Ao remover dinheiro, o progresso será reduzido.</p>
            </div>

            <div className="modal-info">
              <div className="info-item">
                <span>Valor disponível</span>
                <strong>{formatCurrency(selectedGoal.valor_atual)}</strong>
              </div>
            </div>

            <div className="form-group">
              <label>Valor a remover (R$)</label>
              <input
                type="text"
                placeholder="0,00"
                value={withdrawAmount}
                onChange={e => handleAmountChange(e.target.value, setWithdrawAmount)}
                autoFocus
              />
              <small>Máximo: {formatCurrency(selectedGoal.valor_atual)}</small>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => { setShowWithdrawModal(false); setWithdrawAmount('0,00'); }}>
                Cancelar
              </button>
              <button className="btn-danger" onClick={handleWithdraw}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <CalendarPopup isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} userEmail={userEmail} />
      <NotificationsPopup isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
};

export default Goals;