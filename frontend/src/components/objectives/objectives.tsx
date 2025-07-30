import React, { useState, useEffect } from 'react'; 
import { 
  DollarSign, 
  ArrowLeft, 
  Calendar,
  Target,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PlusCircle,
  LogOut
} from 'lucide-react';

import './objectives.css';

type Page = 'dashboard' | 'new-transaction' | 'charts' | 'objetivos';

interface Goal {
  id: number;
  titulo: string;
  descricao: string;
  valor_meta: number;
  valor_atual: number;
  data_vencimento: string;
  categoria: string;
  status: 'ativo' | 'concluido' | 'vencido';
  data_criacao: string;
  usuario_id: string;
}

interface GoalsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  userId: string;
}

const Goals: React.FC<GoalsProps> = ({ onNavigate, onLogout, userId }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    valor_meta: '',
    data_vencimento: '',
    categoria: '',
    usuario_id: userId
  });

  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = ['Emergência', 'Lazer', 'Equipamentos', 'Investimentos', 'Casa', 'Educação', 'Outros'];

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await fetch(`http://localhost:8000/objetivos/${userId}`);
        if (!response.ok) {
          throw new Error('Erro ao carregar objetivos');
        }
        const data = await response.json();
        setGoals(data);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoals();
  }, [userId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titulo || !formData.valor_meta || !formData.data_vencimento) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const goalData = {
        ...formData,
        valor_meta: parseFloat(formData.valor_meta),
        valor_atual: 0,
        status: 'ativo',
        usuario_id: userId
      };

      let response;
      if (editingGoal) {
        response = await fetch(`http://localhost:8000/objetivos/${userId}/${editingGoal.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(goalData),
        });
      } else {
        response = await fetch(`http://localhost:8000/objetivos/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(goalData),
        });
      }

      if (!response.ok) {
        throw new Error(editingGoal ? 'Erro ao atualizar objetivo' : 'Erro ao criar objetivo');
      }

      const updatedGoal = await response.json();
      
      if (editingGoal) {
        setGoals(prev => prev.map(goal =>
          goal.id === editingGoal.id ? updatedGoal : goal
        ));
      } else {
        setGoals(prev => [...prev, updatedGoal]);
      }

      setFormData({ 
        titulo: '', 
        descricao: '', 
        valor_meta: '', 
        data_vencimento: '', 
        categoria: '',
        usuario_id: userId
      });
      setShowCreateForm(false);
      setEditingGoal(null);
    } catch (error) {
      console.error('Erro:', error);
      alert('Ocorreu um erro. Por favor, tente novamente.');
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      titulo: goal.titulo,
      descricao: goal.descricao || '',
      valor_meta: goal.valor_meta.toString(),
      data_vencimento: goal.data_vencimento,
      categoria: goal.categoria || '',
      usuario_id: userId
    });
    setShowCreateForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Tem certeza que deseja deletar este objetivo?')) {
      try {
        const response = await fetch(`http://localhost:8000/objetivos/${userId}/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Erro ao deletar objetivo');
        }

        setGoals(prev => prev.filter(goal => goal.id !== id));
      } catch (error) {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao deletar o objetivo.');
      }
    }
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingGoal(null);
    setFormData({ 
      titulo: '', 
      descricao: '', 
      valor_meta: '', 
      data_vencimento: '', 
      categoria: '',
      usuario_id: userId
    });
  };

  const calculateProgress = (goal: Goal) => {
    return Math.min(100, (goal.valor_atual / goal.valor_meta) * 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };

  if (isLoading) {
    return <div className="goals-container">Carregando...</div>;
  }

  return (
    <div className="goals-container">
      {/* Cabeçalho permanece o mesmo */}
      <header className="goals-header">
        {/* ... */}
      </header>

      <main className="goals-content" aria-label="Área principal de objetivos">
        <button className="goals-back-button" onClick={() => onNavigate('dashboard')} aria-label="Voltar ao dashboard">
          <ArrowLeft size={18} /> Voltar
        </button>

        <section className="goals-header-section">
          <h1>Meus Objetivos</h1>
          <p>Gerencie seus objetivos financeiros</p>

          <button className="goals-new-button" onClick={() => setShowCreateForm(true)}>
            <Plus size={18} /> Novo Objetivo
          </button>
        </section>

        {showCreateForm && (
          <section className="goals-form-container" aria-label={editingGoal ? "Editar objetivo" : "Criar novo objetivo"}>
            <h2>{editingGoal ? 'Editar Objetivo' : 'Novo Objetivo'}</h2>
            <form className="goals-form" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="titulo">Título *</label>
                <input
                  type="text"
                  id="titulo"
                  value={formData.titulo}
                  onChange={e => handleInputChange('titulo', e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="categoria">Categoria</label>
                <select
                  id="categoria"
                  value={formData.categoria}
                  onChange={e => handleInputChange('categoria', e.target.value)}
                >
                  <option value="">Selecione</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="valor_meta">Meta (R$) *</label>
                <input
                  type="number"
                  id="valor_meta"
                  value={formData.valor_meta}
                  onChange={e => handleInputChange('valor_meta', e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="data_vencimento">Prazo *</label>
                <input
                  type="date"
                  id="data_vencimento"
                  value={formData.data_vencimento}
                  onChange={e => handleInputChange('data_vencimento', e.target.value)}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={e => handleInputChange('descricao', e.target.value)}
                />
              </div>

              <div className="goals-form-buttons" style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="goals-submit-button">
                  {editingGoal ? 'Salvar' : 'Criar'}
                </button>
                <button type="button" className="goals-cancel-button" onClick={handleCancel}>
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {goals.length === 0 ? (
          <section className="goals-empty" aria-label="Nenhum objetivo encontrado">
            <h3>Nenhum objetivo cadastrado</h3>
            <p>Crie um objetivo para começar a organizar suas finanças.</p>
            <button onClick={() => setShowCreateForm(true)}>Criar Objetivo</button>
          </section>
        ) : (
          <section className="goals-grid" aria-label="Lista de objetivos">
            {goals.map(goal => {
              const progressPercent = calculateProgress(goal);
              let statusClass = '';
              if (goal.status === 'concluido') statusClass = 'status-completed';
              else if (goal.status === 'vencido') statusClass = 'status-overdue';
              else statusClass = 'status-active';

              return (
                <article key={goal.id} className="goal-card" aria-label={`Objetivo ${goal.titulo}`}>
                  <header className="goal-card-header">
                    <div className="goal-status">
                      {goal.status === 'concluido' && <CheckCircle color="#166534" size={20} />}
                      {goal.status === 'ativo' && <Clock color="#1e40af" size={20} />}
                      {goal.status === 'vencido' && <AlertCircle color="#991b1b" size={20} />}
                      <span className={`goal-status-badge ${statusClass}`}>
                        {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                      </span>
                    </div>
                    <div className="goal-actions">
                      <button aria-label="Editar objetivo" onClick={() => handleEdit(goal)}>
                        <Edit size={18} />
                      </button>
                      <button aria-label="Deletar objetivo" className="delete" onClick={() => handleDelete(goal.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </header>

                  <h3 className="goal-title">{goal.titulo}</h3>
                  <p className="goal-description">{goal.descricao}</p>

                  <div className="goal-progress">
                    <div className="progress-bar-bg" aria-hidden="true">
                      <div
                        className={`progress-bar-fill ${
                          goal.status === 'concluido' ? 'progress-fill-completed' : 'progress-fill-active'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="goal-progress-info">
                      <span>{formatCurrency(goal.valor_atual)}</span>
                      <span>{formatCurrency(goal.valor_meta)}</span>
                    </div>
                  </div>

                  <div className="goal-meta">
                    <span>Prazo: {formatDate(goal.data_vencimento)}</span>
                    <span>Criado em: {formatDate(goal.data_criacao)}</span>
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