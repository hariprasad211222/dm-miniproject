import React, { useState, useEffect } from 'react';
import { apiCreateAutomation, apiUpdateAutomation } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Zap, Play, CheckCircle } from 'lucide-react';

export default function RuleEditorModal({ isOpen, onClose, rule, onSaved }) {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState('Customer Signs Up');
  const [triggerCondition, setTriggerCondition] = useState('Immediate on account creation');
  const [action, setAction] = useState('Send Welcome Email + 10% First Order Promo Code');
  const [channel, setChannel] = useState('Email');
  const [isActive, setIsActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (rule) {
      setName(rule.name || '');
      setTrigger(rule.trigger || 'Customer Signs Up');
      setTriggerCondition(rule.triggerCondition || '');
      setAction(rule.action || '');
      setChannel(rule.channel || 'Email');
      setIsActive(rule.isActive !== false);
    } else {
      setName('');
      setTrigger('Customer Signs Up');
      setTriggerCondition('Immediate on registration');
      setAction('Send Welcome Email sequence + 10% coupon');
      setChannel('Email');
      setIsActive(true);
    }
  }, [rule, isOpen]);

  if (!isOpen) return null;

  const triggerPresets = [
    {
      name: 'Welcome Series for New Signups',
      trigger: 'Customer Signs Up',
      condition: 'Immediate on registration',
      action: 'Send Welcome Email sequence + 10% coupon',
      channel: 'Email'
    },
    {
      name: 'Win-Back Inactive Customers (> 45 Days)',
      trigger: 'Customer Inactive > 45 Days',
      condition: 'Days Inactive >= 45 and Past Spend > $200',
      action: 'Dispatch Re-engagement Win-Back Email with $20 credit',
      channel: 'Email'
    },
    {
      name: 'VIP Loyalty Spend Milestone',
      trigger: 'Total Spend Crosses $5,000',
      condition: 'Lifetime Spend >= $5,000',
      action: 'Assign VIP Tag + Trigger Personal Account Director Email',
      channel: 'Email'
    },
    {
      name: 'Abandoned Cart Recovery SMS',
      trigger: 'Checkout Abandoned > 2 Hours',
      condition: 'Cart Value >= $50',
      action: 'Send Dynamic SMS Reminder with Recovery Link',
      channel: 'SMS'
    }
  ];

  const applyPreset = (preset) => {
    setName(preset.name);
    setTrigger(preset.trigger);
    setTriggerCondition(preset.condition);
    setAction(preset.action);
    setChannel(preset.channel);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Please provide an automation rule name', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name,
        trigger,
        triggerCondition,
        action,
        channel,
        isActive
      };

      if (rule && rule.id) {
        await apiUpdateAutomation(rule.id, payload);
        showToast('Automation rule updated', 'success');
      } else {
        await apiCreateAutomation(payload);
        showToast('Automation rule created', 'success');
      }

      onSaved();
      onClose();
    } catch (err) {
      showToast('Failed to save automation: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <Zap size={18} />
            </div>
            <div>
              <h3 className="modal-title">
                {rule ? 'Edit Automation Rule' : 'Create Automation Rule'}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Define trigger criteria, condition evaluation, and automated actions
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Quick Presets */}
            {!rule && (
              <div>
                <label className="form-label" style={{ marginBottom: 6, display: 'block' }}>
                  Quick Start Templates
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                  {triggerPresets.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(p)}
                      style={{
                        padding: '8px 10px',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-subtle)',
                        background: 'var(--bg-subtle)',
                        color: 'var(--text-main)',
                        fontSize: 12,
                        textAlign: 'left',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{p.trigger}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{p.channel}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Rule Name</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. New User Welcome Blast"
                value={name}
                onChange={e => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Trigger Event</label>
                <select className="select" value={trigger} onChange={e => setTrigger(e.target.value)}>
                  <option value="Customer Signs Up">Customer Signs Up</option>
                  <option value="Customer Inactive > 45 Days">Customer Inactive &gt; 45 Days</option>
                  <option value="Total Spend Crosses $5,000">Total Spend Crosses $5,000</option>
                  <option value="Checkout Abandoned > 2 Hours">Checkout Abandoned &gt; 2 Hours</option>
                  <option value="High Open Rate VIP Match">High Open Rate VIP Match</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Delivery Channel</label>
                <select className="select" value={channel} onChange={e => setChannel(e.target.value)}>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="Webhook / CRM">Webhook / CRM</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Condition Filter</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Days Inactive >= 45 and Past Spend > $200"
                value={triggerCondition}
                onChange={e => setTriggerCondition(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Automated Action to Dispatch</label>
              <textarea
                className="textarea"
                style={{ minHeight: 70 }}
                placeholder="e.g. Send 20% discount code + Prepare VIP follow-up task"
                value={action}
                onChange={e => setAction(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
              <input
                type="checkbox"
                id="rule-active"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--text-main)', cursor: 'pointer' }}
              />
              <label htmlFor="rule-active" style={{ fontSize: 13, fontWeight: 500, cursor: 'pointer', color: 'var(--text-main)' }}>
                Set rule active immediately upon save
              </label>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Saving...' : (rule ? 'Update Rule' : 'Save & Deploy Rule')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
