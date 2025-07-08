import React from 'react';
import './dashboard.css';
import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  ArrowUpRight, 
  ArrowDownLeft,
  Calendar,
  User,
  Bell,
  Settings,
  LogOut,
  Wallet
} from 'lucide-react';

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
}

const Dashboard: React.FC = () => {
  // Mock data - in production, this would come from your Django backend
  const mockTransactions: Transaction[] = [
    { id: '1', description: 'Freelance Project', amount: 2500, type: 'income', category: 'Work', date: '2024-12-30' },
    { id: '2', description: 'Rent Payment', amount: -1200, type: 'expense', category: 'Housing', date: '2024-12-28' },
    { id: '3', description: 'Grocery Shopping', amount: -85, type: 'expense', category: 'Food', date: '2024-12-27' },
    { id: '4', description: 'Investment Return', amount: 450, type: 'income', category: 'Investment', date: '2024-12-25' },
    { id: '5', description: 'Utility Bills', amount: -150, type: 'expense', category: 'Bills', date: '2024-12-24' },
  ];

  const totalBalance = 15750;
  const monthlyIncome = 6250;
  const monthlyExpenses = 3420;
  const savings = totalBalance - monthlyExpenses;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="header">
        <div className="header-container">
          <div className="header-content">
            <div className="logo">
              <PiggyBank className="logo-icon" />
              <span className="logo-text">Capital Online</span>
            </div>
            <div className="header-actions">
              <button className="header-button">
                <Bell />
              </button>
              <button className="header-button">
                <Settings />
              </button>
              <div className="user-info">
                <div className="user-avatar">
                  <User />
                </div>
                <span className="user-name">João Silva</span>
              </div>
              <button className="header-button logout">
                <LogOut />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="main-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <h1 className="welcome-title">Bem-vindo de volta!</h1>
          <p className="welcome-subtitle">Aqui está um resumo das suas finanças hoje, {formatDate(new Date().toISOString())}</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <h3>Saldo Total</h3>
                <p className="stat-value">{formatCurrency(totalBalance)}</p>
                <p className="stat-change positive">
                  <TrendingUp />
                  +12.5% este mês
                </p>
              </div>
              <div className="stat-icon blue">
                <Wallet />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <h3>Receita Mensal</h3>
                <p className="stat-value">{formatCurrency(monthlyIncome)}</p>
                <p className="stat-change positive">
                  <ArrowUpRight />
                  +8.2% vs mês anterior
                </p>
              </div>
              <div className="stat-icon green">
                <TrendingUp />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <h3>Gastos Mensais</h3>
                <p className="stat-value">{formatCurrency(monthlyExpenses)}</p>
                <p className="stat-change negative">
                  <ArrowDownLeft />
                  +5.1% vs mês anterior
                </p>
              </div>
              <div className="stat-icon red">
                <TrendingDown />
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <h3>Economia</h3>
                <p className="stat-value">{formatCurrency(savings)}</p>
                <p className="stat-change positive">
                  <PiggyBank />
                  Meta: 70% alcançada
                </p>
              </div>
              <div className="stat-icon purple">
                <DollarSign />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="main-grid">
          {/* Recent Transactions */}
          <div>
            <div className="transactions-card">
              <div className="transactions-header">
                <h3 className="transactions-title">Transações Recentes</h3>
                <button className="view-all-btn">
                    Ver todas
                  </button>
              </div>
              <div className="transactions-list">
                  {mockTransactions.map((transaction) => (
                    <div key={transaction.id} className="transaction-item">
                      <div className="transaction-left">
                        <div className={`transaction-icon ${transaction.type}`}>
                          {transaction.type === 'income' ? (
                            <ArrowUpRight />
                          ) : (
                            <ArrowDownLeft />
                          )}
                        </div>
                        <div className="transaction-details">
                          <h4>{transaction.description}</h4>
                          <p className="transaction-category">{transaction.category}</p>
                        </div>
                      </div>
                      <div className="transaction-right">
                        <p className={`transaction-amount ${transaction.type}`}>
                          {transaction.type === 'income' ? '+' : ''}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="transaction-date">{formatDate(transaction.date)}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sidebar">
            {/* Quick Actions */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Ações Rápidas</h3>
              <div className="quick-actions">
                <button className="action-btn primary">
                  <ArrowUpRight />
                  <span>Adicionar Receita</span>
                </button>
                <button className="action-btn danger">
                  <ArrowDownLeft />
                  <span>Registrar Gasto</span>
                </button>
                <button className="action-btn secondary">
                  <Calendar />
                  <span>Ver Relatórios</span>
                </button>
              </div>
            </div>

            {/* Budget Overview */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Orçamento Mensal</h3>
                <div className="budget-item">
                  <div className="budget-header">
                    <span>Moradia</span>
                    <span>R$ 1.200 / R$ 1.500</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill blue" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <div className="budget-item">
                  <div className="budget-header">
                    <span>Alimentação</span>
                    <span>R$ 600 / R$ 800</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill green" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="budget-item">
                  <div className="budget-header">
                    <span>Transporte</span>
                    <span>R$ 300 / R$ 400</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill yellow" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="budget-item">
                  <div className="budget-header">
                    <span>Lazer</span>
                    <span>R$ 450 / R$ 300</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill red" style={{ width: '100%' }}></div>
                  </div>
                </div>
            </div>

            {/* Financial Goals */}
            <div className="sidebar-card">
              <h3 className="sidebar-title">Metas Financeiras</h3>
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="goal-info">
                      <h4>Fundo de Emergência</h4>
                      <p className="goal-progress">R$ 7.000 / R$ 10.000</p>
                    </div>
                    <div className="goal-percentage blue">70%</div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill blue" style={{ width: '70%' }}></div>
                  </div>
                </div>
                
                <div className="goal-item">
                  <div className="goal-header">
                    <div className="goal-info">
                      <h4>Viagem</h4>
                      <p className="goal-progress">R$ 2.500 / R$ 5.000</p>
                    </div>
                    <div className="goal-percentage green">50%</div>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill green" style={{ width: '50%' }}></div>
                  </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;