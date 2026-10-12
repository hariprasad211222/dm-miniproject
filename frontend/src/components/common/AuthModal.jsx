import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { LogIn, UserPlus, Shield, User } from 'lucide-react';

export default function AuthModal() {
  const { isAuthModalOpen, authMode, setAuthMode, closeAuthModal, login, register } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Marketing Lead');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMode === 'login') {
        await login(email, password);
        showToast('Successfully logged in!', 'success');
      } else {
        await register(name, email, password, role);
        showToast('Account created successfully!', 'success');
      }
    } catch (err) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    if (authMode === 'register') {
      setName(demoEmail.includes('admin') ? 'Demo Administrator' : 'Growth Specialist');
    }
    setError('');
  };

  return (
    <div className="modal-overlay" onClick={closeAuthModal}>
      <div className="modal-container" style={{ maxWidth: 460 }} onClick={e => e.stopPropagation()}>
        {/* Header Tabs */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              background: authMode === 'login' ? 'var(--bg-surface)' : 'transparent',
              color: authMode === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderBottom: authMode === 'login' ? '2px solid var(--border-focus)' : 'none'
            }}
          >
            <LogIn size={16} /> Sign In
          </button>
          <button
            type="button"
            onClick={() => { setAuthMode('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '16px',
              border: 'none',
              background: authMode === 'register' ? 'var(--bg-surface)' : 'transparent',
              color: authMode === 'register' ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderBottom: authMode === 'register' ? '2px solid var(--border-focus)' : 'none'
            }}
          >
            <UserPlus size={16} /> Create Account
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{
              marginBottom: 16,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: 13
            }}>
              {error}
            </div>
          )}

          {authMode === 'register' && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input"
                placeholder="Jane Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="input"
              placeholder="marketer@company.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {authMode === 'register' && (
            <div className="form-group">
              <label className="form-label">Marketing Role</label>
              <select
                className="select"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option value="Marketing Lead">Marketing Lead</option>
                <option value="Campaign Specialist">Campaign Specialist</option>
                <option value="Growth Strategist">Growth Strategist</option>
                <option value="Data Analyst">Data Analyst</option>
              </select>
            </div>
          )}

          {/* Quick Demo Fill Buttons */}
          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>
              QUICK DEMO CREDENTIALS:
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: 11.5 }}
                onClick={() => fillDemo('admin@marketing.ai', 'password123')}
              >
                <Shield size={13} /> Admin Demo
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                style={{ flex: 1, fontSize: 11.5 }}
                onClick={() => fillDemo('marketer@company.com', 'password123')}
              >
                <User size={13} /> Marketer Demo
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (authMode === 'login' ? 'Sign In to Workspace' : 'Create & Access')}
          </button>
        </form>
      </div>
    </div>
  );
}
