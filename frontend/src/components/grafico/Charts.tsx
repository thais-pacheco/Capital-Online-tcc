import React from 'react';
import { DollarSign, ArrowLeft, Calendar,TrendingUp,TrendingDown,BarChart3,PlusCircle,Target,LogOut 
} from 'lucide-react';

export type Page = 'dashboard' | 'new-transaction' | 'charts' | 'goals';

interface ChartsProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

const Charts: React.FC<ChartsProps> = ({ onNavigate, onLogout }) => {
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
      <header className="charts-header">
        <div className="charts-header-inner">
          <div className="charts-header-left">
            <div className="charts-logo-group">
              <div className="charts-logo-icon">
                <DollarSign />
              </div>
              <span className="charts-logo-text">CAPITAL ONLINE</span>
            </div>

            <nav className="charts-nav" aria-label="Main navigation">
              <button
                onClick={() => onNavigate('dashboard')}
                className="charts-nav-button"
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('new-transaction')}
                className="charts-nav-button flex-center"
              >
                <PlusCircle className="icon-small" />
                <span>Nova movimentação</span>
              </button>
              <button className="charts-nav-button active flex-center">
                <BarChart3 className="icon-small" />
                <span>Gráficos</span>
              </button>
              <button
                onClick={() => onNavigate('goals')}
                className="charts-nav-button flex-center"
              >
                <Target className="icon-small" />
                <span>Objetivos</span>
              </button>
            </nav>
          </div>

          <div className="charts-header-right">
            <button className="charts-icon-button" title="Calendário">
              <Calendar className="icon-medium" />
            </button>
            <button
              onClick={onLogout}
              className="charts-icon-button logout"
              title="Sair"
            >
              <LogOut className="icon-medium" />
            </button>
            <div className="charts-profile-circle">P</div>
          </div>
        </div>
      </header>

      <main className="charts-main">
        <div className="charts-page-header">
          <button
            onClick={() => onNavigate('dashboard')}
            className="charts-back-button flex-center"
          >
            <ArrowLeft className="icon-small" />
            <span>Voltar ao Dashboard</span>
          </button>

          <div className="charts-page-title-group">
            <h1 className="charts-title">Gráficos</h1>
            <p className="charts-subtitle">
              Visualize o desempenho financeiro através de gráficos detalhados.
            </p>
          </div>
        </div>

        <section className="charts-stats-cards">
          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-icon bg-emerald-light">
                <DollarSign className="icon-large text-emerald" />
              </div>
              <span className="stats-card-label">Saldo Atual</span>
            </div>
            <div className="stats-card-value">2.000</div>
          </div>

          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-icon bg-green-light">
                <TrendingUp className="icon-large text-green" />
              </div>
              <span className="stats-card-label">Entradas</span>
            </div>
            <div className="stats-card-value">10.000</div>
          </div>

          <div className="stats-card">
            <div className="stats-card-header">
              <div className="stats-card-icon bg-red-light">
                <TrendingDown className="icon-large text-red" />
              </div>
              <span className="stats-card-label">Saídas</span>
            </div>
            <div className="stats-card-value">8.000</div>
          </div>
        </section>

        <section className="charts-filters">
          <div className="filter-group">
            <label htmlFor="search" className="filter-label">Buscar:</label>
            <input
              id="search"
              type="text"
              placeholder="Buscar por descrição ou categoria..."
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="type" className="filter-label">Tipo:</label>
            <select id="type" className="filter-select">
              <option value="all">Todos</option>
              <option value="income">Entradas</option>
              <option value="expense">Saídas</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category" className="filter-label">Categoria:</label>
            <select id="category" className="filter-select">
              <option value="all">Todas</option>
              <option value="vendas">Vendas</option>
              <option value="utilidades">Utilidades</option>
            </select>
          </div>
        </section>

        <section className="charts-main-chart">
          <h2 className="charts-main-chart-title">Visão Geral Financeira</h2>

          <div className="charts-graph-container">
            <div className="charts-y-axis-labels">
              {[70000, 60000, 50000, 40000, 30000, 20000, 10000, 0].map((val) => (
                <span key={val} className="charts-y-axis-label">{val}</span>
              ))}
            </div>

            <div className="charts-graph-area">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="charts-grid-line"
                  style={{ top: `${(i / 7) * 100}%` }}
                />
              ))}

              <div className="charts-bars-container">
                {chartData.map((data, index) => (
                  <div key={index} className="charts-bar-group">
                    <div className="charts-bars">
                      <div
                        className="charts-bar income-bar"
                        style={{ height: `${(data.income / maxValue) * 100}%` }}
                        title={`R$ ${(data.income / 100).toLocaleString('pt-BR')}`}
                      />
                      <div
                        className="charts-bar expense-bar"
                        style={{ height: `${(data.expense / maxValue) * 100}%` }}
                        title={`R$ ${(data.expense / 100).toLocaleString('pt-BR')}`}
                      />
                    </div>
                    <span className="charts-bar-label">{data.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="charts-legend">
            <div className="legend-item">
              <div className="legend-color income-color" />
              <span>Entradas</span>
            </div>
            <div className="legend-item">
              <div className="legend-color expense-color" />
              <span>Saídas</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Charts;