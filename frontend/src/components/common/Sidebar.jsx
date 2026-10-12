import React from 'react';
import {
  Sparkles,
  Layers,
  Users,
  Zap,
  GitCompare,
  BarChart3,
  HelpCircle
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, counts = {} }) {
  const navItems = [
    {
      id: 'generator',
      label: 'AI Content Generator',
      icon: Sparkles,
      badge: 'AI Core'
    },
    {
      id: 'campaigns',
      label: 'Campaign Manager',
      icon: Layers,
      badge: counts.campaigns ? `${counts.campaigns}` : null
    },
    {
      id: 'segmentation',
      label: 'Customer Segmentation',
      icon: Users,
      badge: counts.customers ? `${counts.customers}` : null
    },
    {
      id: 'automations',
      label: 'Marketing Automation',
      icon: Zap,
      badge: counts.automations ? `${counts.automations}` : null
    },
    {
      id: 'optimizer',
      label: 'Campaign Optimizer',
      icon: GitCompare,
      badge: 'A/B Test'
    },
    {
      id: 'analytics',
      label: 'Analytics Dashboard',
      icon: BarChart3,
      badge: null
    }
  ];

  return (
    <aside
      style={{
        width: 260,
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0
      }}
    >
      {/* Top Header Label */}
      <div style={{ padding: '24px 20px 16px' }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-dim)' }}>
          WORKSPACE MODULES
        </span>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: '0 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                fontWeight: isActive ? 600 : 500,
                fontSize: 13.5,
                cursor: 'pointer',
                transition: 'var(--transition)',
                textAlign: 'left'
              }}
              onMouseEnter={e => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              }}
              onMouseLeave={e => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: isActive ? 'var(--text-main)' : 'var(--bg-subtle)',
                    color: isActive ? 'var(--bg-page)' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Info */}
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: 11.5,
          color: 'var(--text-dim)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: '#10b981' }} />
          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Engine Active</span>
        </div>
        <div>Monochrome High-Contrast Edition</div>
      </div>
    </aside>
  );
}
