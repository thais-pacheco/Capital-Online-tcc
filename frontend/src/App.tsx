import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import Auth from "./components/auth/auth";
import Dashboard from "./components/dashboard/Dashboard";
import Home from "./components/home/home";
import NewTransaction from "./components/newtransaction/newtransaction";
import Objectives from "./components/objectives/objectives";
import Profile from "./components/perfil/Profile";

const userId = "123";

function AppRoutes() {
  const navigate = useNavigate();

  const onNavigate = (page: string) => {
    switch (page) {
      case "dashboard":
        navigate("/dashboard");
        break;
      case "new-transaction":
        navigate("/nova-movimentacao");
        break;
      case "charts":
        // ainda não existe rota /graficos no App; vamos redirecionar para o dashboard
        navigate("/");
        break;
      case "goals":
        navigate("/objetivos");
        break;
      case "profile":
        navigate("/perfil");
        break;
      default:
        navigate("/");
        break;
    }
  };

  const onLogout = () => {
    navigate("/login");
  };

  return (
    <Routes>
      {/* Home */}
      <Route path="/" element={<Home />} />

      {/* Login */}
      <Route path="/login" element={<Auth />} />

      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Nova Movimentação */}
      <Route path="/nova-movimentacao" element={<NewTransaction />} />

      {/* Objetivos */}
      <Route
        path="/objetivos"
        element={
          <Objectives
            onNavigate={onNavigate}
            onLogout={onLogout}
            userId={userId}
          />
        }
      />

      {/* Perfil */}
      <Route
        path="/perfil"
        element={
          <Profile
            onNavigate={onNavigate}
            onLogout={onLogout}
          />
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
