import React, { useState, useEffect } from 'react'; 
import { 
  DollarSign, 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  LogOut 
} from 'lucide-react';

import './objectives.css';

type Page = 'dashboard' | 'new-transaction' | 'charts' | 'objetivos';

interface Goal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  status: 'active' | 'completed' | 'overdue';
  createdAt: string;
}

interface GoalsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Goals: React.FC<GoalsProps> = ({ onNavigate, onLogout }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetAmount: '',
    deadline: '',
    category: ''
  });

  const [goals, setGoals] = useState<Goal[]>([]);
  const categories = ['Emergência', 'Lazer', 'Equipamentos', 'Investimentos', 'Casa', 'Educação', 'Outros'];

  // Carrega os objetivos do backend ao montar o componente
  useEffect(() => {
    fetch('/api/objetivos')
      .then(res => {
        if (!res.ok) throw new Error('Falha ao carregar objetivos');
        return res.json();
      })
      .then(data => {
        setGoals(data);
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao carregar objetivos');
      });
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      alert('Preencha todos os campos obrigatórios');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount) * 100,
      deadline: formData.deadline,
      category: formData.category || 'Outros'
    };

    if (editingGoal) {
      // Editar objetivo
      fetch(`/api/objetivos/${editingGoal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error('Erro ao editar objetivo');
          return res.json();
        })
        .then(updatedGoal => {
          setGoals(prev => prev.map(goal => (goal.id === editingGoal.id ? updatedGoal : goal)));
          setEditingGoal(null);
          setShowCreateForm(false);
          setFormData({ title: '', description: '', targetAmount: '', deadline: '', category: '' });
        })
        .catch(err => {
          console.error(err);
          alert('Erro ao salvar objetivo');
        });
    } else {
      // Criar objetivo novo
      fetch('/api/objetivos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(res => {
          if (!res.ok) throw new Error('Erro ao criar objetivo');
          return res.json();
        })
        .then(newGoal => {
          setGoals(prev => [...prev, newGoal]);
          setShowCreateForm(false);
          setFormData({ title: '', description: '', targetAmount: '', deadline: '', category: '' });
        })
        .catch(err => {
          console.error(err);
          alert('Erro ao criar objetivo');
        });
    }
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description,
      targetAmount: (goal.targetAmount / 100).toString(),
      deadline: goal.deadline,
      category: goal.category
    });
    setShowCreateForm(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este objetivo?')) return;

    fetch(`/api/objetivos/${id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao deletar objetivo');
        setGoals(prev => prev.filter(goal => goal.id !== id));
      })
      .catch(err => {
        console.error(err);
        alert('Erro ao deletar objetivo');
      });
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingGoal(null);
    setFormData({ title: '', description: '', targetAmount: '', deadline: '', category: '' });
  };

  const calculateProgress = (goal: Goal) => {
    return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  };

  return (
    <div className="goals-container">
      <header className="goals-header">
        <div className="goals-header-inner">
          <div className="goals-header-flex">
            <div className="goals-header-logo">
              <div className="goals-header-logo-icon">
                <DollarSign size={20} color="white" />
              </div>
              <span className="goals-header-logo-text">CAPITAL ONLINE</span>
            </div>

            <nav className="goals-nav" aria-label="Menu de navegação">
              <button onClick={() => onNavigate('dashboard')}>Dashboard</button>
              <button onClick={() => onNavigate('charts')}>Gráficos</button>
              <button className="active">Objetivos</button>
            </nav>

            <div className="goals-header-actions">
              <button onClick={() => onNavigate('new-transaction')} title="Nova Transação">
                <PlusCircle size={20} />
              </button>
              <button className="logout" onClick={onLogout} title="Sair">
                <LogOut size={20} />
              </button>
              <div className="goals-profile-circle">T</div>
            </div>
          </div>
        </div>
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
                <label htmlFor="title">Título *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={e => handleInputChange('title', e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="category">Categoria</label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={e => handleInputChange('category', e.target.value)}
                >
                  <option value="">Selecione</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="targetAmount">Meta (R$) *</label>
                <input
                  type="number"
                  id="targetAmount"
                  value={formData.targetAmount}
                  onChange={e => handleInputChange('targetAmount', e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="deadline">Prazo *</label>
                <input
                  type="date"
                  id="deadline"
                  value={formData.deadline}
                  onChange={e => handleInputChange('deadline', e.target.value)}
                  required
                />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label htmlFor="description">Descrição</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={e => handleInputChange('description', e.target.value)}
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
              if (goal.status === 'completed') statusClass = 'status-completed';
              else if (goal.status === 'overdue') statusClass = 'status-overdue';
              else statusClass = 'status-active';

              return (
                <article key={goal.id} className="goal-card" aria-label={`Objetivo ${goal.title}`}>
                  <header className="goal-card-header">
                    <div className="goal-status">
                      {goal.status === 'completed' && <CheckCircle color="#166534" size={20} />}
                      {goal.status === 'active' && <Clock color="#1e40af" size={20} />}
                      {goal.status === 'overdue' && <AlertCircle color="#991b1b" size={20} />}
                      <span className={`goal-status-badge ${statusClass}`}>
                        {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                      </span>
                    </div>
                    <div className="goal-actions">
                      <button aria-label="Editar objetivo" onClick={() => handleEdit(goal)}>
                        <Edit size={18} />
                      </button>
                      <button aria-label="Deletar objetivo" onClick={() => handleDelete(goal.id)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </header>

                  <h3 className="goal-title">{goal.title}</h3>
                  <p className="goal-description">{goal.description}</p>

                  <div className="goal-progress-bar-container" aria-label="Barra de progresso do objetivo">
                    <div className="goal-progress-bar" style={{ width: `${progressPercent}%` }} />
                  </div>

                  <div className="goal-meta">
                    <span>
                      Meta: R$ {(goal.targetAmount / 100).toFixed(2)}
                    </span>
                    <span>
                      Atual: R$ {(goal.currentAmount / 100).toFixed(2)}
                    </span>
                  </div>

                  <div className="goal-deadline">
                    Prazo: {goal.deadline}
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
