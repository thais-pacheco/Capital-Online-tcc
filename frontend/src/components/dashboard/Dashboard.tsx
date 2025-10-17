import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  ChevronDown,
  PiggyBank,
  Calendar,
  Bell,
  LogOut,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface Transaction {
  id: number;
  data: string;
  titulo: string;
  categoria: number;
  valor: number;
  tipo: 'entrada' | 'saida';
  observacoes?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token')?.replace(/"/g, '');

      if (!token) {
        setError('Token não encontrado. Faça login novamente.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch('http://127.0.0.1:8000/api/transacoes/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          throw new Error('Não autorizado. Faça login novamente.');
        }

        if (!response.ok) {
          throw new Error(`Erro ao carregar: ${response.status}`);
        }

        const data = await response.json();

        const validatedTransactions = data.map((t: any) => {
          const tipo =
            typeof t.tipo === 'string'
              ? t.tipo.toLowerCase().trim() === 'entrada'
                ? 'entrada'
                : 'saida'
              : 'saida';

          const valor = Math.abs(Number(t.valor));

          return {
            id: t.id,
            data: t.data,
            titulo: t.titulo || 'Sem título',
            categoria: Number(t.categoria) || 0,
            valor: valor,
            tipo: tipo,
            observacoes: t.observacoes
          };
        });

        setTransactions(validatedTransactions);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar transações.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    if (!transaction) return false;

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      (transaction.titulo?.toLowerCase() || '').includes(searchLower) ||
      (transaction.categoria?.toString()?.toLowerCase() || '').includes(searchLower);

    const matchesType =
      selectedType === 'all' ||
      (selectedType === 'income' ? transaction.tipo === 'entrada' : transaction.tipo === 'saida');

    const matchesCategory =
      selectedCategory === 'all' ||
      transaction.categoria?.toString() === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const totalIncome = transactions
    .filter(t => t.tipo === 'entrada')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalExpenses = transactions
    .filter(t => t.tipo === 'saida')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalBalance = totalIncome - totalExpenses;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Carregando transações...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="dashboard-error">
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Recarregar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <PiggyBank className="logo-icon" style={{ color: '#22c55e' }} />
              <span className="logo-text">CAPITAL ONLINE</span>
            </div>
          </div>

          <nav className="nav">
            <button
              className="nav-button active"
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </button>
            <button
              className="nav-button"
              onClick={() => navigate('/nova-movimentacao')}
            >
              Nova movimentação
            </button>
            <button
              className="nav-button"
              onClick={() => navigate('/graficos')}
            >
              Gráficos
            </button>
            <button
              className="nav-button"
              onClick={() => navigate('/objetivos')}
            >
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

      <div className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon balance">
                <DollarSign size={20} />
              </div>
              <span className="stat-label">Saldo Atual</span>
            </div>
            <div className="stat-value">
              R$ {(totalBalance / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon income">
                <ArrowUpRight size={20} />
              </div>
              <span className="stat-label">Entradas</span>
            </div>
            <div className="stat-value">
              R$ {(totalIncome / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon expense">
                <ArrowDownRight size={20} />
              </div>
              <span className="stat-label">Saídas</span>
            </div>
            <div className="stat-value">
              R$ {(totalExpenses / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        <div className="chart-section">
          <div className="section-header">
            <h2>Visão Geral Financeira</h2>
          </div>
          <div className="chart-placeholder">
            <div className="chart-icon">
              <BarChart3 size={48} />
            </div>
            <div className="chart-text">
              <p>Gráfico de desempenho financeiro</p>
              <small>Clique em detalhes para gráficos</small>
            </div>
          </div>
        </div>

        <div className="transactions-section">
          <div className="section-header">
            <h2>Histórico de movimentações</h2>
          </div>

          <div className="filters">
            <div className="search-input">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por descrição ou categoria..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="select-wrapper">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="all">Todos os tipos</option>
                <option value="income">Entradas</option>
                <option value="expense">Saídas</option>
              </select>
              <ChevronDown size={16} />
            </div>

            <div className="select-wrapper">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">Todas as categorias</option>
                {[...new Set(transactions.map(t => t.categoria?.toString()))].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <ChevronDown size={16} />
            </div>
          </div>

          <div className="table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>DATA</th>
                  <th>DESCRIÇÃO</th>
                  <th>OBSERVAÇÕES</th>
                  <th>VALOR</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4}>Nenhuma movimentação encontrada.</td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{new Date(transaction.data).toLocaleDateString('pt-BR')}</td>
                      <td>
                        <div className="transaction-description">
                          <div className={`transaction-icon ${transaction.tipo === 'entrada' ? 'income' : 'expense'}`}>
                            {transaction.tipo === 'entrada' ? (
                              <TrendingUp size={16} />
                            ) : (
                              <TrendingDown size={16} />
                            )}
                          </div>
                          <span>{transaction.titulo}</span>
                        </div>
                      </td>
                      <td>{transaction.observacoes || '--'}</td>
                      <td>
                        <span className={`amount ${transaction.tipo === 'entrada' ? 'income' : 'expense'}`}>
                          {transaction.tipo === 'entrada' ? '+' : '-'}R$ {(transaction.valor / 100).toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                          })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;