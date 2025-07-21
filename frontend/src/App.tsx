import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Auth from './components/auth/auth';
import Dashboard from './components/dashboard/Dashboard';
import Objectives from './components/objectives/objectives';
import React from 'react';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/objetivos" element={<ObjectivesWrapper />} />
      </Routes>
    </Router>
  );
}

type Page = 'dashboard' | 'new-transaction' | 'charts' | 'objetivos';

function ObjectivesWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page: Page) => {
    switch (page) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'new-transaction':
        // navegar para nova transação
        break;
      case 'charts':
        // navegar para gráficos
        break;
      case 'objetivos':
        navigate('/objetivos');
        break;
      default:
        navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <Objectives 
      onNavigate={handleNavigate}
      onLogout={handleLogout} />
  );
}

export default App;
