import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AUTHENTICATION BOUNDARY & CONTEXT
 * 
 * NOTE: This is a clean client-side authentication boundary designed to be
 * replaced with Amazon Cognito user pool authentication (JWT) without rewriting the UI.
 * 
 * In this initial frontend phase, it manages active role switching (citizen, collector, admin)
 * and auth state for local testing. It does NOT contain fake backend authentication logic
 * and must never be mistaken for production security.
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
    // Default initial mock state for local preview: Citizen
    return {
      id: 'usr_dev_citizen_01',
      name: 'Sample Citizen',
      email: 'citizen@example.org',
      role: ROLES.CITIZEN,
      servicePincodes: [],
    };
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      // Storage unavailable
    }
  }, [user]);

  const login = async ({ email, role = ROLES.CITIZEN }) => {
    setLoading(true);
    // Boundary hook: In production, this calls Cognito Auth.signIn()
    // For now, sets the active development session with designated role
    const mockUser = {
      id: `usr_dev_${role}_${Date.now()}`,
      name: email ? email.split('@')[0] : `Sample ${role}`,
      email: email || `${role}@example.org`,
      role,
      servicePincodes: role === ROLES.COLLECTOR ? ['110001', '110002'] : [],
    };
    setUser(mockUser);
    setLoading(false);
    return mockUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const switchRole = (newRole) => {
    if (!Object.values(ROLES).includes(newRole)) return;
    setUser((prev) => ({
      ...(prev || { id: 'usr_switch', email: `${newRole}@example.org` }),
      name: `Active ${newRole.charAt(0).toUpperCase() + newRole.slice(1)}`,
      role: newRole,
      servicePincodes: newRole === ROLES.COLLECTOR ? ['110001', '110002'] : [],
    }));
  };

  const value = {
    user,
    role: user?.role || null,
    isAuthenticated: !!user,
    loading,
    login,
    logout,
    switchRole,
    // Cognito token placeholder boundary
    getAuthToken: () => (user ? 'MOCK_DEV_COGNITO_TOKEN_STUB' : null),
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
