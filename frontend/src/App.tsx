import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/auth/auth';
import Dashboard from './components/dashboard/Dashboard';
import NewTransaction from './components/newtransaction/NewTransaction'; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/new-transaction"
          element={
            <NewTransaction
              onNavigate={() => { /* implement navigation logic here */ }}
              onLogout={() => { /* implement logout logic here */ }}
            />
          }
        /> {/* ✅ Nova rota */}
      </Routes>
    </Router>
  );
}

export default App;
