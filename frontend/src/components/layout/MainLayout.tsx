import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../dashboard/Dashboard';
import TransactionsPage from '../transactions/TransactionsPage';

const MainLayout: React.FC = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'transactions':
        return <TransactionsPage />;
      case 'reports':
        return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Relatórios</h2>
          <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
        </div>;
      case 'investments':
        return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Investimentos</h2>
          <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
        </div>;
      case 'wallet':
        return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Carteira</h2>
          <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
        </div>;
      case 'goals':
        return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Objetivos</h2>
          <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
        </div>;
      case 'settings':
        return <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Configurações</h2>
          <p className="text-gray-600">Funcionalidade em desenvolvimento</p>
        </div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      
      <div className="lg:ml-64">
        <Header toggleSidebar={toggleSidebar} />
        
        <main className="p-6">
          {renderPage()}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;