import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PiggyBank,
  LayoutDashboard,
  Target,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import './home.css';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      {/* Header */}
      <header className="home-header">
        <div className="logo">
          <PiggyBank color="#22c55e" />
          <span className="logo-text">CAPITAL ONLINE</span>
        </div>
        <div className="home-nav-buttons">
          <button className="home-login" onClick={() => navigate('/login')}>Entrar</button>
        </div>
      </header>

      {/* Hero */}
      <section className="hero">
        <h1>
          Sua jornada financeira <br />
          <span className="green">começa aqui</span>
        </h1>
        <p>
          Gerencie suas finanças de forma inteligente com nossa plataforma completa.
          Dashboard avançado, controle total e insights que transformam sua vida financeira.
        </p>
      </section>

      {/* Features */}
      <section className="features">
        <h2>Recursos que fazem a diferença</h2>
        <p>Descubra como nossa plataforma pode revolucionar a forma como você gerencia suas finanças</p>
        <div className="features-grid">
          <div className="feature-item">
            <LayoutDashboard color="#22c55e" size={48} />
            <h3>Dashboard Inteligente</h3>
            <p>Visualize todas suas finanças em gráficos intuitivos e relatórios atualizados em tempo real.</p>
          </div>
          <div className="feature-item">
            <Target color="#22c55e" size={48} />
            <h3>Objetivos Financeiros</h3>
            <p>Defina metas e acompanhe seu progresso com transparência e foco na independência financeira.</p>
          </div>
          <div className="feature-item">
            <ShieldCheck color="#22c55e" size={48} />
            <h3>Segurança Total</h3>
            <p>Seus dados protegidos com criptografia e autenticação avançada.</p>
          </div>
          <div className="feature-item">
            <BarChart3 color="#22c55e" size={48} />
            <h3>Análises Avançadas</h3>
            <p>Obtenha insights sobre seus gastos, renda e hábitos financeiros com gráficos e relatórios.</p>
          </div>
        </div>
      </section>

      {/* Controle financeiro (Objetivos) */}
      <section className="control">
        <h2>Objetivos que te levam além</h2>
        <p>
          Tenha metas claras e alcançáveis com nosso sistema de objetivos financeiros.
          Acompanhe o progresso e celebre cada conquista.
        </p>
      </section>

      {/* Call to action */}
      <section className="cta">
        <h2>Pronto para transformar suas finanças?</h2>
        <p>Junte-se a milhares de usuários que já estão no controle de suas finanças</p>
        <button className="cta-button" onClick={() => navigate('/login')}>
          Comece agora! É grátis →
        </button>
      </section>

      {/* Footer */}
      <footer className="home-footer">
    
        
        <div className="footer-bottom">
          © 2025 Capital Online. 
        </div>
      </footer>
    </div>
  );
};

export default Home;