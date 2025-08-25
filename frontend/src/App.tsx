import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Auth from "./components/auth/auth";
import Dashboard from "./components/dashboard/Dashboard";
import Home from "./components/home/home";
import NewTransaction from "./components/newtransaction/newtransaction";
import Objectives from "./components/objectives/objectives";
import Charts from "./components/charts/charts";

const userId = "123";

function App() {
  const handleLogout = () => {
    console.log("Logout");
    // Aqui você pode limpar sessão, cookies, etc
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/nova-movimentacao" element={<NewTransaction />} />
        <Route
  path="/objetivos"
  element={
    <Objectives
      onNavigate={(page) => console.log("Navegar para:", page)}
      onLogout={handleLogout}
      userId={userId}
    />
  }
/>

        <Route
          path="/graficos"
          element={<Charts onLogout={handleLogout} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
