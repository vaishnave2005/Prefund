import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

export interface User {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  role: 'AGENT' | 'GFSU_AC' | 'CAC' | 'TREASURY' | 'SG_AP' | 'ADMIN';
  assignedOfficeCode: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginAsRole: (role: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const DEMO_ACCOUNTS: Record<string, string> = {
  AGENT: 'agent.demo@pil-portal.com',
  GFSU_AC: 'gfsu.demo@pil-portal.com',
  CAC: 'cac.demo@pil-portal.com',
  TREASURY: 'treasury.demo@pil-portal.com',
  SG_AP: 'sgap.demo@pil-portal.com',
  ADMIN: 'admin.demo@pil-portal.com',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('pil_token');
    const storedUser = localStorage.getItem('pil_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    const { access_token, user: userData } = res.data;
    localStorage.setItem('pil_token', access_token);
    localStorage.setItem('pil_user', JSON.stringify(userData));
    setToken(access_token);
    setUser(userData);
  };

  const loginAsRole = async (role: string) => {
    const email = DEMO_ACCOUNTS[role];
    if (email) await login(email, 'Password123!');
  };

  const logout = () => {
    localStorage.removeItem('pil_token');
    localStorage.removeItem('pil_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, loginAsRole, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
