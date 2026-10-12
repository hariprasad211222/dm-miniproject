import React, { useState, useEffect } from 'react';
import { getAIConfig, saveAIConfig, apiVerifyKey } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Key, Sparkles, CheckCircle, AlertCircle, Cpu } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose }) {
  const { showToast } = useToast();
  const [config, setConfig] = useState(getAIConfig());
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getAIConfig());
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAIConfig(config);
    showToast('AI Provider settings saved successfully', 'success');
    onClose();
  };

  const handleTestKey = async () => {
    const key = config.provider === 'gemini' ? config.geminiKey : (config.provider === 'openai' ? config.openaiKey : config.groqKey);
    const model = config.provider === 'gemini' ? config.geminiModel : (config.provider === 'openai' ? config.openaiModel : config.groqModel);

    if (!key) {
      setTestResult({
        valid: false,
        message: 'Please paste your API key first before testing.'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiVerifyKey(config.provider, key, model);
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
      setTesting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: 540 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <Key size={18} />
            </div>
            <div>
              <h3 className="modal-title">AI Provider & Model Credentials</h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Configure Google Gemini Studio or other LLM providers</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Provider Selector */}
          <div className="form-group">
            <label className="form-label">Active AI Provider</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { id: 'gemini', label: 'Google Gemini', desc: 'Gemini 2.0 / 1.5' },
                { id: 'openai', label: 'OpenAI', desc: 'GPT-4o Mini / 4o' },
                { id: 'groq', label: 'Groq Cloud', desc: 'Llama 3.3 Fast' }
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setConfig({ ...config, provider: p.id })}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: config.provider === p.id ? '2px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                    background: config.provider === p.id ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Provider Specific Inputs */}
          {config.provider === 'gemini' && (
            <>
              <div className="form-group">
                <label className="form-label">Google Gemini Studio API Key</label>
                <input
                  type="password"
                  className="input"
                  placeholder="AIzaSy..."
                  value={config.geminiKey}
                  onChange={e => setConfig({ ...config, geminiKey: e.target.value })}
                />
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  Get your free Gemini key at <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--text-main)', textDecoration: 'underline' }}>Google AI Studio</a>.
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Gemini Model</label>
                <select
                  className="select"
                  value={config.geminiModel}
                  onChange={e => setConfig({ ...config, geminiModel: e.target.value })}
                >
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest & Recommended)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Reasoning)</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Lightweight)</option>
                </select>
              </div>
            </>
          )}

          {config.provider === 'openai' && (
            <>
              <div className="form-group">
                <label className="form-label">OpenAI API Key</label>
                <input
                  type="password"
                  className="input"
                  placeholder="sk-proj-..."
                  value={config.openaiKey}
                  onChange={e => setConfig({ ...config, openaiKey: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">OpenAI Model</label>
                <select
                  className="select"
                  value={config.openaiModel}
                  onChange={e => setConfig({ ...config, openaiModel: e.target.value })}
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (Optimal Speed/Cost)</option>
                  <option value="gpt-4o">GPT-4o (Flagship Model)</option>
                </select>
              </div>
            </>
          )}

          {config.provider === 'groq' && (
            <>
              <div className="form-group">
                <label className="form-label">Groq Cloud API Key</label>
                <input
                  type="password"
                  className="input"
                  placeholder="gsk_..."
                  value={config.groqKey}
                  onChange={e => setConfig({ ...config, groqKey: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Groq Model</label>
                <select
                  className="select"
                  value={config.groqModel}
                  onChange={e => setConfig({ ...config, groqModel: e.target.value })}
                >
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile</option>
                  <option value="mixtral-8x7b-32768">Mixtral 8x7B 32k</option>
                </select>
              </div>
            </>
          )}

          {/* Test connection result banner */}
          {testResult && (
            <div style={{
              marginTop: 12,
              padding: '10px 14px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 12.5,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: testResult.valid ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: testResult.valid ? '#10b981' : '#ef4444',
              border: `1px solid ${testResult.valid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
            }}>
              {testResult.valid ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{testResult.message}</span>
            </div>
          )}

          {/* Offline/Fallback info box */}
          <div style={{
            marginTop: 16,
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)',
            fontSize: 12,
            color: 'var(--text-muted)'
          }}>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Cpu size={14} /> Zero-Downtime Smart Fallback
            </div>
            If no API key is entered, the platform seamlessly uses our deterministic AI marketing synthesis engine. You can freely test every feature right away.
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleTestKey}
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSave}>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}
