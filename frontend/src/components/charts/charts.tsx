import React, { useState, useEffect, useRef } from 'react';
import { 
  PiggyBank, 
  Calendar,
  TrendingUp,
  TrendingDown,
  LogOut,
  Bell,
  User
} from 'lucide-react';
import Chart from 'chart.js/auto';
import type { Page } from '../../types';
import './charts.css';

interface Transaction {
  id: number;
  data: string;
  titulo: string;
  categoria: number;
  valor: number;
  tipo: 'entrada' | 'saida';
  observacoes?: string;
}

interface ChartsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Charts: React.FC<ChartsProps> = ({ onNavigate, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // Buscar transações
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

  // Filtrar transações
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

  // Calcular totais
  const totalIncome = filteredTransactions.filter(t => t.tipo === 'entrada').reduce((sum, t) => sum + t.valor, 0);
  const totalExpenses = filteredTransactions.filter(t => t.tipo === 'saida').reduce((sum, t) => sum + t.valor, 0);
  const totalBalance = totalIncome - totalExpenses;

  // Gerar gráfico
  useEffect(() => {
    if (!filteredTransactions.length) return;

    const monthlyData = filteredTransactions.reduce((acc: any, t) => {
      const date = new Date(t.data);
      if (isNaN(date.getTime())) return acc;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) acc[monthKey] = { month: monthKey, income: 0, expense: 0 };
      if (t.tipo === 'entrada') acc[monthKey].income += t.valor;
      else acc[monthKey].expense += t.valor;
      return acc;
    }, {});

    const sortedMonths = Object.keys(monthlyData).sort();
    const last6Months = sortedMonths.slice(-6);
    const chartData = last6Months.map(month => monthlyData[month]);

    const labels = chartData.map((d: any) => {
      const [, month] = d.month.split('-');
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return monthNames[parseInt(month) - 1];
    });
    const incomeData = chartData.map((d: any) => d.income / 100);
    const expenseData = chartData.map((d: any) => d.expense / 100);

    if (chartInstance.current) chartInstance.current.destroy();
    if (chartRef.current) {
      chartInstance.current = new Chart(chartRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { 
              label: 'Entradas', 
              data: incomeData, 
              backgroundColor: '#22c55e',
              borderRadius: 4,
              barPercentage: 0.5,
              categoryPercentage: 0.6
            },
            { 
              label: 'Saídas', 
              data: expenseData, 
              backgroundColor: '#ef4444',
              borderRadius: 4,
              barPercentage: 0.5,
              categoryPercentage: 0.6
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { 
            legend: { 
              display: true,
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 15,
                font: { size: 12 }
              }
            } 
          },
          scales: { 
            y: { 
              beginAtZero: true,
              ticks: {
                callback: function(value) {
                  return 'R$ ' + value.toLocaleString('pt-BR');
                }
              }
            }
          }
        },
      });
    }
  }, [filteredTransactions]);

  if (loading) {
    return (
      <div className="charts-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="charts-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>
          <button onClick={() => window.location.reload()}>Recarregar</button>
        </div>
      </div>
    );
  }

  return (
    <div className="charts-container">
      {/* Header */}
      <header className="charts-header">
        <div className="charts-header-inner">
          <div className="charts-header-left">
            <div className="charts-logo">
              <PiggyBank className="logo-icon" style={{ color: '#22c55e' }} />
              <span className="charts-title">CAPITAL ONLINE</span>
            </div>
          </div>

          <nav className="charts-nav">
            <button className="nav-button" onClick={() => onNavigate('dashboard')}>Dashboard</button>
            <button className="nav-button" onClick={() => onNavigate('new-transaction')}>Nova movimentação</button>
            <button className="nav-button active">Gráficos</button>
            <button className="nav-button" onClick={() => onNavigate('objetivos')}>Objetivos</button>
          </nav>

          <div className="charts-header-right">
            <button className="icon-button" title="Calendário"><Calendar size={18} /></button>
            <button className="icon-button" title="Notificações"><Bell size={18} /></button>
            <div className="profile-avatar" style={{ cursor: 'pointer' }} onClick={() => onNavigate('profile')}>
              <User size={18} />
            </div>
            <button className="icon-button logout" onClick={onLogout}><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      <main className="charts-main">
        {/* Page header */}
        <div className="charts-page-header">
          <h1>Gráficos</h1>
          <p>Visualize o desempenho financeiro através de gráficos detalhados.</p>
        </div>

        {/* Stats cards */}
        <div className="charts-stats-grid">
          <div className="charts-stats-card">
            <div className="icon-wrapper green"><PiggyBank size={24} /></div>
            <span>Saldo Atual</span>
            <strong>R$ {(totalBalance / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div className="charts-stats-card">
            <div className="icon-wrapper green"><TrendingUp size={24} /></div>
            <span>Entradas</span>
            <strong>R$ {(totalIncome / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div className="charts-stats-card">
            <div className="icon-wrapper red"><TrendingDown size={24} /></div>
            <span>Saídas</span>
            <strong>R$ {(totalExpenses / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        {/* Filters */}
        <div className="charts-filters">
          <div className="filter-item">
            <label>Buscar:</label>
            <input 
              type="text" 
              placeholder="Buscar por descrição ou categoria..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-item">
            <label>Tipo:</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">Todos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
            </select>
          </div>
          <div className="filter-item">
            <label>Categoria:</label>
            <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="all">Todas</option>
              {[...new Set(transactions.map(t => t.categoria?.toString()))].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Chart */}
        <div className="charts-graph-card">
          <h2>Visão Geral Financeira</h2>
          <div style={{ height: '400px', padding: '20px' }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Charts;