import React, { useState, useEffect } from 'react'; 
import { 
  PiggyBank,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
  Calendar,
  Bell,
  LogOut,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './objectives.css';

export type Page = 'dashboard' | 'new-transaction' | 'charts' | 'objetivos';

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
  onLogout: () => void;
}

const Goals: React.FC<GoalsProps> = ({ onLogout }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
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

  const API_URL = 'http://localhost:8000/api/objetivos/';
  const navigate = useNavigate();

  const calculateStatus = (goal: Goal) => {
    const hoje = new Date();
    const prazo = new Date(goal.data_limite);
    if (goal.valor_atual >= goal.valor) return 'completed';
    if (prazo < hoje) return 'overdue';
    return 'active';
  };

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, { credentials: 'include' });
      if (!response.ok) throw new Error('Erro ao buscar objetivos');
      const data = await response.json();
      const withStatus = data.map((goal: any) => ({
        ...goal,
        status: calculateStatus(goal),
      }));
      setGoals(withStatus);
    } catch (error) {
      alert('Erro ao carregar objetivos do servidor.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.valor_necessario || !formData.prazo) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const payload = {
      titulo: formData.titulo,
      descricao: formData.descricao,
      valor: parseFloat(formData.valor_necessario),
      valor_atual: editingGoal ? editingGoal.valor_atual : 0,
      data_limite: formData.prazo,
      categoria: formData.categoria,
    };

    try {
      let response;
      if (editingGoal) {
        response = await fetch(`${API_URL}${editingGoal.id}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      } else {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        });
      }

      if (!response.ok) throw new Error('Erro ao salvar objetivo');

      await fetchGoals();

      setShowCreateForm(false);
      setEditingGoal(null);
      setFormData({ titulo: '', descricao: '', valor_necessario: '', prazo: '', categoria: '' });
    } catch (error) {
      alert('Falha ao salvar objetivo.');
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja deletar este objetivo?')) return;

    try {
      const response = await fetch(`${API_URL}${id}/`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Erro ao deletar objetivo');
      await fetchGoals();
    } catch (error) {
      alert('Falha ao deletar objetivo.');
      console.error(error);
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      titulo: goal.titulo,
      descricao: goal.descricao,
      valor_necessario: goal.valor.toString(),
      prazo: goal.data_limite,
      categoria: goal.categoria || '',
    });
    setShowCreateForm(true);
  };

  const calculateProgress = (goal: Goal) => {
    if (goal.valor === 0) return 0;
    return Math.min(100, (goal.valor_atual / goal.valor) * 100);
  };

  const formatCurrency = (value: number | undefined) =>
    typeof value === 'number'
      ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
      : 'R$ 0,00';

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="goals-container">
      {/* Header Padrão para Objetivos */}
      <header className="objectives-header">
        <div className="objectives-header-container">
          {/* Logo à esquerda */}
          <div className="objectives-header-left">
            <div className="objectives-logo">
              <div className="objectives-logo-icon">
                <PiggyBank size={20} />
              </div>
              <span className="objectives-logo-text">CAPITAL ONLINE</span>
            </div>
          </div>

          {/* Navegação centralizada */}
          <nav className="objectives-nav">
            <button 
              className="objectives-nav-button"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
            <button 
              className="objectives-nav-button"
              onClick={() => navigate('/nova-movimentacao')}
            >
              Nova movimentação
            </button>
            <button 
              className="objectives-nav-button"
              onClick={() => navigate('/graficos')}
            >
              Gráficos
            </button>
            <button 
              className="objectives-nav-button active"
              onClick={() => navigate('/objetivos')}
            >
              Objetivos
            </button>
          </nav>

          {/* Ícones à direita */}
          <div className="objectives-header-right">
            <button className="objectives-icon-button">
              <Calendar size={18} />
            </button>
            <button className="objectives-icon-button">
              <Bell size={18} />
            </button>
            {/* Ícone de perfil */}
            <div className="objectives-profile-avatar">
              <User size={18} />
            </div>
            <button className="objectives-icon-button logout" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="goals-content">
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
                <option value="educacao">Educação</option>
                <option value="lazer">Lazer</option>
                <option value="saude">Saúde</option>
                <option value="investimento">Investimento</option>
              </select>
              <div className="goals-form-buttons">
                <button type="submit" className="goals-submit-button">
                  {editingGoal ? 'Salvar' : 'Criar'}
                </button>
                <button 
                  type="button" 
                  className="goals-cancel-button"
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
          <div className="goals-empty">
            <h3>Nenhum objetivo cadastrado</h3>
            <p>Comece criando seu primeiro objetivo financeiro</p>
            <button className="goals-new-button" onClick={() => setShowCreateForm(true)}>
              <Plus size={18} /> Criar Primeiro Objetivo
            </button>
          </div>
        ) : (
          <section className="goals-grid">
            {goals.map(goal => {
              const progressPercent = calculateProgress(goal);
              let statusClass = goal.status === 'completed' ? 'status-completed' : goal.status === 'overdue' ? 'status-overdue' : 'status-active';
              let progressBarClass = goal.status === 'completed' ? 'progress-fill-completed' : 'progress-fill-active';
              
              return (
                <article key={goal.id} className="goal-card">
                  <header className="goal-card-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {goal.status === 'completed' && <CheckCircle color="#166534" size={20} />}
                      {goal.status === 'active' && <Clock color="#1e40af" size={20} />}
                      {goal.status === 'overdue' && <AlertCircle color="#991b1b" size={20} />}
                      <div className={`goal-status-badge ${statusClass}`}>
                        {goal.status === 'completed' ? 'CONCLUÍDO' : 
                         goal.status === 'overdue' ? 'ATRASADO' : 'EM ANDAMENTO'}
                      </div>
                    </div>
                    <div className="goal-actions">
                      <button onClick={() => handleEdit(goal)}><Edit size={18} /></button>
                      <button className="delete" onClick={() => handleDelete(goal.id)}><Trash2 size={18} /></button>
                    </div>
                  </header>
                  <h3 className="goal-title">{goal.titulo}</h3>
                  <p className="goal-description">{goal.descricao}</p>
                  <div className="goal-progress">
                    <div className="progress-bar-bg">
                      <div className={`progress-bar-fill ${progressBarClass}`} style={{ width: `${progressPercent}%` }} />
                    </div>
                    <div className="goal-progress-info">
                      <span>{formatCurrency(goal.valor_atual)}</span> 
                      <span>{formatCurrency(goal.valor)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>
    </div>
  );
};

export default Goals;