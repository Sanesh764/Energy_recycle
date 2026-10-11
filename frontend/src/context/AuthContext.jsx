import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

/**
 * AUTHENTICATION CONTEXT & SESSION MANAGEMENT
 * 
 * Manages authenticated user state, tokens, and role-based access.
 * Communicates with backend /api/auth endpoints for login, signup, and me verification.
 * 
 * Enforced Roles:
 * - citizen: can register devices, request pickups, earn rewards
 * - collector: can view open pickups, accept/collect pickups, inspect devices
 * - admin: view comprehensive impact stats, audit all devices
 */

const AuthContext = createContext(null);

const STORAGE_KEY = 'ewaste_dev_auth_session';

export const ROLES = {
  CITIZEN: 'citizen',
  COLLECTOR: 'collector',
  ADMIN: 'admin',
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore parse error
    }
    return null;
  });

  const [loading, setLoading] = useState(true);

  // Verify session on mount with server-side /api/auth/me
  useEffect(() => {
    let isMounted = true;
    async function verifySession() {
      const token = localStorage.getItem('ewaste_auth_token');
      if (!token) {
        if (isMounted) {
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
          setLoading(false);
        }
        return;
      }

      try {
        const response = await authApi.getMe();
        if (isMounted) {
          setUser(response.user);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(response.user));
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          console.warn('Authentication token expired or invalid:', err.message);
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem('ewaste_auth_token');
          setLoading(false);
        }
      }
    }

    verifySession();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await authApi.login({ email, password });
      localStorage.setItem('ewaste_auth_token', data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async ({ name, email, password }) => {
    setLoading(true);
    try {
      const data = await authApi.signup({ name, email, password });
      localStorage.setItem('ewaste_auth_token', data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('ewaste_auth_token');
  };

  // Quick dev account switcher: genuine authentication via backend
  const quickDevLogin = async (targetRole) => {
    let email = 'citizen@example.org';
    if (targetRole === ROLES.ADMIN) {
      email = 'sanesh7644@gmail.com';
    } else if (targetRole === ROLES.COLLECTOR) {
      email = 'santosh@gmail.com';
    }
    return await login({ email, password: 'password@123' });
  };

  // Alias for backward compatibility that securely calls genuine dev login
  const switchRole = async (newRole) => {
    return await quickDevLogin(newRole);
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    signup,
    logout,
    quickDevLogin,
    switchRole,
    getAuthToken: () => localStorage.getItem('ewaste_auth_token'),
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
