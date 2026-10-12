import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  Sparkles,
  Layers,
  Users,
  Zap,
  GitCompare,
  BarChart3,
  Settings,
  User,
  PanelLeftClose,
  PanelLeftOpen,
  Briefcase,
  Lock,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  counts = {},
  isCollapsed,
  setIsCollapsed,
  onOpenSettings,
  onOpenAccount
}) {
  const { user } = useAuth();
  const isPersonal = user?.accountType === 'personal';

  // Navigation Items
  const allNavItems = [
    {
      id: 'generator',
      label: 'AI Content Generator',
      icon: Sparkles,
      badge: 'AI Core',
      availableForPersonal: true
    },
    {
      id: 'campaigns',
      label: 'Campaign Manager',
      icon: Layers,
      badge: counts.campaigns ? `${counts.campaigns}` : null,
      availableForPersonal: true
    },
    {
      id: 'segmentation',
      label: 'Customer Segmentation',
      icon: Users,
      badge: counts.customers ? `${counts.customers}` : null,
      availableForPersonal: false
    },
    {
      id: 'automations',
      label: 'Marketing Automation',
      icon: Zap,
      badge: counts.automations ? `${counts.automations}` : null,
      availableForPersonal: false
    },
    {
      id: 'optimizer',
      label: 'Campaign Optimizer',
      icon: GitCompare,
      badge: 'A/B Test',
      availableForPersonal: false
    },
    {
      id: 'analytics',
      label: 'Analytics Dashboard',
      icon: BarChart3,
      badge: null,
      availableForPersonal: true
    }
  ];

  return (
    <aside
      style={{
        width: isCollapsed ? 76 : 260,
        backgroundColor: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 90
      }}
    >
      {/* Top Header & Collapse Toggle */}
      <div
        style={{
          padding: isCollapsed ? '20px 0' : '20px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        {!isCollapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: 'var(--radius-sm)',
                background: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: '-0.03em'
              }}
            >
              DM
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15, letterSpacing: '-0.02em', color: 'var(--text-main)', lineHeight: 1.1 }}>
                DMAUT AI
              </div>
              <div style={{ fontSize: 10.5, color: 'var(--text-muted)' }}>
                {isPersonal ? 'Personal Creator' : 'Business Pro'}
              </div>
            </div>
          </div>
        )}

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          style={{ padding: 6 }}
        >
          {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, padding: isCollapsed ? '12px 8px' : '12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {!isCollapsed && (
          <div style={{ padding: '6px 8px', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-dim)' }}>
            WORKSPACE MODULES
          </div>
        )}

        {allNavItems.map(item => {
          const Icon = item.icon;
          const isLocked = isPersonal && !item.availableForPersonal;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              disabled={isLocked}
              onClick={() => !isLocked && setActiveTab(item.id)}
              title={isLocked ? `${item.label} (Business Pro Tier)` : item.label}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'space-between',
                padding: isCollapsed ? '10px 0' : '10px 12px',
                borderRadius: 'var(--radius-sm)',
                border: isActive ? '1px solid var(--border-strong)' : '1px solid transparent',
                backgroundColor: isActive ? 'var(--bg-active)' : 'transparent',
                color: isLocked ? 'var(--text-dim)' : (isActive ? 'var(--text-main)' : 'var(--text-muted)'),
                fontWeight: isActive ? 600 : 500,
                fontSize: 13,
                cursor: isLocked ? 'not-allowed' : 'pointer',
                transition: 'var(--transition)',
                opacity: isLocked ? 0.45 : 1
              }}
              onMouseEnter={e => {
                if (!isActive && !isLocked) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
              }}
              onMouseLeave={e => {
                if (!isActive && !isLocked) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                {!isCollapsed && <span>{item.label}</span>}
              </div>

              {!isCollapsed && (
                <>
                  {isLocked ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--text-dim)' }}>
                      <Lock size={11} /> Pro
                    </span>
                  ) : item.badge && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: isActive ? 'var(--text-main)' : 'var(--bg-subtle)',
                        color: isActive ? 'var(--bg-page)' : 'var(--text-muted)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Area: Settings & Account Menus */}
      <div
        style={{
          padding: isCollapsed ? '10px 8px' : '12px 14px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          background: 'var(--bg-surface)'
        }}
      >
        {/* Settings button */}
        <button
          type="button"
          onClick={onOpenSettings}
          title="Workspace Settings & Themes"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: 10,
            padding: isCollapsed ? '10px 0' : '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)',
            fontSize: 13,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Settings size={16} />
          {!isCollapsed && <span>Settings</span>}
        </button>

        {/* Account button */}
        <button
          type="button"
          onClick={onOpenAccount}
          title="Account Profile & Security"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            gap: 10,
            padding: isCollapsed ? '10px 0' : '8px 10px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            background: 'var(--bg-subtle)',
            color: 'var(--text-main)',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div
              style={{
                width: 22,
                height: 22,
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
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <span style={{ maxWidth: 130, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Account'}
              </span>
            )}
          </div>
          {!isCollapsed && <ChevronRight size={13} style={{ color: 'var(--text-dim)' }} />}
        </button>
      </div>
    </aside>
  );
}
