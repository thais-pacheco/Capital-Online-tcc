 import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Auth from './components/auth/auth';
import Dashboard from './components/dashboard/Dashboard';
import Home from './components/home/home';
import NewTransaction from './components/newtransaction/newtransaction';
import Objectives from './components/objectives/objectives';
import Charts from './components/charts/charts';
import Profile from './components/profile/Profile';
import ForgotPassword from './components/auth/ForgotPassword';
import type { Page } from './types';


interface PageProps {
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}


// Wrapper genérico para passar as props necessárias
function withNavigation<P extends object>(Component: React.ComponentType<P & PageProps>) {
  return (props: P) => {
    const navigate = useNavigate();


    const handleNavigate = (page: Page) => {
      switch (page) {
        case 'dashboard':
          navigate('/dashboard');
          break;
        case 'new-transaction':
          navigate('/nova-movimentacao');
          break;
        case 'charts':
          navigate('/graficos');
          break;
        case 'objetivos':
          navigate('/objetivos');
          break;
        case 'profile':
          navigate('/profile');
          break;
        default:
          navigate('/dashboard');
      }
    };


    const handleLogout = () => {
      navigate('/login');
    };


    return <Component {...props} onNavigate={handleNavigate} onLogout={handleLogout} />;
  };
}


// Wrappers para cada página que precisa de navegação
const DashboardWrapper = withNavigation(Dashboard);
const ObjectivesWrapper = withNavigation(Objectives);
const NewTransactionWrapper = withNavigation(NewTransaction);
const HomeWrapper = withNavigation(Home);
const ChartsWrapper = withNavigation(Charts);


const ProfileWrapper = () => {
  const navigate = useNavigate();
  return <Profile onLogout={() => navigate('/login')} />;
};


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeWrapper />} />
        <Route path="/dashboard" element={<DashboardWrapper />} />
        <Route path="/nova-movimentacao" element={<NewTransactionWrapper />} />
        <Route path="/objetivos" element={<ObjectivesWrapper />} />
        <Route path="/graficos" element={<ChartsWrapper />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/profile" element={<ProfileWrapper />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
      </Routes>
    </Router>
  );
}


export default App;
