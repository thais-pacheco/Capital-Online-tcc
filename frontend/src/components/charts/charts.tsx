import React, { useState, useEffect, useRef } from 'react';
import { 
  PiggyBank, 
  Calendar,
  TrendingUp,
  TrendingDown,
  LogOut,
  Bell,
  User,
  Menu,
  X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<any>(null);

  const handleNavigate = (path: string) => {
    onNavigate(path);
    setIsMobileMenuOpen(false);
  };

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
        const categoriesResponse = await fetch('https://capital-online-tcc.onrender.com/api/categorias/', {
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
        const response = await fetch('https://capital-online-tcc.onrender.com/api/transacoes/', {
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
      {/* Header */}
      <header className="charts-header">
        <div className="charts-header-inner">
          <div className="charts-header-left">
            <button 
              className="menu-button" 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
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
              <Calendar size={20} />
            </button>
            <button className="icon-button" onClick={() => setIsNotificationsOpen(true)}>
              <Bell size={20} />
            </button>
            <div className="profile-avatar" onClick={() => onNavigate('profile')}>
              <User size={20} />
            </div>
            <button className="icon-button logout" onClick={onLogout}>
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="mobile-menu">
          <button className="mobile-menu-item" onClick={() => handleNavigate('dashboard')}>
            Dashboard
          </button>
          <button className="mobile-menu-item" onClick={() => handleNavigate('nova-transacao')}>
            Nova movimentação
          </button>
          <button className="mobile-menu-item" onClick={() => handleNavigate('charts')}>
            Gráficos
          </button>
          <button className="mobile-menu-item" onClick={() => handleNavigate('objetivos')}>
            Objetivos
          </button>
        </div>
      )}

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