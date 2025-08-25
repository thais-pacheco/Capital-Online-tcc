import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Auth from "./components/auth/auth";
import Dashboard from "./components/dashboard/Dashboard";
import Home from "./components/home/home";
import NewTransaction from "./components/newtransaction/newtransaction";
import Objectives from "./components/objectives/objectives";
import Profile from "./components/perfil/Profile"; 

const userId = "123";

function App() {
  return (
    <Router>
      <Routes>
        {/* Agora "/" mostra o Home */}
        <Route path="/" element={<Home />} />

        {/* Auth fica em "/login" */}
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nova-movimentacao" element={<NewTransaction />} />
        <Route
          path="/objetivos"
          element={
            <Objectives
              onNavigate={(page) => console.log("Navegar para:", page)}
              onLogout={() => console.log("Logout")}
              userId={userId}
            />
          }
        />

        {/* Nova rota para o perfil */}
        <Route path="/perfil" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
