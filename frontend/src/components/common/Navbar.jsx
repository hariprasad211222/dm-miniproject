import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import ApiKeyModal from './ApiKeyModal.jsx';
import { Sparkles, Key, LogOut, User, Cpu, ShieldCheck } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, openLogin, openRegister } = useAuth();
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);

  return (
    <>
      <header
        style={{
          height: 64,
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          position: 'sticky',
          top: 0,
          zIndex: 100
        }}
      >
        {/* Left: Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--btn-primary-bg)',
              color: 'var(--btn-primary-text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: 16,
              letterSpacing: '-0.03em'
            }}
          >
            DM
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
                DMAUT AI
              </span>
              <span className="badge" style={{ fontSize: 10 }}>v2.0</span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Intelligent Marketing Automation & Campaign Intelligence
            </p>
          </div>
        </div>

        {/* Right: Actions, AI Key, Theme, Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* AI Settings / Model Key */}
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsKeyModalOpen(true)}
            title="Configure Gemini & LLM Provider API Keys"
          >
            <Key size={14} />
            <span>AI Model Keys</span>
          </button>

          {/* Theme Toggle (Dark / Light / System) */}
          <ThemeToggle />

          {/* Divider */}
          <div style={{ width: 1, height: 24, backgroundColor: 'var(--border-subtle)' }} />

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '4px 10px',
                  background: 'var(--bg-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--btn-primary-bg)',
                    color: 'var(--btn-primary-text)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700
                  }}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div style={{ lineHeight: 1.1 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)' }}>{user.name}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>{user.role || 'Marketer'}</div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={logout}
                title="Log out"
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={openLogin}
              >
                Sign In
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={openRegister}
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </header>

      <ApiKeyModal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} />
    </>
  );
}
