import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  apiUpdateProfile,
  apiChangePassword,
  apiSwitchAccountType,
  apiDeleteAccount
} from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  User,
  Mail,
  KeyRound,
  Briefcase,
  Trash2,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';

export default function AccountModal({ isOpen, onClose }) {
  const { user, updateUser, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'security', 'tier', 'danger'
  
  // Profile state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete state
  const [confirmDeleteText, setConfirmDeleteText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setName(user.name || '');
      setEmail(user.email || '');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setConfirmDeleteText('');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await apiUpdateProfile({ name, email });
      updateUser(res.user);
      showToast('Profile updated successfully!', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    setSavingPassword(true);
    try {
      await apiChangePassword({ currentPassword, newPassword });
      showToast('Password changed successfully!', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSwitchTier = async (newType) => {
    try {
      const res = await apiSwitchAccountType(newType);
      updateUser(res.user);
      showToast(res.message, 'success');
    } catch (err) {
      showToast('Failed to switch tier: ' + err.message, 'error');
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmDeleteText !== 'DELETE') {
      showToast('Please type "DELETE" to confirm account deletion', 'error');
      return;
    }

    setDeleting(true);
    try {
      await apiDeleteAccount();
      showToast('Your account has been deleted.', 'info');
      logout();
      onClose();
    } catch (err) {
      showToast('Account deletion failed: ' + err.message, 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: 620 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--btn-primary-bg)',
                color: 'var(--btn-primary-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 14
              }}
            >
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="modal-title">{user.name || 'Account Settings'}</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {user.email} • {user.accountType === 'personal' ? 'Personal Creator' : 'Business Pro'}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
          {[
            { id: 'profile', label: 'Profile & Email', icon: User },
            { id: 'security', label: 'Security & Password', icon: KeyRound },
            { id: 'tier', label: 'Plan & Tier', icon: Briefcase },
            { id: 'danger', label: 'Delete Account', icon: Trash2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  border: 'none',
                  background: isActive ? 'var(--bg-surface)' : 'transparent',
                  color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  borderBottom: isActive ? '2px solid var(--border-focus)' : 'none'
                }}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="modal-body">
          {/* TAB 1: Profile & Email */}
          {activeTab === 'profile' && (
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Full Name / Display Username</label>
                <input
                  type="text"
                  className="input"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Used to sign in and access your isolated session workspace.
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingProfile}>
                  {savingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: Security & Password */}
          {activeTab === 'security' && (
            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="input"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="submit" className="btn btn-primary btn-sm" disabled={savingPassword}>
                  {savingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Plan & Tier (Personal vs Business) */}
          {activeTab === 'tier' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Switch between Personal and Business modes at any time. Business unlocks enterprise CSV segmentation, automation workflows, and A/B test optimization.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-sm)',
                    border: user.accountType === 'personal' ? '2px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                    background: user.accountType === 'personal' ? 'var(--bg-subtle)' : 'var(--bg-surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>Personal Account</div>
                    {user.accountType === 'personal' && <span className="badge badge-active" style={{ fontSize: 10 }}>Active</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Focused creator workspace: AI Copywriting, simple campaign blasts, and personal engagement.
                  </p>
                  {user.accountType !== 'personal' && (
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => handleSwitchTier('personal')}
                    >
                      Switch to Personal
                    </button>
                  )}
                </div>

                <div
                  style={{
                    padding: 16,
                    borderRadius: 'var(--radius-sm)',
                    border: user.accountType === 'business' ? '2px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                    background: user.accountType === 'business' ? 'var(--bg-subtle)' : 'var(--bg-surface)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-main)' }}>Business Account</div>
                    {user.accountType === 'business' && <span className="badge badge-active" style={{ fontSize: 10 }}>Active</span>}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                    Full suite: CSV RFM Segmentation, Automations Engine, Campaign Optimizer, and Revenue Analytics.
                  </p>
                  {user.accountType !== 'business' && (
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      style={{ width: '100%' }}
                      onClick={() => handleSwitchTier('business')}
                    >
                      Switch to Business Pro
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Delete Account */}
          {activeTab === 'danger' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                color: '#ef4444'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>
                  <AlertTriangle size={16} /> Permanent Account Deletion
                </div>
                <div style={{ fontSize: 12, lineHeight: 1.5 }}>
                  This action cannot be undone. All your campaigns, imported customer records, automation rules, and analytics history will be wiped permanently from the server.
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Type "DELETE" below to confirm</label>
                <input
                  type="text"
                  className="input"
                  placeholder="DELETE"
                  value={confirmDeleteText}
                  onChange={e => setConfirmDeleteText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  disabled={confirmDeleteText !== 'DELETE' || deleting}
                  onClick={handleDeleteAccount}
                >
                  <Trash2 size={13} /> {deleting ? 'Deleting Account...' : 'Permanently Delete Account'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => { logout(); onClose(); }}
            style={{ color: 'var(--text-muted)' }}
          >
            <LogOut size={13} /> Sign Out
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
