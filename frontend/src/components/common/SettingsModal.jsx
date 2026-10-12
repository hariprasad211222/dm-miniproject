import React, { useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { getAIConfig, saveAIConfig, apiVerifyKey, apiUpdateSettings } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Settings,
  Moon,
  Sun,
  Laptop,
  Key,
  HelpCircle,
  Download,
  CheckCircle,
  AlertCircle,
  Cpu,
  Sliders
} from 'lucide-react';

export default function SettingsModal({ isOpen, onClose, onLaunchTour }) {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();

  const [aiConfig, setAiConfigState] = useState(getAIConfig());
  const [testingKey, setTestingKey] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [defaultTone, setDefaultTone] = useState('Persuasive');
  const [showTourOnStartup, setShowTourOnStartup] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setAiConfigState(getAIConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveSettings = async () => {
    saveAIConfig(aiConfig);
    try {
      await apiUpdateSettings({ showTourOnStartup, defaultTone });
    } catch {}
    showToast('Settings saved successfully!', 'success');
    onClose();
  };

  const handleTestKey = async () => {
    const key = aiConfig.provider === 'gemini' ? aiConfig.geminiKey : (aiConfig.provider === 'openai' ? aiConfig.openaiKey : aiConfig.groqKey);
    const model = aiConfig.provider === 'gemini' ? aiConfig.geminiModel : (aiConfig.provider === 'openai' ? aiConfig.openaiModel : aiConfig.groqModel);

    if (!key) {
      setTestResult({ valid: false, message: 'Please enter an API key first before testing.' });
      return;
    }

    setTestingKey(true);
    setTestResult(null);
    try {
      const res = await apiVerifyKey(aiConfig.provider, key, model);
      setTestResult(res);
      if (res.valid) {
        showToast('Connection verified successfully!', 'success');
      } else {
        showToast(res.message || 'Verification failed', 'error');
      }
    } catch (err) {
      setTestResult({ valid: false, message: err.message });
      showToast('Connection error: ' + err.message, 'error');
    } finally {
      setTestingKey(false);
    }
  };

  const handleExportWorkspace = () => {
    const rawAuth = localStorage.getItem('dmaut_auth');
    const backup = {
      timestamp: new Date().toISOString(),
      user: rawAuth ? JSON.parse(rawAuth).user : null,
      aiProvider: aiConfig.provider
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dmaut_workspace_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Workspace backup downloaded', 'success');
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <Settings size={18} />
            </div>
            <div>
              <h3 className="modal-title">Workspace Settings</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Appearance themes, AI models, and preferences</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* 1. Theme Configuration */}
          <div>
            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
              Appearance Theme
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { id: 'light', label: 'Light (White)', icon: Sun, desc: 'High contrast clean slate' },
                { id: 'dark', label: 'Dark Mode', icon: Moon, desc: 'Obsidian dark palette' },
                { id: 'system', label: 'Auto / System', icon: Laptop, desc: 'Syncs with device OS' }
              ].map(t => {
                const Icon = t.icon;
                const isSelected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTheme(t.id)}
                    style={{
                      padding: '12px',
                      borderRadius: 'var(--radius-sm)',
                      border: isSelected ? '2px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                      background: isSelected ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                      color: 'var(--text-main)',
                      textAlign: 'left',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, marginBottom: 2 }}>
                      <Icon size={14} /> {t.label}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{t.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. AI Model Credentials */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <label className="form-label" style={{ margin: 0 }}>
                AI Model & Provider Configuration
              </label>
              <span className="badge" style={{ fontSize: 10.5 }}>Multi-Provider</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 12 }}>
              {[
                { id: 'gemini', label: 'Google Gemini', sub: 'Gemini 2.0 / 1.5' },
                { id: 'openai', label: 'OpenAI', sub: 'GPT-4o Mini / 4o' },
                { id: 'groq', label: 'Groq Cloud', sub: 'Llama 3.3 Fast' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setAiConfigState({ ...aiConfig, provider: p.id })}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: aiConfig.provider === p.id ? '2px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                    background: aiConfig.provider === p.id ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    fontSize: 12
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{p.label}</div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-dim)' }}>{p.sub}</div>
                </button>
              ))}
            </div>

            {aiConfig.provider === 'gemini' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Google Gemini API Key</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="AIzaSy..."
                    value={aiConfig.geminiKey}
                    onChange={e => setAiConfigState({ ...aiConfig, geminiKey: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Model Selection</label>
                  <select
                    className="select"
                    value={aiConfig.geminiModel}
                    onChange={e => setAiConfigState({ ...aiConfig, geminiModel: e.target.value })}
                  >
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Recommended)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Lightweight)</option>
                  </select>
                </div>
              </div>
            )}

            {aiConfig.provider === 'openai' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">OpenAI API Key</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="sk-proj-..."
                    value={aiConfig.openaiKey}
                    onChange={e => setAiConfigState({ ...aiConfig, openaiKey: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Model Selection</label>
                  <select
                    className="select"
                    value={aiConfig.openaiModel}
                    onChange={e => setAiConfigState({ ...aiConfig, openaiModel: e.target.value })}
                  >
                    <option value="gpt-4o-mini">GPT-4o Mini</option>
                    <option value="gpt-4o">GPT-4o</option>
                  </select>
                </div>
              </div>
            )}

            {aiConfig.provider === 'groq' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Groq Cloud API Key</label>
                  <input
                    type="password"
                    className="input"
                    placeholder="gsk_..."
                    value={aiConfig.groqKey}
                    onChange={e => setAiConfigState({ ...aiConfig, groqKey: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Model Selection</label>
                  <select
                    className="select"
                    value={aiConfig.groqModel}
                    onChange={e => setAiConfigState({ ...aiConfig, groqModel: e.target.value })}
                  >
                    <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                    <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                  </select>
                </div>
              </div>
            )}

            {testResult && (
              <div style={{
                marginTop: 8,
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: testResult.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: testResult.valid ? '#10b981' : '#ef4444',
                border: `1px solid ${testResult.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
              }}>
                {testResult.valid ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                <span>{testResult.message}</span>
              </div>
            )}

            <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleTestKey}
                disabled={testingKey}
              >
                {testingKey ? 'Verifying...' : 'Test Connection'}
              </button>
            </div>
          </div>

          {/* 3. Onboarding & Tour */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
              Onboarding & Walkthrough Guide
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>Platform Startup Tutorial</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Explains all 6 marketing automation features step-by-step</div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => { onClose(); onLaunchTour(); }}
              >
                <HelpCircle size={13} /> Launch Tour
              </button>
            </div>
          </div>

          {/* 4. Data Backup */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
              Workspace Data
            </label>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>Export Workspace Snapshot</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>Download your configuration & metadata in JSON format</div>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleExportWorkspace}
              >
                <Download size={13} /> Export JSON
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSaveSettings}>
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
}
