import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Home from './home/home'; // ou './home/Home' dependendo do seu SO
import Auth from './components/auth/auth';
import Dashboard from './components/dashboard/Dashboard';
import NewTransaction from './components/newtransaction/NewTransaction';

function NewTransactionWrapper() {
  const navigate = useNavigate();

  return (
    <NewTransaction
      onNavigate={(page) => {
        if (page === 'dashboard') navigate('/dashboard');
        if (page === 'charts') navigate('/charts');
        if (page === 'goals') navigate('/goals');
      }}
      onLogout={() => navigate('/')}
    />
  );
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Página inicial: Home */}
        <Route path="/" element={<Home />} />
        
        {/* Página de login */}
        <Route path="/login" element={<Auth />} />
        
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Nova transação */}
        <Route path="/new-transaction" element={<NewTransactionWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;
