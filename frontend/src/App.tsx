import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Auth from './components/auth/auth';
import Dashboard from './components/dashboard/Dashboard';
import Home from './components/home/home';
import NewTransaction from './components/newtransaction/newtransaction';
import Objectives from './components/objectives/objectives';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/nova-movimentacao" element={<NewTransaction />} />
        <Route
          path="/objetivos"
          element={
            <Objectives
              onNavigate={(page) => console.log("Navegar para:", page)}
              onLogout={() => console.log("Logout")}
              userId="123" // depois você pode substituir pelo id real do usuário logado
            />
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
