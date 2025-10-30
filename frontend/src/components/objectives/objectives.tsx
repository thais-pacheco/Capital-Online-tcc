 import React, { useState, useEffect } from 'react';
import { PiggyBank, Calendar, Bell, LogOut, User, Clock, AlertCircle, CheckCircle, Edit, Trash2, Plus, Wallet } from 'lucide-react';
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
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor_necessario: '',
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
  }, [token, onNavigate]);

  const calculateStatus = (goal: Goal) => {
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
      const response = await fetch('http://127.0.0.1:8000/api/objetivos/', {
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
        }),
      }));

      setGoals(withStatus);
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
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    if (!formData.titulo || !formData.valor_necessario || !formData.prazo) return;

    const payload = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor_necessario),
      data_limite: formData.prazo,
      categoria: formData.categoria || 'outro',
    };

    try {
      let response;
      if (editingGoal) {
        response = await fetch(`http://127.0.0.1:8000/api/objetivos/${editingGoal.id}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch('http://127.0.0.1:8000/api/objetivos/', {
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
        setFormData({ titulo: '', descricao: '', valor_necessario: '', prazo: '', categoria: '' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeposit = async () => {
    if (!selectedGoal || !depositAmount || !token) return;

    const amount = parseFloat(depositAmount);
    if (isNaN(amount) || amount <= 0) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/objetivos/${selectedGoal.id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ valor_atual: amount }),
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
        setDepositAmount('');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!token) return;

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/objetivos/${id}/`, {
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
    setFormData({
      titulo: goal.titulo,
      descricao: goal.descricao || '',
      valor_necessario: goal.valor.toString(),
      prazo: goal.data_limite,
      categoria: goal.categoria || '',
    });
    setShowCreateForm(true);
  };

  const openDepositModal = (goal: Goal) => {
    setSelectedGoal(goal);
    setShowDepositModal(true);
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

  return (
    <div className="goals-container">
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <PiggyBank className="logo-icon"/>
              <span className="logo-text">CAPITAL ONLINE</span>
            </div>
          </div>
          <nav className="nav">
            <button className="nav-button" onClick={() => onNavigate('dashboard')}>Dashboard</button>
            <button className="nav-button" onClick={() => onNavigate('new-transaction')}>Nova movimentação</button>
            <button className="nav-button" onClick={() => onNavigate('charts')}>Gráficos</button>
            <button className="nav-button active">Objetivos</button>
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

      <main className="goals-content">
        {errorMessage && <div className="error-card">{errorMessage}</div>}

        <section className="goals-header-section">
          <h1>Meus Objetivos</h1>
          <p>Gerencie seus objetivos financeiros</p>
          <button className="goals-new-button" onClick={() => setShowCreateForm(true)}>
            <Plus size={18} /> Novo Objetivo
          </button>
        </section>

        {showCreateForm && (
          <section className="goals-form-container">
            <h2>{editingGoal ? 'Editar Objetivo' : 'Novo Objetivo'}</h2>
            <form className="goals-form" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Título"
                value={formData.titulo}
                onChange={e => handleInputChange('titulo', e.target.value)}
                required
              />
              <textarea
                placeholder="Descrição"
                value={formData.descricao}
                onChange={e => handleInputChange('descricao', e.target.value)}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Meta (R$)"
                value={formData.valor_necessario}
                onChange={e => handleInputChange('valor_necessario', e.target.value)}
                required
              />
              <input
                type="date"
                value={formData.prazo}
                onChange={e => handleInputChange('prazo', e.target.value)}
                required
              />
              <select
                value={formData.categoria}
                onChange={e => handleInputChange('categoria', e.target.value)}
              >
                <option value="">Selecione uma categoria</option>
                <option value="investimento">Investimento</option>
                <option value="compra">Compra</option>
                <option value="viagem">Viagem</option>
                <option value="educacao">Educação</option>
                <option value="emergencia">Emergência</option>
                <option value="outro">Outro</option>
              </select>
              <div className="goals-form-buttons">
                <button type="submit">{editingGoal ? 'Salvar' : 'Criar'}</button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingGoal(null);
                    setFormData({ titulo: '', descricao: '', valor_necessario: '', prazo: '', categoria: '' });
                  }}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {loading ? (
          <p>Carregando objetivos...</p>
        ) : goals.length === 0 ? (
          <p>Nenhum objetivo cadastrado</p>
        ) : (
          <section className="goals-grid">
            {goals.map(goal => {
              const progressPercent = calculateProgress(goal);
              const remaining = calculateRemaining(goal);
              let statusClass =
                goal.status === 'completed'
                  ? 'status-completed'
                  : goal.status === 'overdue'
                  ? 'status-overdue'
                  : 'status-active';
              return (
                <article key={goal.id} className="goal-card">
                  <header className="goal-card-header">
                    {goal.status === 'completed' && <CheckCircle color="#166534" size={20} />}
                    {goal.status === 'active' && <Clock color="#1e40af" size={20} />}
                    {goal.status === 'overdue' && <AlertCircle color="#991b1b" size={20} />}
                    <div className={`goal-status-badge ${statusClass}`}>
                      {goal.status === 'completed' ? 'CONCLUÍDO' : goal.status === 'overdue' ? 'ATRASADO' : 'ATIVO'}
                    </div>
                    <div>
                      <button onClick={() => handleEdit(goal)}><Edit size={18} /></button>
                      <button onClick={() => handleDelete(goal.id)}><Trash2 size={18} /></button>
                    </div>
                  </header>
                  <h3>{goal.titulo}</h3>
                  <p>{goal.descricao}</p>
                  
                  <div className="goal-remaining">
                    <span className="remaining-label">Falta atingir:</span>
                    <span className="remaining-value">{formatCurrency(remaining)}</span>
                  </div>

                  <div className="goal-progress">
                    <div className="progress-info">
                      <span className="progress-label">Progresso: {progressPercent.toFixed(0)}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className={`progress-bar-fill ${statusClass}`} style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="progress-values">
                      <span className="current-value">{formatCurrency(goal.valor_atual || 0)}</span>
                      <span className="target-value">{formatCurrency(goal.valor || 0)}</span>
                    </div>
                  </div>

                  {goal.status !== 'completed' && (
                    <button 
                      className="goal-deposit-button"
                      onClick={() => openDepositModal(goal)}
                    >
                      <Wallet size={18} /> Adicionar Valor
                    </button>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </main>

      {showDepositModal && selectedGoal && (
        <div className="modal-overlay" onClick={() => setShowDepositModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Adicionar Valor ao Objetivo</h3>
            <div className="modal-goal-info">
              <p className="modal-goal-title">{selectedGoal.titulo}</p>
              <div className="modal-goal-values">
                <span>Valor atual: {formatCurrency(selectedGoal.valor_atual)}</span>
                <span>Falta: {formatCurrency(calculateRemaining(selectedGoal))}</span>
              </div>
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="Valor a adicionar (R$)"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="modal-input"
              autoFocus
            />
            <div className="modal-buttons">
              <button className="modal-confirm" onClick={handleDeposit}>
                Confirmar
              </button>
              <button 
                className="modal-cancel" 
                onClick={() => {
                  setShowDepositModal(false);
                  setSelectedGoal(null);
                  setDepositAmount('');
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

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
};

export default Goals;
