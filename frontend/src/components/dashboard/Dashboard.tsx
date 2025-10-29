import React, { useState, useEffect, useRef } from 'react'; 
import {
  TrendingUp,
  TrendingDown,
  Search,
  ArrowUpRight,
  ArrowDownRight,
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
import Chart from 'chart.js/auto';
import './Dashboard.css';

interface Transaction {
  id: number;
  data: string;
  titulo: string;
  categoria: number;
  valor: number;
  tipo: 'entrada' | 'saida';
  observacoes?: string;
  forma_pagamento?: 'avista' | 'parcelado';
  quantidade_parcelas?: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const barChartRef = useRef<HTMLCanvasElement>(null);
  const pieChartRef = useRef<HTMLCanvasElement>(null);
  const barChartInstance = useRef<any>(null);
  const pieChartInstance = useRef<any>(null);

  // --- Buscar transações ---
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
        const response = await fetch('http://127.0.0.1:8000/api/transacoes/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.status === 401) throw new Error('Não autorizado. Faça login novamente.');
        if (!response.ok) throw new Error(`Erro ao carregar: ${response.status}`);

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
            data: t.data_movimentacao || t.data || new Date().toISOString().split('T')[0],
            titulo: t.descricao || t.titulo || 'Movimentação',
            categoria: Number(t.categoria) || 0,
            valor: valor,
            tipo: tipo,
            observacoes: t.observacoes,
            forma_pagamento: t.forma_pagamento || 'avista',
            quantidade_parcelas: t.quantidade_parcelas || 1
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

  // --- VALORES TOTAIS ---
  const totalIncome = transactions.filter(t => t.tipo === 'entrada').reduce((sum, t) => sum + t.valor, 0);
  const totalExpenses = transactions.filter(t => t.tipo === 'saida').reduce((sum, t) => sum + t.valor, 0);
  const totalBalance = totalIncome - totalExpenses;

  // --- LOGOUT ---
  const handleLogout = () => {

    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  // --- GRÁFICOS ---
  useEffect(() => {
    if (!transactions.length) return;

    const monthlyData = transactions.reduce((acc: any, t) => {
      const date = new Date(t.data);
      if (isNaN(date.getTime())) return acc;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
      if (t.tipo === 'entrada') acc[monthKey].income += t.valor;
      else acc[monthKey].expense += t.valor;
      return acc;
    }, {});

    const chartData = Object.values(monthlyData).slice(-6);
    const labels = chartData.map((d: any) => d.month);
    const incomeData = chartData.map((d: any) => d.income / 100);
    const expenseData = chartData.map((d: any) => d.expense / 100);

    if (barChartInstance.current) barChartInstance.current.destroy();
    if (barChartRef.current) {
      barChartInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Entradas', data: incomeData, backgroundColor: '#22c55e' },
            { label: 'Saídas', data: expenseData, backgroundColor: '#ef4444' },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        },
      });
    }

    if (pieChartInstance.current) pieChartInstance.current.destroy();
    if (pieChartRef.current) {
      pieChartInstance.current = new Chart(pieChartRef.current, {
        type: 'pie',
        data: {
          labels: ['Entradas', 'Saídas'],
          datasets: [
            { data: [totalIncome / 100, totalExpenses / 100], backgroundColor: ['#22c55e', '#ef4444'] },
          ],
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } },
      });
    }

  }, [transactions, totalIncome, totalExpenses]);

  if (error) return (
    <div className="dashboard">
      <div className="dashboard-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Recarregar</button>
      </div>
    </div>
  );

  return (
    <div className="dashboard">

      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <PiggyBank className="logo-icon" />
              <span className="logo-text">CAPITAL ONLINE</span>
            </div>
          </div>
          <nav className="nav">
            <button className="nav-button active" onClick={() => navigate('/dashboard')}>Dashboard</button>
            <button className="nav-button" onClick={() => navigate('/nova-movimentacao')}>Nova movimentação</button>
            <button className="nav-button" onClick={() => navigate('/graficos')}>Gráficos</button>
            <button className="nav-button" onClick={() => navigate('/objetivos')}>Objetivos</button>
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

      {/* Conteúdo principal */}
      <div className="main-content">
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>

         {/* --- Estatísticas resumidas --- */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon balance"><ArrowUpRight size={20} /></div>
              <span className="stat-label">Saldo Atual</span>
            </div>
            <div className="stat-value">R$ {(totalBalance / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon income"><ArrowUpRight size={20} /></div>
              <span className="stat-label">Entradas</span>
            </div>
            <div className="stat-value">R$ {(totalIncome / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="stat-card">
            <div className="stat-header">
              <div className="stat-icon expense"><ArrowDownRight size={20} /></div>
              <span className="stat-label">Saídas</span>
            </div>
            <div className="stat-value">R$ {(totalExpenses / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
        
        {/* --- Gráficos lado a lado sem título e altura reduzida --- */}
        <div className="charts-side-by-side">
          <div className="chart-wrapper">
            <canvas ref={barChartRef}></canvas>
          </div>
          <div className="chart-wrapper">
            <canvas ref={pieChartRef}></canvas>
          </div>
        </div>

        <div className="transactions-section">
          <div className="section-header"><h2>Histórico de movimentações</h2></div>

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
              <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                <option value="all">Todos os tipos</option>
                <option value="income">Entradas</option>
                <option value="expense">Saídas</option>
              </select>
              <ChevronDown size={16} />
            </div>

            <div className="select-wrapper">
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
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
                  <th>PAGAMENTO</th>
                  <th>OBSERVAÇÕES</th>
                  <th>VALOR</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length === 0 ? (
                  <tr><td colSpan={4}>Nenhuma movimentação encontrada.</td></tr>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>{transaction.data && !isNaN(new Date(transaction.data).getTime()) ? new Date(transaction.data).toLocaleDateString('pt-BR') : 'Data inválida'}</td>
                      <td>
                        <div className="transaction-description">
                          <div className={`transaction-icon ${transaction.tipo === 'entrada' ? 'income' : 'expense'}`}>
                            {transaction.tipo === 'entrada' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                          </div>
                          <span>{transaction.titulo || 'Sem título'}</span>
                        </div>
                      </td>
                      <td>
                        {transaction.forma_pagamento === 'parcelado' 
                          ? `${transaction.quantidade_parcelas}x` 
                          : 'À vista'}
                      </td>
                      <td>{transaction.observacoes || '--'}</td>
                      <td>
                        <span className={`amount ${transaction.tipo === 'entrada' ? 'income' : 'expense'}`}>
                          {transaction.tipo === 'entrada' ? '+' : '-'}R$ {(transaction.valor / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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

      <CalendarPopup isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} userEmail={userEmail} />
      <NotificationsPopup isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
    </div>
  );
};

export default Dashboard;
