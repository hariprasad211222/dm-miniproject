import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Sparkles,
  LogIn,
  UserPlus,
  Briefcase,
  User,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function AuthPage() {
  const { login, register } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [accountType, setAccountType] = useState('business'); // 'personal' or 'business'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
        showToast('Welcome back! Session loaded successfully.', 'success');
      } else {
        await register(name, email, password, accountType);
        showToast(`Account created as ${accountType === 'business' ? 'Business Pro' : 'Personal Creator'}!`, 'success');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-page)',
        padding: 24
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: 960,
          display: 'grid',
          gridTemplateColumns: '1.1fr 1fr',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: 'var(--card-shadow)'
        }}
      >
        {/* Left Side: Brand Narrative & Tier Features */}
        <div
          style={{
            padding: '48px 40px',
            backgroundColor: 'var(--bg-subtle)',
            borderRight: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--btn-primary-bg)',
                  color: 'var(--btn-primary-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 18,
                  letterSpacing: '-0.03em'
                }}
              >
                DM
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                DMAUT AI
              </span>
            </div>

            <h2 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.25, color: 'var(--text-main)', marginBottom: 12 }}>
              Intelligent Marketing Automation & Campaign Platform
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 28 }}>
              Craft high-converting copy with Google Gemini, segment customers using behavioral RFM algorithms, schedule campaigns, and run automated growth rules.
            </p>

            {/* Account Tiers Overview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13.5, color: 'var(--text-main)', marginBottom: 4 }}>
                  <Briefcase size={16} /> Business Account
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Full suite: Multi-channel campaigns, CSV RFM segmentation, event-driven automations, A/B test optimizer, and revenue matrix analytics.
                </div>
              </div>

              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-surface)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13.5, color: 'var(--text-main)', marginBottom: 4 }}>
                  <User size={16} /> Personal Account
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Simplified workspace: AI copy generation, focused newsletter/email campaigns, and personal reach metrics without enterprise clutter.
                </div>
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11.5, color: 'var(--text-dim)', marginTop: 24, display: 'flex', alignItems: 'center', gap: 6 }}>
            <ShieldCheck size={14} />
            <span>Strict per-user data isolation. Every account owns an independent session.</span>
          </div>
        </div>

        {/* Right Side: Form Controls */}
        <div style={{ padding: '48px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {/* Mode Switch Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--bg-subtle)',
              padding: 4,
              borderRadius: 'var(--radius-sm)',
              marginBottom: 24
            }}
          >
            <button
              type="button"
              onClick={() => { setMode('login'); setError(''); }}
              style={{
                flex: 1,
                padding: '8px 14px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: mode === 'login' ? 'var(--bg-surface)' : 'transparent',
                color: mode === 'login' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(''); }}
              style={{
                flex: 1,
                padding: '8px 14px',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: mode === 'register' ? 'var(--bg-surface)' : 'transparent',
                color: mode === 'register' ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'var(--transition)'
              }}
            >
              Create Account
            </button>
          </div>

          {error && (
            <div
              style={{
                marginBottom: 16,
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ef4444',
                fontSize: 13
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {mode === 'register' && (
              <>
                {/* Account Type Selector */}
                <div>
                  <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>Select Account Tier</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => setAccountType('business')}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: accountType === 'business' ? '2px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                        background: accountType === 'business' ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13 }}>Business</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>All 6 Pro Features</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setAccountType('personal')}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-sm)',
                        border: accountType === 'personal' ? '2px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                        background: accountType === 'personal' ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                        color: 'var(--text-main)',
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 13 }}>Personal</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Essential Creator</div>
                    </button>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="input"
                    placeholder="Your Name or Brand"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="name@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
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

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: 8 }}
              disabled={loading}
            >
              {loading ? 'Authenticating...' : (mode === 'login' ? 'Sign In to Workspace' : 'Create & Access My Session')}
            </button>
          </form>

          <p style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
            {mode === 'login' ? "Don't have an account yet? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              {mode === 'login' ? 'Create one now' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
