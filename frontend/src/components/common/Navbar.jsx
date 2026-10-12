import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  HelpCircle,
  Settings,
  Shield,
  Briefcase,
  User,
  LogOut
} from 'lucide-react';

export default function Navbar({ onOpenSettings, onLaunchTour }) {
  const { user, logout } = useAuth();
  const isPersonal = user?.accountType === 'personal';

  return (
    <header
      style={{
        height: 58,
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--bg-surface)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 80
      }}
    >
      {/* Left: Active Workspace Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
            {user?.name}'s Workspace
          </span>
          <span style={{ color: 'var(--text-dim)' }}>•</span>
          <span className="badge" style={{ fontSize: 10 }}>
            {isPersonal ? 'Personal Creator' : 'Business Pro'}
          </span>
        </div>
      </div>

      {/* Right: Quick Help Tour, Settings & Session Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Onboarding Tour button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onLaunchTour}
          title="How to use DMAUT AI"
        >
          <HelpCircle size={14} />
          <span>Walkthrough Guide</span>
        </button>

        {/* Settings button */}
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onOpenSettings}
          title="Settings & Themes"
        >
          <Settings size={14} />
          <span>Settings</span>
        </button>

        {/* Log out */}
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={logout}
          title="Sign out of session"
          style={{ color: 'var(--text-muted)' }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </header>
  );
}
