import React from 'react';
import { 
  Home, 
  CreditCard, 
  PieChart, 
  Settings, 
  LogOut,
  TrendingUp,
  Wallet,
  Target,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isOpen, toggleSidebar }) => {
  const { logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', icon: Home, id: 'dashboard' },
    { name: 'Transações', icon: CreditCard, id: 'transactions' },
    { name: 'Relatórios', icon: PieChart, id: 'reports' },
    { name: 'Investimentos', icon: TrendingUp, id: 'investments' },
    { name: 'Carteira', icon: Wallet, id: 'wallet' },
    { name: 'Objetivos', icon: Target, id: 'goals' },
    { name: 'Configurações', icon: Settings, id: 'settings' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <div className="bg-emerald-600 p-2 rounded-full">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Capital Online</h1>
            </div>
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6">
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setCurrentPage(item.id);
                      toggleSidebar();
                    }}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors
                      ${currentPage === item.id 
                        ? 'bg-emerald-100 text-emerald-700 border-r-2 border-emerald-600' 
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Sair
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;