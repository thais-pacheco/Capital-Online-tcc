import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Search,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  LogOut,
  ChevronDown
} from 'lucide-react';
import './Dashboard.css';

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  document: string;
}

export type Page = 'dashboard' | 'new-transaction' | 'charts' | 'objetivos';

interface DashboardProps {
  onNavigate?: (page: Page) => void;
  onLogout?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLogout }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const transactions: Transaction[] = [
    {
      id: '1',
      date: '24/05/2025',
      description: 'Venda de produtos',
      category: 'Vendas',
      amount: 10000,
      type: 'income',
      document: '769467'
    },
    {
      id: '2',
      date: '24/05/2025',
      description: 'Venda de produtos',
      category: 'Vendas',
      amount: 10000,
      type: 'income',
      document: '769467'
    },
    {
      id: '3',
      date: '24/05/2025',
      description: 'Venda de produtos',
      category: 'Vendas',
      amount: 10000,
      type: 'expense',
      document: '769467'
    },
    {
      id: '4',
      date: '24/05/2025',
      description: 'Venda de produtos',
      category: 'Vendas',
      amount: 10000,
      type: 'expense',
      document: '769467'
    },
    {
      id: '5',
      date: '24/05/2025',
      description: 'Venda de produtos',
      category: 'Vendas',
      amount: 10000,
      type: 'income',
      document: '769467'
    },
    {
      id: '6',
      date: '24/05/2025',
      description: 'Venda de produtos',
      category: 'Vendas',
      amount: 10000,
      type: 'expense',
      document: '769467'
    },
    {
      id: '7',
      date: '24/05/2025',
      description: 'Venda de produtos',
      category: 'Vendas',
      amount: 10000,
      type: 'income',
      document: '769467'
    }
  ];

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || transaction.type === selectedType;
    const matchesCategory = selectedCategory === 'all' || transaction.category === selectedCategory;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  const totalBalance = 200000;
  const totalIncome = 1000000;
  const totalExpenses = 800000;

  const handleNavigate = (page: Page) => {
  if (page === 'objetivos') {
    navigate('/objetivos'); 
  } else if (onNavigate) {
    onNavigate(page);
  }
};


  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/');
    }
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">
                <DollarSign size={20} />
              </div>
              <span className="logo-text">CAPITAL ONLINE</span>
            </div>
            <nav className="nav">
              <button 
                className="nav-button active"
                onClick={() => handleNavigate('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className="nav-button"
                onClick={() => handleNavigate('new-transaction')}
              >
                Nova movimentação
              </button>
              <button 
                className="nav-button"
                onClick={() => handleNavigate('charts')}
              >
                Gráficos
              </button>
              <button 
                className="nav-button"
                onClick={() => handleNavigate('objetivos')}
              >
                Objetivos
              </button>
            </nav>
          </div>
          <div className="header-right">
            <button className="icon-button">
              <Calendar size={20} />
            </button>
            <button className="icon-button logout" onClick={handleLogout}>
              <LogOut size={20} />
            </button>
            <div className="profile-avatar">J</div>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* Page Header */}
        <div className="page-header">
          <h1>Dashboard</h1>
        </div>

        {/* Stats Cards */}
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

        {/* Chart Section */}
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

        {/* Transactions Section */}
        <div className="transactions-section">
          <div className="section-header">
            <h2>Histórico de movimentações</h2>
          </div>
          
          {/* Filters */}
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
                <option value="Vendas">Vendas</option>
                <option value="Utilidades">Utilidades</option>
              </select>
              <ChevronDown size={16} />
            </div>
          </div>

          {/* Transactions Table */}
          <div className="table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>DATA</th>
                  <th>DESCRIÇÃO</th>
                  <th>DOCUMENTO</th>
                  <th>VALOR</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{transaction.date}</td>
                    <td>
                      <div className="transaction-description">
                        <div className={`transaction-icon ${transaction.type}`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp size={16} />
                          ) : (
                            <TrendingDown size={16} />
                          )}
                        </div>
                        <span>{transaction.description}</span>
                      </div>
                    </td>
                    <td>{transaction.document}</td>
                    <td>
                      <span className={`amount ${transaction.type}`}>
                        {transaction.type === 'income' ? '+' : '-'}R$ {(transaction.amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;