import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Auth from './components/auth/auth';
import Dashboard from './components/dashboard/Dashboard';
import Objectives from './components/objectives/objectives';

// Definindo o tipo Page centralizado aqui
type Page = 'dashboard' | 'new-transaction' | 'charts' | 'objetivos';

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

function ObjectivesWrapper() {
  const navigate = useNavigate();

  const handleNavigate = (page: Page) => {
    switch (page) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'new-transaction':
        // implementar depois
        break;
      case 'charts':
        // implementar depois
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

  return <Objectives onNavigate={handleNavigate} onLogout={handleLogout} userId="" />;
}

export default App;