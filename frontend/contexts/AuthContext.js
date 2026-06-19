'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // ── Bootstrap: load persisted token and fetch current user ────────────────
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
          setLoading(false);
          return;
        }

        setToken(storedToken);

        const { data } = await api.getMe();
        // Backend returns { success, data: { id, name, email, ... } }
        const fetchedUser = data.data || data;
        setUser(fetchedUser);
        setIsAuthenticated(true);
      } catch {
        // Token is invalid or expired — clear persisted state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const persistSession = (authToken, authUser) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
    setIsAuthenticated(true);
  };

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // ── Public API ────────────────────────────────────────────────────────────

  const login = async (credentials) => {
    const { data } = await api.login(credentials);
    // Backend returns { success, data: { user, token } }
    const { token: authToken, user: authUser } = data.data;
    persistSession(authToken, authUser);
    return authUser;
  };

  const googleLogin = async (credential) => {
    const { data } = await api.googleLogin({ credential });
    const { token: authToken, user: authUser } = data.data;
    persistSession(authToken, authUser);
    return authUser;
  };

  const adminLogin = async (credentials) => {
    const { data } = await api.adminLogin(credentials);
    // Backend returns { success, data: { admin, token } }
    const { token: authToken, admin: authAdmin } = data.data;
    persistSession(authToken, authAdmin);
    return authAdmin;
  };

  const register = async (userData) => {
    const { data } = await api.register(userData);
    // Backend returns { success, data: { user, token } }
    const { token: authToken, user: authUser } = data.data;
    persistSession(authToken, authUser);
    return authUser;
  };

  const logout = useCallback(() => {
    clearSession();
    router.push('/');
  }, [router]);

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData };
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    adminLogin,
    googleLogin,
    logout,
    register,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
