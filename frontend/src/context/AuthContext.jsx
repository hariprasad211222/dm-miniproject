import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('dmaut_auth');
      return saved ? JSON.parse(saved).user : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      const saved = localStorage.getItem('dmaut_auth');
      return saved ? JSON.parse(saved).token : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('dmaut_auth', JSON.stringify({ user, token }));
    } else {
      localStorage.removeItem('dmaut_auth');
    }
  }, [user, token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Login failed' }));
        throw new Error(data.error || 'Invalid credentials');
      }

      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, accountType = 'business') => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, accountType })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(data.error || 'Registration failed');
      }

      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      return { success: true };
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dmaut_auth');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        updateUser,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
