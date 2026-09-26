import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, formatApiError } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('cyberguard_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('cyberguard_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('cyberguard_token');
      if (!savedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getMe();
        setUser(res.data);
        localStorage.setItem('cyberguard_user', JSON.stringify(res.data));
      } catch (err) {
        console.warn('Session verification failed, logging out:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('cyberguard_token', access_token);
      localStorage.setItem('cyberguard_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: formatApiError(err) };
    }
  };

  const register = async (name, email, password, confirm_password) => {
    try {
      const res = await authAPI.register({ name, email, password, confirm_password });
      const { access_token, user: userData } = res.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('cyberguard_token', access_token);
      localStorage.setItem('cyberguard_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      return { success: false, error: formatApiError(err) };
    }
  };

  const logout = () => {
    try {
      if (token) {
        authAPI.logout().catch(() => {});
      }
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('cyberguard_token');
      localStorage.removeItem('cyberguard_user');
    }
  };

  const updateUserData = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem('cyberguard_user', JSON.stringify(newUserData));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        loading,
        login,
        register,
        logout,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
