import React, { useState } from 'react';
import { 
  PiggyBank, 
  Calendar,
  TrendingUp,
  TrendingDown,
  LogOut,
  Bell,
  User
} from 'lucide-react';
import type { Page } from '../../types';
import './charts.css';

interface Transaction {
  month: string;
  income: number;
  expense: number;
}

interface ChartsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Charts: React.FC<ChartsProps> = ({ onNavigate, onLogout }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month');

  // Dados de exemplo, substitua pelo fetch das últimas transações
  const chartData: Transaction[] = [
    { month: 'Jan', income: 45000, expense: 32000 },
    { month: 'Fev', income: 52000, expense: 38000 },
    { month: 'Mar', income: 48000, expense: 35000 },
    { month: 'Abr', income: 61000, expense: 42000 },
    { month: 'Mai', income: 55000, expense: 39000 },
    { month: 'Jun', income: 67000, expense: 45000 },
  ];

  const maxValue = Math.max(...chartData.map(d => Math.max(d.income, d.expense)));

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
            <strong>2.000</strong>
          </div>
          <div className="charts-stats-card">
            <div className="icon-wrapper green"><TrendingUp size={24} /></div>
            <span>Entradas</span>
            <strong>10.000</strong>
          </div>
          <div className="charts-stats-card">
            <div className="icon-wrapper red"><TrendingDown size={24} /></div>
            <span>Saídas</span>
            <strong>8.000</strong>
          </div>
        </div>

        {/* Filters */}
        <div className="charts-filters">
          <div className="filter-item">
            <label>Buscar:</label>
            <input type="text" placeholder="Buscar por descrição ou categoria..." />
          </div>
          <div className="filter-item">
            <label>Tipo:</label>
            <select>
              <option value="all">Todos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
            </select>
          </div>
          <div className="filter-item">
            <label>Categoria:</label>
            <select>
              <option value="all">Todas</option>
              <option value="vendas">Vendas</option>
              <option value="utilidades">Utilidades</option>
            </select>
          </div>
        </div>

        {/* Chart */}
        <div className="charts-graph-card">
          <h2>Visão Geral Financeira</h2>
          <div className="charts-graph">
            <div className="charts-y-axis">
              {[70000,60000,50000,40000,30000,20000,10000,0].map(val => (
                <span key={val}>{val}</span>
              ))}
            </div>

            <div className="charts-bars">
              {chartData.map((data, index) => (
                <div key={index} className="charts-bar-column">
                  <div className="charts-bar income" style={{ height: `${(data.income/maxValue)*100}%` }} title={`R$ ${(data.income/100).toLocaleString('pt-BR')}`}></div>
                  <div className="charts-bar expense" style={{ height: `${(data.expense/maxValue)*100}%` }} title={`R$ ${(data.expense/100).toLocaleString('pt-BR')}`}></div>
                  <span className="month-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="charts-legend">
            <div><div className="income-color"></div><span>Entradas</span></div>
            <div><div className="expense-color"></div><span>Saídas</span></div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Charts;
