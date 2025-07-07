import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet 
} from 'lucide-react';
import { useFinance } from '../../contexts/FinanceContext';
import StatCard from './StatCard';
import TransactionList from './TransactionList';

const Dashboard: React.FC = () => {
  const { transactions, getBalance, getMonthlyIncome, getMonthlyExpenses } = useFinance();

  const balance = getBalance();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral das suas finanças</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Saldo Total"
          value={formatCurrency(balance)}
          icon={Wallet}
          color="blue"
          change="+5.2% este mês"
          changeType="positive"
        />
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(monthlyIncome)}
          icon={TrendingUp}
          color="green"
          change="+12.5% vs mês anterior"
          changeType="positive"
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(monthlyExpenses)}
          icon={TrendingDown}
          color="red"
          change="-3.2% vs mês anterior"
          changeType="positive"
        />
        <StatCard
          title="Economia"
          value={formatCurrency(monthlyIncome - monthlyExpenses)}
          icon={DollarSign}
          color="purple"
          change="+8.1% vs mês anterior"
          changeType="positive"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <TransactionList transactions={transactions} />

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors">
              <TrendingUp className="h-5 w-5" />
              <span>Adicionar Receita</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
              <TrendingDown className="h-5 w-5" />
              <span>Adicionar Despesa</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
              <Wallet className="h-5 w-5" />
              <span>Ver Relatórios</span>
            </button>
          </div>
        </div>
      </div>

      {/* Monthly Summary Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Mensal</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Gráfico de resumo mensal será implementado aqui</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;