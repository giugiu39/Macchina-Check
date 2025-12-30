import { createContext, useContext, useEffect, useState } from 'react';
import { api, setToken, getToken } from '../lib/api';

type AuthContextType = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getToken());

  useEffect(() => {
    if (token) setToken(token); else setToken(null);
  }, [token]);

  async function login(email: string, password: string) {
    const { token } = await api.login({ email, password });
    setTokenState(token);
  }

  async function register(payload: any) {
    const { token } = await api.register(payload);
    setTokenState(token);
  }

  function logout() {
    setTokenState(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}