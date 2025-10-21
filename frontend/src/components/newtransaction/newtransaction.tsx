import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiggyBank, Calendar, Bell, LogOut, User } from 'lucide-react';
import './newtransaction.css';

interface FormData {
  type: 'income' | 'expense';
  description: string;
  amount: string;
  category: string;
  date: string;
  observations: string;
}

interface Categoria {
  id: number;
  nome: string;
  tipo: 'entrada' | 'saida';
}

export default function NewTransaction() {
  const [formData, setFormData] = useState<FormData>({
    type: 'income',
    description: '',
    amount: '',
    category: '',
    date: '',
    observations: '',
  });

  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token')?.replace(/"/g, '');

  // 🔐 Verifica autenticação
  useEffect(() => {
    if (!token) {
      setErrorMessage('Usuário não autenticado.');
      navigate('/login');
    }
  }, [token, navigate]);

  // 📦 Carrega categorias filtradas por tipo (entrada/saída)
  useEffect(() => {
    if (!token) return;

    const fetchCategories = async () => {
      try {
        const res = await fetch('http://127.0.0.1:8000/api/categorias/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }

        if (!res.ok) throw new Error('Erro ao carregar categorias');

        const data = await res.json();
        const results = Array.isArray(data) ? data : data.results || [];

        const filtered = results.filter((cat: Categoria) =>
          formData.type === 'income' ? cat.tipo === 'entrada' : cat.tipo === 'saida'
        );

        setCategories(filtered);
      } catch (err) {
        console.error(err);
        setErrorMessage('Erro ao carregar categorias.');
      }
    };

    fetchCategories();
  }, [formData.type, token, navigate]);

  // ✏️ Atualiza campos do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 💾 Envia os dados da movimentação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    if (!token) {
      setErrorMessage('Usuário não autenticado.');
      setLoading(false);
      return;
    }

    const payload = {
      descricao: formData.description,
      tipo: formData.type === 'income' ? 'entrada' : 'saida',
      valor: parseFloat(formData.amount),
      categoria: parseInt(formData.category),
      data_movimentacao: formData.date || new Date().toISOString(),
      observacoes: formData.observations,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/api/transacoes/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        const error = await response.json();
        setErrorMessage('Erro ao salvar: ' + JSON.stringify(error));
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setErrorMessage('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  // 🚪 Logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <div className="newtransaction-container">
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <PiggyBank className="logo-icon" style={{ color: '#22c55e' }} />
              <span className="logo-text">CAPITAL ONLINE</span>
            </div>
          </div>

          <nav className="nav">
            <button className="nav-button" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className="nav-button active">Nova movimentação</button>
            <button className="nav-button" onClick={() => navigate('/graficos')}>
              Gráficos
            </button>
            <button className="nav-button" onClick={() => navigate('/objetivos')}>
              Objetivos
            </button>
          </nav>

          <div className="header-right">
            <button className="icon-button">
              <Calendar size={18} />
            </button>
            <button className="icon-button">
              <Bell size={18} />
            </button>
            <div className="profile-avatar">
              <User size={18} />
            </div>
            <button className="icon-button logout" onClick={handleLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="newtransaction-content">
        <h1 className="newtransaction-title">Nova movimentação</h1>
        <p className="newtransaction-subtitle">Registre uma nova entrada ou saída financeira</p>

        {errorMessage && (
          <div className="error-card" style={{ color: 'red', marginBottom: '1rem' }}>
            {errorMessage}
          </div>
        )}

        <div className="newtransaction-form-container">
          <form className="newtransaction-form" onSubmit={handleSubmit}>
            <label className="transaction-type-label">Tipo de movimentação</label>
            <div className="transaction-type-buttons">
              <button
                type="button"
                className={`transaction-type-button ${formData.type === 'income' ? 'income' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'income' }))}
              >
                ↗ Entrada
              </button>
              <button
                type="button"
                className={`transaction-type-button ${formData.type === 'expense' ? 'expense' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, type: 'expense' }))}
              >
                ↙ Saída
              </button>
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Descrição *</label>
              <input
                name="description"
                type="text"
                className="form-input"
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Valor *</label>
                <input
                  name="amount"
                  type="number"
                  className="form-input"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Categoria *</label>
                <select
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Selecione</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Data</label>
                <input
                  name="date"
                  type="date"
                  className="form-input"
                  value={formData.date}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group form-grid-full">
              <label className="form-label">Observações</label>
              <textarea
                name="observations"
                className="form-textarea"
                value={formData.observations}
                onChange={handleChange}
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Movimentação'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() =>
                  setFormData({
                    type: 'income',
                    description: '',
                    amount: '',
                    category: '',
                    date: '',
                    observations: '',
                  })
                }
              >
                Limpar Formulário
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
