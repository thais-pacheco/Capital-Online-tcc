import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Interface do usuário com base na sua tabela
interface User {
  id: string;        // UUID
  nome: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Roda apenas uma vez, ao iniciar
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      setUser(JSON.parse(userData));
    }

    setIsLoading(false);
  }, []);

  const login = async (email: string, senha: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/auth/login/', {
        email,
        senha,
      });

      const { token, usuario } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));

      setUser(usuario);
    } catch (error: any) {
      console.error(error);
      throw new Error('Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nome: string, email: string, senha: string) => {
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/auth/cadastro/', {
        nome,
        email,
        senha,
      });

      const { token, usuario } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));

      setUser(usuario);
    } catch (error: any) {
      console.error(error);
      throw new Error('Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
