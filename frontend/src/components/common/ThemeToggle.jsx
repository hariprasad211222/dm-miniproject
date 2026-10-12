import React from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Sun, Moon, Laptop } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        background: 'var(--bg-subtle)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        padding: '3px',
        gap: '2px'
      }}
    >
      <button
        type="button"
        title="Light Mode (White)"
        onClick={() => setTheme('light')}
        style={{
          border: 'none',
          padding: '6px 9px',
          borderRadius: 'var(--radius-full)',
          background: theme === 'light' ? 'var(--bg-surface)' : 'transparent',
          color: theme === 'light' ? 'var(--text-main)' : 'var(--text-dim)',
          boxShadow: theme === 'light' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 12,
          fontWeight: 600,
          transition: 'var(--transition)'
        }}
      >
        <Sun size={13} />
        <span>Light</span>
      </button>

      <button
        type="button"
        title="Dark Mode"
        onClick={() => setTheme('dark')}
        style={{
          border: 'none',
          padding: '6px 9px',
          borderRadius: 'var(--radius-full)',
          background: theme === 'dark' ? 'var(--bg-surface)' : 'transparent',
          color: theme === 'dark' ? 'var(--text-main)' : 'var(--text-dim)',
          boxShadow: theme === 'dark' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 12,
          fontWeight: 600,
          transition: 'var(--transition)'
        }}
      >
        <Moon size={13} />
        <span>Dark</span>
      </button>

      <button
        type="button"
        title="System Preference"
        onClick={() => setTheme('system')}
        style={{
          border: 'none',
          padding: '6px 9px',
          borderRadius: 'var(--radius-full)',
          background: theme === 'system' ? 'var(--bg-surface)' : 'transparent',
          color: theme === 'system' ? 'var(--text-main)' : 'var(--text-dim)',
          boxShadow: theme === 'system' ? '0 1px 2px rgba(0,0,0,0.1)' : 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 5,
          fontSize: 12,
          fontWeight: 600,
          transition: 'var(--transition)'
        }}
      >
        <Laptop size={13} />
        <span>Auto</span>
      </button>
    </div>
  );
}
