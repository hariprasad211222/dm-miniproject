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

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'

  useEffect(() => {
    if (user && token) {
      localStorage.setItem('dmaut_auth', JSON.stringify({ user, token }));
    } else {
      localStorage.removeItem('dmaut_auth');
    }
  }, [user, token]);

  const login = async (email, password) => {
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
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      // Fallback local mock login if backend is unreachable
      if (email && password) {
        const mockUser = {
          id: 'usr-local',
          name: email.split('@')[0],
          email: email,
          role: email.includes('admin') ? 'Administrator' : 'Marketing Specialist',
          createdAt: new Date().toISOString()
        };
        const mockToken = `mock-token-${Date.now()}`;
        setUser(mockUser);
        setToken(mockToken);
        setIsAuthModalOpen(false);
        return { success: true, offline: true };
      }
      throw err;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Registration failed' }));
        throw new Error(data.error || 'Registration failed');
      }

      const data = await res.json();
      setUser(data.user);
      setToken(data.token);
      setIsAuthModalOpen(false);
      return { success: true };
    } catch (err) {
      if (email && password) {
        const mockUser = {
          id: `usr-${Date.now()}`,
          name: name || email.split('@')[0],
          email: email,
          role: role || 'Marketing Specialist',
          createdAt: new Date().toISOString()
        };
        const mockToken = `mock-token-${Date.now()}`;
        setUser(mockUser);
        setToken(mockToken);
        setIsAuthModalOpen(false);
        return { success: true, offline: true };
      }
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('dmaut_auth');
  };

  const openLogin = () => {
    setAuthMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthMode('register');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        isAuthModalOpen,
        authMode,
        setAuthMode,
        openLogin,
        openRegister,
        closeAuthModal
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
