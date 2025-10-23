import React, { useState, useEffect } from 'react'; 
import {
  TrendingUp,
  TrendingDown,
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
import CalendarPopup from '../calendario/CalendarPopup';
import NotificationsPopup from '../notificacoes/NotificationsPopup';
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

  console.log('🚀 Dashboard montado!');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      const token = localStorage.getItem('token')?.replace(/"/g, '');
      const storedUser = localStorage.getItem('usuario');

      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setUserEmail(user.email || '');
        } catch (e) {
          console.error('Erro ao parse do usuário:', e);
        }
      }

      if (!token) {
        setError('Token não encontrado. Faça login novamente.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('🔄 Buscando transações da API...');
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
        console.log('📦 Dados brutos recebidos:', data);

        const validatedTransactions = data.map((t: any) => {
          console.log('🔍 Transação recebida da API:', t);
          console.log('📝 Campo descricao:', t.descricao);
          console.log('📝 Campo titulo:', t.titulo);
          console.log('📅 Campo data_movimentacao:', t.data_movimentacao);
          console.log('📅 Campo data:', t.data);
          
          const tipo =
            typeof t.tipo === 'string'
              ? t.tipo.toLowerCase().trim() === 'entrada'
                ? 'entrada'
                : 'saida'
              : 'saida';

          const valor = Math.abs(Number(t.valor));

          const transacao = {
            id: t.id,
            data: t.data_movimentacao || t.data || new Date().toISOString().split('T')[0],
            titulo: t.descricao || t.titulo || 'Movimentação',
            categoria: Number(t.categoria) || 0,
            valor: valor,
            tipo: tipo,
            observacoes: t.observacoes
          };
          
          console.log('✅ Transação processada:', transacao);
          console.log('---');
          
          return transacao;
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
            <button className="icon-button" onClick={() => setIsCalendarOpen(true)}>
              <Calendar size={18} />
            </button>
            <button className="icon-button" onClick={() => setIsNotificationsOpen(true)}>
              <Bell size={18} />
            </button>
            <div className="profile-avatar" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
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
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '8px 16px',
              backgroundColor: '#22c55e',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Recarregar Dados
          </button>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon balance">
                <ArrowUpRight size={20} />
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
          <div className="chart-container">
            {transactions.length === 0 ? (
              <div className="chart-placeholder">
                <div className="chart-icon">
                  <BarChart3 size={48} />
                </div>
                <div className="chart-text">
                  <p>Nenhuma transação para exibir</p>
                  <small>Adicione movimentações para ver o gráfico</small>
                </div>
              </div>
            ) : (
              <div className="bar-chart">
                <div className="chart-bars">
                  {(() => {
                    const monthlyData = transactions.reduce((acc: any, t) => {
                      const date = new Date(t.data);
                      if (isNaN(date.getTime())) return acc;
                      
                      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                      const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' });
                      
                      if (!acc[monthKey]) {
                        acc[monthKey] = { month: monthLabel, income: 0, expense: 0 };
                      }
                      
                      if (t.tipo === 'entrada') {
                        acc[monthKey].income += t.valor;
                      } else {
                        acc[monthKey].expense += t.valor;
                      }
                      
                      return acc;
                    }, {});

                    const chartData = Object.values(monthlyData).slice(-6);
                    const maxValue = Math.max(...chartData.map((d: any) => Math.max(d.income, d.expense)));

                    return chartData.map((data: any, index: number) => (
                      <div key={index} className="bar-group">
                        <div className="bars">
                          <div 
                            className="bar income-bar" 
                            style={{ height: `${maxValue > 0 ? (data.income / maxValue) * 100 : 0}%` }}
                            title={`Entradas: R$ ${(data.income / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                          ></div>
                          <div 
                            className="bar expense-bar" 
                            style={{ height: `${maxValue > 0 ? (data.expense / maxValue) * 100 : 0}%` }}
                            title={`Saídas: R$ ${(data.expense / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                          ></div>
                        </div>
                        <span className="bar-label">{data.month}</span>
                      </div>
                    ));
                  })()}
                </div>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-color income"></span>
                    <span>Entradas</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color expense"></span>
                    <span>Saídas</span>
                  </div>
                </div>
              </div>
            )}
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
                      <td>{transaction.data && !isNaN(new Date(transaction.data).getTime()) ? new Date(transaction.data).toLocaleDateString('pt-BR') : 'Data inválida'}</td>
                      <td>
                        <div className="transaction-description">
                          <div className={`transaction-icon ${transaction.tipo === 'entrada' ? 'income' : 'expense'}`}>
                            {transaction.tipo === 'entrada' ? (
                              <TrendingUp size={16} />
                            ) : (
                              <TrendingDown size={16} />
                            )}
                          </div>
                          <span>{transaction.titulo || 'Sem título'}</span>
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

export default Dashboard;