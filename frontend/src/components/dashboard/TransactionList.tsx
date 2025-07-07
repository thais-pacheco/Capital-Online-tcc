import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { Transaction } from '../../contexts/FinanceContext';

interface TransactionListProps {
  transactions: Transaction[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Transações Recentes</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {transactions.slice(0, 5).map((transaction) => (
          <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  transaction.type === 'income' ? 'bg-emerald-100' : 'bg-red-100'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpRight className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 text-red-600" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-xs text-gray-500">{transaction.category}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`text-sm font-semibold ${
                  transaction.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-xs text-gray-500">{formatDate(transaction.date)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-6 border-t border-gray-200">
        <button className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          Ver todas as transações
        </button>
      </div>
    </div>
  );
};

export default TransactionList;