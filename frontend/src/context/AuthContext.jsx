import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, configureSession } from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null), [notice, setNotice] = useState('');
  const logout = useCallback((expired = false) => { configureSession(null); setSession(null); setNotice(expired ? 'Tu sesión venció o dejó de ser válida. Inicia sesión de nuevo.' : ''); }, []);
  async function login(correo, password) {
    const { data } = await api('/auth/login', { method: 'POST', body: { correo, password }, publicRequest: true });
    configureSession(data.token, () => logout(true)); setSession(data); setNotice('');
  }
  async function register(body) { await api('/auth/register', { method: 'POST', body, publicRequest: true }); }
  useEffect(() => {
    if (!session) return;
    const payload = JSON.parse(atob(session.token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    const timer = setTimeout(() => logout(true), Math.max(0, payload.exp * 1000 - Date.now()));
    return () => clearTimeout(timer);
  }, [session, logout]);
  return <AuthContext.Provider value={{ usuario: session?.usuario, token: session?.token, login, register, logout, notice }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
