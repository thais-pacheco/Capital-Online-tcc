import React, { useState } from 'react';
import {
  DollarSign,
  PiggyBank,
  Calendar,
  TrendingUp,
  TrendingDown,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './charts.css';

const Charts: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const chartData = [
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
      {/* HEADER */}
      <header className="charts-header">
        <div className="charts-header-content">
          {/* LOGO */}
          <div className="charts-logo">
            <div className="charts-logo-icon">
              <PiggyBank style={{ color: 'white' }} />
            </div>
            <span className="charts-logo-text">CAPITAL ONLINE</span>
          </div>

          {/* NAV */}
          <nav className="charts-nav">
            <button className="charts-nav-btn" onClick={() => navigate('/dashboard')}>
              Dashboard
            </button>
            <button className="charts-nav-btn" onClick={() => navigate('/nova-movimentacao')}>
              Nova movimentação
            </button>
            <button className="charts-nav-active" onClick={() => navigate('/graficos')}>
              Gráficos
            </button>
            <button className="charts-nav-btn" onClick={() => navigate('/objetivos')}>
              Objetivos
            </button>
          </nav>

          {/* USER ACTIONS */}
          <div className="charts-user-actions">
            <button className="charts-user-btn" title="Calendário">
              <Calendar />
            </button>
            <button className="charts-user-btn charts-user-btn-logout" title="Sair" onClick={onLogout}>
              <LogOut />
            </button>
            <div className="charts-user-avatar">J</div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="charts-main">
        {/* PAGE HEADER */}
        <div className="charts-page-header">
          <h1>Gráficos</h1>
          <p>Visualize o desempenho financeiro através de gráficos detalhados.</p>
        </div>

        {/* STATS CARDS */}
        <div className="charts-cards">
          <div className="charts-card">
            <div className="charts-card-icon"><DollarSign /></div>
            <span>Saldo Atual</span>
            <div>R$ 2.000</div>
          </div>
          <div className="charts-card">
            <div className="charts-card-icon"><TrendingUp /></div>
            <span>Entradas</span>
            <div>R$ 10.000</div>
          </div>
          <div className="charts-card">
            <div className="charts-card-icon"><TrendingDown /></div>
            <span>Saídas</span>
            <div>R$ 8.000</div>
          </div>
        </div>

        {/* FILTERS */}
        <div className="charts-filters">
          <div>
            <label>Buscar:</label>
            <input placeholder="Buscar por descrição ou categoria..." />
          </div>
          <div>
            <label>Tipo:</label>
            <select>
              <option value="all">Todos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
            </select>
          </div>
          <div>
            <label>Categoria:</label>
            <select>
              <option value="all">Todas</option>
              <option value="vendas">Vendas</option>
              <option value="utilidades">Utilidades</option>
            </select>
          </div>
        </div>

        {/* MAIN CHART */}
        <div className="charts-main-chart">
          <h2>Visão Geral Financeira</h2>
          <div className="charts-chart-container">
            {/* Y AXIS */}
            <div className="charts-y-axis">
              {[70000, 60000, 50000, 40000, 30000, 20000, 10000, 0].map(v => (
                <span key={v}>{v}</span>
              ))}
            </div>

            {/* BARS */}
            <div className="charts-bars">
              {chartData.map((data, i) => (
                <div key={i} className="charts-bar-group">
                  <div
                    className="charts-bar income"
                    style={{ height: `${(data.income / maxValue) * 100}%` }}
                    title={`R$ ${data.income.toLocaleString('pt-BR')}`}
                  ></div>
                  <div
                    className="charts-bar expense"
                    style={{ height: `${(data.expense / maxValue) * 100}%` }}
                    title={`R$ ${data.expense.toLocaleString('pt-BR')}`}
                  ></div>
                  <span>{data.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* LEGEND */}
          <div className="charts-legend">
            <span className="income-legend">Entradas</span>
            <span className="expense-legend">Saídas</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Charts;
