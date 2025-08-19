import React, { useState, useEffect } from 'react'; 
import { 
  PiggyBank,
  Clock,
  AlertCircle,
  CheckCircle,
  Edit,
  Trash2,
  Plus,
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
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  userId: string; 
}


const Goals: React.FC<GoalsProps> = ({onLogout }) => {
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

const API_URL = 'https://capital-online-tcc.onrender.com/api/objetivos/';


  const calculateStatus = (goal: Goal) => {
    const hoje = new Date();
    const prazo = new Date(goal.data_limite);
    if (goal.valor_atual >= goal.valor) return 'completed';
    if (prazo < hoje) return 'overdue';
    return 'active';
  };

  async function fetchGoals() {
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
  }

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

      const navigate = useNavigate();
  return (
    <div className="goals-container">
     
     <header className="goals-header">
        <div className="goals-header-inner">
          <div className="goals-header-flex">
            <div className="goals-logo-group">
              <div className="logo">
                <PiggyBank className="logo-icon" style={{ color: '#22c55e' }} />
                <span className="logo-text">CAPITAL ONLINE</span>
              </div>
            </div>
            <nav className="goals-nav">
              <button className="goals-nav-button" onClick={() => navigate('/dashboard')}>
                Dashboard
              </button>
              <button className="goals-nav-button" onClick={() => navigate('/nova-movimentacao')}>Nova movimentação</button>
              <button className="goals-nav-button" onClick={() => navigate('/graficos')}>
                Gráficos
              </button>
              <button className="goals-nav-button active" onClick={() => navigate('/objetivos')}>
                Objetivos
              </button>
            </nav>
            <div className="goals-header-actions">
              <div className="goals-profile-circle">J</div>
            </div>
          </div>
        </div>
      </header>


      <main className="goals-content" aria-label="Área principal de objetivos">
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
                <label htmlFor="descricao">Descrição</label>
                <textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={e => handleInputChange('descricao', e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="valor_necessario">Meta (R$) *</label>
                <input
                  type="number"
                  id="valor_necessario"
                  value={formData.valor_necessario}
                  onChange={e => handleInputChange('valor_necessario', e.target.value)}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="prazo">Prazo *</label>
                <input
                  type="date"
                  id="prazo"
                  value={formData.prazo}
                  onChange={e => handleInputChange('prazo', e.target.value)}
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
                  <option value="">Selecione uma categoria</option>
                  <option value="educacao">Educação</option>
                  <option value="lazer">Lazer</option>
                  <option value="saude">Saúde</option>
                  <option value="investimento">Investimento</option>
                  {/* pode adicionar outras categorias aqui */}
                </select>
              </div>

              <div className="goals-form-buttons" style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="goals-submit-button">
                  {editingGoal ? 'Salvar' : 'Criar'}
                </button>
                <button type="button" className="goals-cancel-button" onClick={() => {
                  setShowCreateForm(false);
                  setEditingGoal(null);
                  setFormData({ titulo: '', descricao: '', valor_necessario: '', prazo: '', categoria: '' });
                }}>
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {loading ? (
          <p>Carregando objetivos...</p>
        ) : goals.length === 0 ? (
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
                <article key={goal.id} className="goal-card" aria-label={`Objetivo ${goal.titulo}`}>
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
                          goal.status === 'completed' ? 'progress-fill-completed' : 'progress-fill-active'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="goal-progress-info">
                      <span>{formatCurrency(goal.valor_atual)}</span>
                      <span>{formatCurrency(goal.valor)}</span>
                    </div>
                  </div>

                  <div className="goal-meta">
                    <span>Prazo: {goal.data_limite}</span>
                    <span>Criado em: {goal.criado_em.slice(0, 10)}</span>
                    {goal.categoria && <span>Categoria: {goal.categoria}</span>}
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
