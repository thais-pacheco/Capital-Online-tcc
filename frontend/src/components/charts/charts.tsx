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

interface Category {
  id: number;
  nome: string;
}

interface ChartsProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const Charts: React.FC<ChartsProps> = ({ onNavigate, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  // Buscar transações e categorias
  useEffect(() => {
    const fetchData = async () => {
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

        // Buscar categorias
        const categoriesResponse = await fetch('http://127.0.0.1:8000/api/categorias/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }

        // Buscar transações
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

        validatedTransactions.sort((a: Transaction, b: Transaction) => {
          const dateA = new Date(a.data);
          const dateB = new Date(b.data);
          return dateB.getTime() - dateA.getTime();
        });

        setTransactions(validatedTransactions);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Erro ao carregar transações.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Função auxiliar para obter o nome da categoria
  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.nome : `Categoria ${categoryId}`;
  };

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

  // Análise por categoria
  const categoryAnalysis = transactions.reduce((acc: any, t) => {
    if (t.tipo === 'saida') {
      const catKey = t.categoria?.toString() || 'sem-categoria';
      const catName = getCategoryName(t.categoria);
      if (!acc[catKey]) {
        acc[catKey] = { total: 0, count: 0, category: catKey, categoryName: catName };
      }
      acc[catKey].total += t.valor;
      acc[catKey].count += 1;
    }
    return acc;
  }, {});

  const sortedCategories = Object.values(categoryAnalysis)
    .sort((a: any, b: any) => b.total - a.total);

  // Gerar insights
  const generateInsights = () => {
    const insights = [];
    
    if (sortedCategories.length > 0) {
      const topCategory: any = sortedCategories[0];
      const percentage = totalExpenses > 0 ? (topCategory.total / totalExpenses) * 100 : 0;
      
      insights.push({
        type: 'warning',
        title: 'Categoria com maior gasto',
        message: `A categoria "${topCategory.categoryName}" representa ${percentage.toFixed(1)}% das suas despesas totais (R$ ${(topCategory.total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}).`,
        recommendation: percentage > 40 ? 'Considere reduzir gastos nesta categoria.' : 'Monitore esta categoria regularmente.'
      });
    }

    if (totalExpenses > totalIncome && totalIncome > 0) {
      const deficit = totalExpenses - totalIncome;
      insights.push({
        type: 'danger',
        title: 'Gastos acima das receitas',
        message: `Suas despesas estão R$ ${(deficit / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} acima das suas receitas.`,
        recommendation: 'Revise seus gastos e considere cortar despesas não essenciais.'
      });
    } else if (totalBalance > 0 && totalIncome > 0) {
      const savingsRate = ((totalBalance / totalIncome) * 100);
      insights.push({
        type: 'success',
        title: 'Economia positiva',
        message: `Você está economizando ${savingsRate.toFixed(1)}% da sua receita.`,
        recommendation: savingsRate < 20 ? 'Tente aumentar sua taxa de poupança para pelo menos 20%.' : 'Ótimo trabalho! Continue assim.'
      });
    }

    return insights;
  };

  const insights = generateInsights();

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
      <style>{`
        /* Header */
        .charts-header {
          background: white;
          border-bottom: 1px solid #e9ecef;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .charts-header-inner {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          height: 64px;
        }

        .charts-header-left {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .charts-logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .charts-title {
          font-size: 18px;
          font-weight: 700;
          color: #22c55e;
        }

        .charts-nav {
          display: flex;
          gap: 8px;
        }

        .nav-button {
          padding: 8px 16px;
          border: none;
          background: none;
          color: #6b7280;
          font-size: 14px;
          font-weight: 500;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-button:hover {
          color: #22c55e;
          background: #f0fdf4;
        }

        .nav-button.active {
          color: #10b981;
          background: #f0fdf4;
        }

        .charts-header-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .icon-button {
          width: 40px;
          height: 40px;
          border: none;
          background: none;
          color: #6b7280;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-button:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .icon-button.logout:hover {
          background: #fef2f2;
          color: #dc2626;
        }

    

        .charts-main {
          max-width: 1280px;
          margin: 0 auto;
          padding: 32px;
        }

        .charts-page-header {
          margin-bottom: 32px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          background: none;
          border: none;
          color: #6B7280;
          cursor: pointer;
        }

        .charts-stats-grid {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }

        .charts-stats-card {
          background: #fff;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #E5E7EB;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .icon-wrapper {
          padding: 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: fit-content;
        }

        .icon-wrapper.green {
          background-color: #D1FAE5;
          color: #059669;
        }

        .icon-wrapper.red {
          background-color: #FEE2E2;
          color: #DC2626;
        }

        .charts-filters {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }

        .filter-item {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-item input,
        .filter-item select {
          padding: 8px;
          border: 1px solid #D1D5DB;
          border-radius: 8px;
        }

        .charts-graph-card {
          background: #fff;
          padding: 24px;
          border-radius: 16px;
          border: 1px solid #E5E7EB;
        }

        .charts-graph {
          display: flex;
          position: relative;
          height: 320px;
          margin-bottom: 24px;
        }

        .charts-y-axis {
          position: absolute;
          left: 0;
          top: 0;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          font-size: 12px;
          color: #6B7280;
          padding-right: 8px;
        }

        .charts-bars {
          margin-left: 48px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex: 1;
        }

        .charts-bar-column {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
        }

        .charts-bar {
          width: 100%;
          border-radius: 4px 4px 0 0;
        }

        .charts-bar.income {
          background-color: #60A5FA;
          margin-right: 4px;
        }

        .charts-bar.expense {
          background-color: #F87171;
        }

        .month-label {
          font-size: 12px;
          color: #6B7280;
          margin-top: 8px;
        }

        .charts-legend {
          display: flex;
          justify-content: center;
          gap: 24px;
          font-size: 12px;
        }

        .income-color {
          width: 12px;
          height: 12px;
          background-color: #60A5FA;
          border-radius: 2px;
        }

        .expense-color {
          width: 12px;
          height: 12px;
          background-color: #F87171;
          border-radius: 2px;
        }

        /* Análise Inteligente */
        .charts-analysis-section {
          margin-top: 32px;
        }

        .charts-analysis-section h2 {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 24px;
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .insight-card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .insight-card.success {
          border-left: 4px solid #22c55e;
          background: linear-gradient(to right, #f0fdf4 0%, white 10%);
        }

        .insight-card.warning {
          border-left: 4px solid #f59e0b;
          background: linear-gradient(to right, #fffbeb 0%, white 10%);
        }

        .insight-card.danger {
          border-left: 4px solid #ef4444;
          background: linear-gradient(to right, #fef2f2 0%, white 10%);
        }

        .insight-header {
          margin-bottom: 8px;
        }

        .insight-header strong {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
        }

        .insight-message {
          font-size: 14px;
          color: #4B5563;
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .insight-recommendation {
          font-size: 13px;
          color: #6B7280;
          font-style: italic;
          padding-top: 8px;
          border-top: 1px solid #F3F4F6;
        }

        .category-analysis-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
        }

        .category-analysis-card h3 {
          font-size: 20px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }

        .category-subtitle {
          font-size: 14px;
          color: #6B7280;
          margin-bottom: 20px;
        }

        .category-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .category-item {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .category-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-name {
          font-size: 14px;
          font-weight: 500;
          color: #111827;
        }

        .category-count {
          font-size: 12px;
          color: #6B7280;
        }

        .category-bar-container {
          width: 100%;
          height: 8px;
          background-color: #F3F4F6;
          border-radius: 4px;
          overflow: hidden;
        }

        .category-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .category-values {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .category-amount {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
        }

        .category-percentage {
          font-size: 13px;
          font-weight: 500;
          color: #6B7280;
        }
      `}</style>

      {/* Header */}
      <header className="charts-header">
        <div className="charts-header-inner">
          <div className="charts-header-left">
            <div className="charts-logo">
              <PiggyBank className="logo-icon" />
              <span className="charts-title">CAPITAL ONLINE</span>
            </div>
          </div>

          <nav className="charts-nav">
            <button className="nav-button" onClick={() => onNavigate('dashboard')}>Dashboard</button>
            <button className="nav-button" onClick={() => onNavigate('nova-transacao')}>Nova movimentação</button>
            <button className="nav-button active" onClick={() => onNavigate('charts')}>Gráficos</button>
            <button className="nav-button" onClick={() => onNavigate('objetivos')}>Objetivos</button>
          </nav>

          <div className="charts-header-right">
            <button className="icon-button" onClick={() => setIsCalendarOpen(true)}>
              <Calendar size={18} />
            </button>
            <button className="icon-button" onClick={() => setIsNotificationsOpen(true)}>
              <Bell size={18} />
            </button>
            <div className="profile-avatar" style={{ cursor: 'pointer' }} onClick={() => onNavigate('profile')}>
              <User size={18} />
            </div>
            <button className="icon-button logout" onClick={onLogout}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="charts-main">
        {/* Page header */}
        <div className="charts-page-header">
          <h1>Gráficos</h1>
          <p>Visualize o desempenho financeiro através de gráficos detalhados.</p>
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
                <option key={cat} value={cat}>{getCategoryName(Number(cat))}</option>
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

        {/* Análise e Insights */}
        <div className="charts-analysis-section">
          <h2>Análise Inteligente</h2>
          
          {/* Insights Cards */}
          {insights.length > 0 && (
            <div className="insights-grid">
              {insights.map((insight, index) => (
                <div key={index} className={`insight-card ${insight.type}`}>
                  <div className="insight-header">
                    <strong>{insight.title}</strong>
                  </div>
                  <p className="insight-message">{insight.message}</p>
                  <p className="insight-recommendation">💡 {insight.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Análise por Categoria */}
          {sortedCategories.length > 0 && (
            <div className="category-analysis-card">
              <h3>Gastos por Categoria</h3>
              <p className="category-subtitle">Veja onde seu dinheiro está sendo gasto</p>
              
              <div className="category-list">
                {sortedCategories.slice(0, 5).map((cat: any, index: number) => {
                  const percentage = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
                  return (
                    <div key={index} className="category-item">
                      <div className="category-info">
                        <span className="category-name">{cat.categoryName}</span>
                        <span className="category-count">{cat.count} transações</span>
                      </div>
                      <div className="category-bar-container">
                        <div 
                          className="category-bar" 
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: percentage > 30 ? '#ef4444' : percentage > 15 ? '#f59e0b' : '#22c55e'
                          }}
                        ></div>
                      </div>
                      <div className="category-values">
                        <span className="category-amount">R$ {(cat.total / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                        <span className="category-percentage">{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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
        </div>
      </main>
    </div>
  );
};

export default Charts;