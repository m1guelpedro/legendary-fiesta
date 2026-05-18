import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('finance_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('finance_token'));
  const [loading, setLoading] = useState(Boolean(localStorage.getItem('finance_token')));

  useEffect(() => {
    const loadProfile = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.profile();
        setUser(data.usuario);
        localStorage.setItem('finance_user', JSON.stringify(data.usuario));
      } catch {
        localStorage.removeItem('finance_token');
        localStorage.removeItem('finance_user');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [token]);

  const persistSession = (data) => {
    localStorage.setItem('finance_token', data.token);
    localStorage.setItem('finance_user', JSON.stringify(data.usuario));
    setToken(data.token);
    setUser(data.usuario);
  };

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    persistSession(data);
    return data;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload);
    persistSession(data);
    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await authService.logout();
    } finally {
      localStorage.removeItem('finance_token');
      localStorage.removeItem('finance_user');
      setToken(null);
      setUser(null);
    }
  }, [token]);

  const value = useMemo(() => ({
    user,
    token,
    loading,
    isAuthenticated: Boolean(token && user),
    login,
    register,
    logout,
  }), [user, token, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
