import React, { useState } from 'react';
import { apiGenerateContent, apiCreateCampaign } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  PlusCircle,
  Mail,
  FileText,
  BookmarkCheck,
  Send
} from 'lucide-react';

export default function ContentGenerator({ onNavigateToCampaigns }) {
  const { showToast } = useToast();

  const [type, setType] = useState('email');
  const [product, setProduct] = useState('Nexus AI Marketing Workspace');
  const [audience, setAudience] = useState('Ecommerce Brand Founders & Performance Marketers');
  const [tone, setTone] = useState('Persuasive');
  const [keyBenefits, setKeyBenefits] = useState('Automates multi-channel campaigns, 3x higher conversion rate, RFM customer segmentation in 1 click');
  const [customPrompt, setCustomPrompt] = useState('Highlight a 20% early adopter launch offer ending this weekend.');

  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modelMeta, setModelMeta] = useState(null);

  const contentTypes = [
    { id: 'email', label: 'Promotional Email', icon: Mail, desc: 'Full email with subject lines & CTA' },
    { id: 'ad_copy', label: 'Ad Copy (Meta / Google)', icon: FileText, desc: 'Headlines, descriptions & hashtags' },
    { id: 'headlines', label: 'High-Converting Headlines', icon: Sparkles, desc: '10 categorized hooks & headlines' },
    { id: 'subject_lines', label: 'Catchy Subject Lines', icon: BookmarkCheck, desc: '12 high-open-rate subject lines' }
  ];

  const tones = [
    'Professional',
    'Persuasive',
    'Urgent / FOMO',
    'Casual & Friendly',
    'Luxury & Premium',
    'Witty & Bold'
  ];

  const handleGenerate = async () => {
    if (!product.trim()) {
      showToast('Please provide a product or offer name', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await apiGenerateContent({
        type,
        product,
        audience,
        tone,
        keyBenefits,
        customPrompt
      });
      setGeneratedText(res.text);
      setModelMeta({
        provider: res.provider,
        model: res.model,
        isFallback: res.isFallback
      });
      showToast('Marketing content generated successfully!', 'success');
    } catch (err) {
      showToast('Generation failed: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedText) return;
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    showToast('Copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveAsCampaign = async () => {
    if (!generatedText) return;
    try {
      const title = `${product} - ${contentTypes.find(t => t.id === type)?.label || 'Blast'}`;
      // Extract subject line if email
      let subjectLine = `${product}: Special Announcement`;
      const subjectMatch = generatedText.match(/Subject Line.*?\n1\.\s*\*?([^\n\*\)]+)/i);
      if (subjectMatch && subjectMatch[1]) {
        subjectLine = subjectMatch[1].trim();
      }

      await apiCreateCampaign({
        title,
        channel: type === 'ad_copy' ? 'Google Ads' : 'Email',
        status: 'Draft',
        targetSegment: 'All Customers',
        subjectLine,
        content: generatedText,
        audienceSize: 2500,
        budget: 500
      });

      showToast('Saved as draft campaign!', 'success');
      if (onNavigateToCampaigns) {
        onNavigateToCampaigns();
      }
    } catch (err) {
      showToast('Failed to save campaign: ' + err.message, 'error');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
            AI Marketing Content Generator
          </h1>
          <span className="badge badge-active" style={{ fontSize: 11 }}>Feature 1</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          Generate magnetic emails, ad copies, headlines, and subject lines with customizable tones and one-click campaign creation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.25fr', gap: 24, alignItems: 'start' }}>
        {/* Left Column: Form Controls */}
        <div className="card" style={{ padding: 24 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-main)' }}>
            1. Select Content Format
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, marginBottom: 20 }}>
            {contentTypes.map(item => {
              const Icon = item.icon;
              const isSelected = type === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-sm)',
                    border: isSelected ? '2px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--bg-subtle)' : 'var(--bg-surface)',
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'var(--transition)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Icon size={15} />
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{item.label}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{item.desc}</p>
                </button>
              );
            })}
          </div>

          <div className="form-group">
            <label className="form-label">Product / Campaign Name</label>
            <input
              type="text"
              className="input"
              value={product}
              onChange={e => setProduct(e.target.value)}
              placeholder="e.g. Acme Pro Analytics, Summer Flash Sale"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target Audience</label>
            <input
              type="text"
              className="input"
              value={audience}
              onChange={e => setAudience(e.target.value)}
              placeholder="e.g. VIP Customers, Busy Marketers, Gen-Z Shoppers"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Brand Voice & Tone</label>
            <select
              className="select"
              value={tone}
              onChange={e => setTone(e.target.value)}
            >
              {tones.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Key Selling Points / Offer</label>
            <textarea
              className="textarea"
              style={{ minHeight: 70 }}
              value={keyBenefits}
              onChange={e => setKeyBenefits(e.target.value)}
              placeholder="e.g. 25% discount, Free shipping, 48-hour delivery, 2x faster setup"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Specific Guidelines (Optional)</label>
            <input
              type="text"
              className="input"
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="e.g. Include countdown deadline, mention code VIP2026"
            />
          </div>

          <button
            type="button"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? (
              <>
                <RefreshCw size={15} className="spin" /> Generating Marketing Copy...
              </>
            ) : (
              <>
                <Sparkles size={15} /> Generate High-Converting Copy
              </>
            )}
          </button>
        </div>

        {/* Right Column: Generated Preview & Actions */}
        <div className="card" style={{ padding: 24, display: 'flex', flexDirection: 'column', minHeight: 560 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                Generated Output
              </span>
              {modelMeta && (
                <span className="badge" style={{ fontSize: 10.5 }}>
                  {modelMeta.model}
                </span>
              )}
            </div>

            {generatedText && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleGenerate}
                  disabled={loading}
                  title="Regenerate with same settings"
                >
                  <RefreshCw size={13} /> Regenerate
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleCopy}
                  title="Copy copy to clipboard"
                >
                  {copied ? <Check size={13} /> : <Copy size={13} />} {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleSaveAsCampaign}
                  title="Create campaign in Campaign Manager"
                >
                  <PlusCircle size={13} /> Save as Campaign
                </button>
              </div>
            )}
          </div>

          {generatedText ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div
                className="prose-code"
                style={{
                  flex: 1,
                  maxHeight: 520,
                  overflowY: 'auto'
                }}
              >
                {generatedText}
              </div>

              {/* Stats Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 12,
                paddingTop: 12,
                borderTop: '1px solid var(--border-subtle)',
                fontSize: 11.5,
                color: 'var(--text-muted)'
              }}>
                <div>
                  Words: <strong>{generatedText.split(/\s+/).filter(Boolean).length}</strong> | Characters: <strong>{generatedText.length}</strong>
                </div>
                <div>
                  Tone applied: <strong>{tone}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-dim)',
                textAlign: 'center',
                padding: 40,
                border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <div
                style={{
                  padding: 16,
                  borderRadius: '50%',
                  background: 'var(--bg-subtle)',
                  marginBottom: 12
                }}
              >
                <Sparkles size={28} />
              </div>
              <h4 style={{ color: 'var(--text-main)', fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
                Ready to create high-performing marketing copy
              </h4>
              <p style={{ fontSize: 13, maxWidth: 360, color: 'var(--text-muted)' }}>
                Configure your product details and chosen tone on the left, then click Generate to produce optimized copy in seconds.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
