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
  PiggyBank
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

interface Transaction {
  id: number;
  data: string;
  descricao: string;
  categoria: string;
  valor: number;
  tipo: 'entrada' | 'saida';
  documento?: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/movimentacoes/')
      .then(res => res.json())
      .then(data => setTransactions(data))
      .catch(error => console.error('Erro ao buscar movimentações:', error));
  }, []);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch =
      transaction.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === 'all' || transaction.tipo === (selectedType === 'income' ? 'entrada' : 'saida');
    const matchesCategory =
      selectedCategory === 'all' || transaction.categoria === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const totalIncome = transactions
    .filter(t => t.tipo === 'entrada')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalExpenses = transactions
    .filter(t => t.tipo === 'saida')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalBalance = totalIncome - totalExpenses;

  return (
    <div className="dashboard">
      <header className="newtransaction-header">
        <div className="newtransaction-header-inner">
          <div className="newtransaction-header-flex">
            <div className="newtransaction-logo-group">
              <div className="logo">
                <PiggyBank className="logo-icon" style={{ color: '#22c55e' }} />
                <span className="logo-text">CAPITAL ONLINE</span>
              </div>
            </div>
            <nav className="newtransaction-nav">
              <button 
                className="newtransaction-nav-button active"
                onClick={() => navigate('/dashboard')}
              >
                Dashboard
              </button>
              <button 
                className="newtransaction-nav-button"
                onClick={() => navigate('/nova-movimentacao')}
              >
                Nova movimentação
              </button>
              <button 
                className="newtransaction-nav-button"
                onClick={() => navigate('/graficos')}
              >
                Gráficos
              </button>
              <button 
                className="newtransaction-nav-button"
                onClick={() => navigate('/objetivos')}
              >
                Objetivos
              </button>
            </nav>
            <div className="newtransaction-header-actions">
              <div className="newtransaction-profile-circle">J</div>
            </div>
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
                {[...new Set(transactions.map(t => t.categoria))].map(cat => (
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
                  <th>DOCUMENTO</th>
                  <th>VALOR</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
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
                        <span>{transaction.descricao}</span>
                      </div>
                    </td>
                    <td>{transaction.documento || '--'}</td>
                    <td>
                      <span className={`amount ${transaction.tipo === 'entrada' ? 'income' : 'expense'}`}>
                        {transaction.tipo === 'entrada' ? '+' : '-'}R$ {(transaction.valor / 100).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4}>Nenhuma movimentação encontrada.</td>
                  </tr>
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
