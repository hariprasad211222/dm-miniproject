import React, { useState, useEffect } from 'react';
import {
  apiGetAutomations,
  apiUpdateAutomation,
  apiDeleteAutomation,
  apiSimulateAutomations,
  apiLoadStarterAutomations
} from '../../services/api.js';
import RuleEditorModal from './RuleEditorModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Zap,
  Plus,
  Play,
  CheckCircle,
  Clock,
  Trash2,
  Edit,
  ArrowRight,
  Activity,
  History,
  ShieldAlert
} from 'lucide-react';

export default function MarketingAutomations() {
  const { showToast } = useToast();

  const [automations, setAutomations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const data = await apiGetAutomations();
      setAutomations(data.automations || []);
      setLogs(data.logs || []);
    } catch (err) {
      showToast('Error loading automations: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleToggleActive = async (rule) => {
    try {
      const updatedStatus = !rule.isActive;
      await apiUpdateAutomation(rule.id, { isActive: updatedStatus });
      showToast(`Rule "${rule.name}" is now ${updatedStatus ? 'Active' : 'Paused'}`, 'success');
      fetchAutomations();
    } catch (err) {
      showToast('Failed to toggle rule: ' + err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this automation rule?')) return;
    try {
      await apiDeleteAutomation(id);
      showToast('Rule deleted', 'success');
      fetchAutomations();
    } catch (err) {
      showToast('Failed to delete rule: ' + err.message, 'error');
    }
  };

  const handleSimulate = async (ruleId = null) => {
    setSimulating(true);
    try {
      const res = await apiSimulateAutomations(ruleId);
      showToast(res.message, 'success');
      if (res.updatedAutomations) setAutomations(res.updatedAutomations);
      if (res.newLogs) setLogs(prev => [...res.newLogs, ...prev]);
    } catch (err) {
      showToast('Simulation failed: ' + err.message, 'error');
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Simple Marketing Automation
            </h1>
            <span className="badge badge-active" style={{ fontSize: 11 }}>Feature 4</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Event-driven workflows that trigger instant responses: welcome sequences, win-backs, cart alerts, and VIP tagging.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => handleSimulate()}
            disabled={simulating}
            title="Execute simulation across all active customers"
          >
            <Play size={14} /> {simulating ? 'Simulating Engine...' : 'Run Simulation Test'}
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => { setSelectedRule(null); setIsEditorOpen(true); }}
          >
            <Plus size={14} /> New Automation Rule
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Automation Rules List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {loading ? (
            <div className="card" style={{ padding: 36, textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading automation rules...
            </div>
          ) : automations.length === 0 ? (
            <div className="card" style={{ padding: 36, textAlign: 'center' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: 14 }}>
                No automation rules created yet in your workspace. Build a custom trigger or load standard presets.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={async () => {
                    try {
                      await apiLoadStarterAutomations();
                      showToast('Starter automation rules loaded', 'success');
                      fetchAutomations();
                    } catch (err) {
                      showToast('Error loading starter: ' + err.message, 'error');
                    }
                  }}
                >
                  Load Starter Workflows
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => { setSelectedRule(null); setIsEditorOpen(true); }}
                >
                  <Plus size={14} /> New Automation Rule
                </button>
              </div>
            </div>
          ) : (
            automations.map(rule => (
              <div
                key={rule.id}
                className="card"
                style={{
                  padding: 20,
                  opacity: rule.isActive ? 1 : 0.65,
                  transition: 'var(--transition)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        padding: 7,
                        borderRadius: 'var(--radius-sm)',
                        background: rule.isActive ? 'var(--bg-active)' : 'var(--bg-subtle)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)'
                      }}
                    >
                      <Zap size={16} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                        {rule.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span className="badge" style={{ fontSize: 10.5 }}>{rule.channel}</span>
                        {rule.stats?.triggeredCount > 0 && (
                          <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>
                            Fired {rule.stats.triggeredCount} times
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {/* Active toggle button */}
                    <button
                      type="button"
                      className={`btn btn-sm ${rule.isActive ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ fontSize: 11.5, padding: '4px 10px' }}
                      onClick={() => handleToggleActive(rule)}
                    >
                      {rule.isActive ? 'Active' : 'Paused'}
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      title="Edit rule"
                      onClick={() => { setSelectedRule(rule); setIsEditorOpen(true); }}
                    >
                      <Edit size={14} />
                    </button>

                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      title="Delete rule"
                      onClick={() => handleDelete(rule.id)}
                      style={{ color: '#ef4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Workflow Logic Flow: Trigger -> Condition -> Action */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto 1fr auto 1.3fr',
                    gap: 8,
                    alignItems: 'center',
                    background: 'var(--bg-subtle)',
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 12.5
                  }}
                >
                  {/* Trigger */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      WHEN
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: 2 }}>
                      {rule.trigger}
                    </div>
                  </div>

                  <ArrowRight size={14} style={{ color: 'var(--text-dim)' }} />

                  {/* Condition */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      IF
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>
                      {rule.triggerCondition || 'Standard match'}
                    </div>
                  </div>

                  <ArrowRight size={14} style={{ color: 'var(--text-dim)' }} />

                  {/* Action */}
                  <div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                      THEN DO
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', marginTop: 2 }}>
                      {rule.action}
                    </div>
                  </div>
                </div>

                {/* Single Rule Test Button */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 10 }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11.5 }}
                    onClick={() => handleSimulate(rule.id)}
                    disabled={simulating}
                  >
                    <Play size={12} /> Test Rule Execution
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Live Execution Audit Trail */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <History size={16} />
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
                Live Execution Audit Log
              </h3>
            </div>
            <span className="badge" style={{ fontSize: 10.5 }}>Real-time</span>
          </div>

          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
            Every automated trigger match and delivery attempt is logged below with customer details and status.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 520, overflowY: 'auto' }}>
            {logs.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-dim)', fontSize: 13 }}>
                No events logged yet. Click "Run Simulation Test" to execute active rules.
              </div>
            ) : (
              logs.map(log => (
                <div
                  key={log.id}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-subtle)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 12
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {log.ruleName}
                    </span>
                    <span className="badge" style={{ fontSize: 10, color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      {log.status || 'Delivered'}
                    </span>
                  </div>

                  <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
                    Target: <strong>{log.customer}</strong> {log.email && `(${log.email})`}
                  </div>

                  <div style={{ fontSize: 11.5, color: 'var(--text-main)' }}>
                    Action: {log.action}
                  </div>

                  <div style={{ fontSize: 10.5, color: 'var(--text-dim)', marginTop: 4, fontFamily: 'var(--font-mono)' }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : 'Just now'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <RuleEditorModal
        isOpen={isEditorOpen}
        onClose={() => { setIsEditorOpen(false); setSelectedRule(null); }}
        rule={selectedRule}
        onSaved={fetchAutomations}
      />
    </div>
  );
}
