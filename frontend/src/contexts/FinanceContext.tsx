import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface FinanceContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  getBalance: () => number;
  getMonthlyIncome: () => number;
  getMonthlyExpenses: () => number;
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined);

export const useFinance = () => {
  const context = useContext(FinanceContext);
  if (context === undefined) {
    throw new Error('useFinance must be used within a FinanceProvider');
  }
  return context;
};

export const FinanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<Category[]>([
    { id: '1', name: 'Alimentação', color: '#EF4444', icon: 'UtensilsCrossed' },
    { id: '2', name: 'Transporte', color: '#3B82F6', icon: 'Car' },
    { id: '3', name: 'Lazer', color: '#8B5CF6', icon: 'Gamepad2' },
    { id: '4', name: 'Saúde', color: '#10B981', icon: 'Heart' },
    { id: '5', name: 'Educação', color: '#F59E0B', icon: 'GraduationCap' },
    { id: '6', name: 'Salário', color: '#10B981', icon: 'DollarSign' },
    { id: '7', name: 'Investimentos', color: '#6366F1', icon: 'TrendingUp' },
  ]);

  useEffect(() => {
    // Dados mockados iniciais
    const mockTransactions: Transaction[] = [
      {
        id: '1',
        type: 'income',
        amount: 5000,
        category: 'Salário',
        description: 'Salário mensal',
        date: '2024-01-15',
      },
      {
        id: '2',
        type: 'expense',
        amount: 1200,
        category: 'Alimentação',
        description: 'Supermercado',
        date: '2024-01-10',
      },
      {
        id: '3',
        type: 'expense',
        amount: 300,
        category: 'Transporte',
        description: 'Combustível',
        date: '2024-01-08',
      },
      {
        id: '4',
        type: 'income',
        amount: 800,
        category: 'Investimentos',
        description: 'Dividendos',
        date: '2024-01-05',
      },
    ];
    setTransactions(mockTransactions);
  }, []);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => prev.map(t => 
      t.id === id ? { ...t, ...updatedTransaction } : t
    ));
  };

  const getBalance = () => {
    return transactions.reduce((acc, transaction) => {
      return transaction.type === 'income' ? acc + transaction.amount : acc - transaction.amount;
    }, 0);
  };

  const getMonthlyIncome = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'income' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getMonthlyExpenses = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    return transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return t.type === 'expense' && 
               transactionDate.getMonth() === currentMonth && 
               transactionDate.getFullYear() === currentYear;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  return (
    <FinanceContext.Provider value={{
      transactions,
      categories,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      getBalance,
      getMonthlyIncome,
      getMonthlyExpenses,
    }}>
      {children}
    </FinanceContext.Provider>
  );
};