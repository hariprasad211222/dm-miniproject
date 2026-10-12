import React, { useState } from 'react';
import { apiUpdateSettings } from '../../services/api.js';
import {
  Sparkles,
  Layers,
  Users,
  Zap,
  GitCompare,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  X
} from 'lucide-react';

export default function OnboardingTour({ isOpen, onClose, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  const tourSteps = [
    {
      title: 'Welcome to DMAUT AI Platform',
      tagline: 'Your end-to-end AI marketing and campaign automation workspace.',
      icon: Sparkles,
      content: (
        <div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 16 }}>
            DMAUT AI is designed to help performance marketers and solo creators build, optimize, and deploy high-converting marketing campaigns with precision.
          </p>
          <div style={{ padding: 14, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: 13 }}>
            <strong>How it works:</strong> You generate magnetic marketing copy using AI, cluster your audience with smart RFM segmentation, create automated response rules, and optimize your creative with A/B testing.
          </div>
        </div>
      )
    },
    {
      title: '1. AI Marketing Content Generator',
      tagline: 'Produce promotional emails, ad copies, headlines & subject lines.',
      icon: Sparkles,
      content: (
        <div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
            Select your content format (Email, Social Ad, Headlines, Subject Lines), enter your product name, target audience, and choose from 6 calibrated brand tones (Professional, Persuasive, Urgent, Luxury, etc.).
          </p>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: 'var(--text-main)' }}>
            <li>• <strong>Regenerate:</strong> Produce fresh variations with 1 click.</li>
            <li>• <strong>Save as Campaign:</strong> Automatically pipes the generated copy straight into Campaign Manager!</li>
          </ul>
        </div>
      )
    },
    {
      title: '2. Smart Customer Segmentation (RFM)',
      tagline: 'Cluster audience records into Loyal VIPs, Active, New, and At-Risk.',
      icon: Users,
      content: (
        <div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
            Upload customer CSV spreadsheets to let the RFM algorithm automatically categorize your buyers based on Recency, Frequency, and Monetary scores.
          </p>
          <div style={{ padding: 12, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', fontSize: 12.5, color: 'var(--text-muted)' }}>
            💡 <em>Pro Tip:</em> Click <strong>"Campaign for Segment"</strong> to instantly create an email blast pre-targeted to your selected segment!
          </div>
        </div>
      )
    },
    {
      title: '3. Simple Marketing Automation',
      tagline: 'Event-driven triggers that run while you sleep.',
      icon: Zap,
      content: (
        <div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
            Construct simple logic rules: <em>WHEN a customer signs up $\rightarrow$ Send Welcome series</em>, or <em>WHEN inactive for 45 days $\rightarrow$ Send 20% win-back code</em>.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            Use the <strong>"Run Simulation Test"</strong> button to test your rules on your customer database and view live events in the Execution Audit Log.
          </p>
        </div>
      )
    },
    {
      title: '4. Campaign Optimizer & Analytics',
      tagline: 'A/B testing analysis and strategic improvement recommendations.',
      icon: GitCompare,
      content: (
        <div>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
            Compare two creative variants side-by-side. The AI assistant detects behavioral friction points, computes statistical lift, and recommends the winner with an actionable checklist.
          </p>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.5 }}>
            On the Analytics Dashboard, monitor overall ROI and click <strong>"Generate AI Suggestions"</strong> to receive tactical experiments tailored to your numbers.
          </p>
        </div>
      )
    }
  ];

  const handleFinish = async () => {
    if (dontShowAgain) {
      try {
        await apiUpdateSettings({ showTourOnStartup: false });
      } catch {}
    }
    if (onComplete) onComplete();
    onClose();
  };

  const step = tourSteps[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <StepIcon size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ fontSize: 16 }}>{step.title}</h3>
              <p style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{step.tagline}</p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        {/* Body */}
        <div className="modal-body" style={{ minHeight: 180 }}>
          {step.content}

          {/* Stepper Dots */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 24 }}>
            {tourSteps.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: idx === currentStep ? 20 : 7,
                  height: 7,
                  borderRadius: 'var(--radius-full)',
                  background: idx === currentStep ? 'var(--text-main)' : 'var(--border-strong)',
                  transition: 'all 0.25s ease'
                }}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="dontShowAgainCheck"
              checked={dontShowAgain}
              onChange={e => setDontShowAgain(e.target.checked)}
              style={{ width: 14, height: 14, accentColor: 'var(--text-main)', cursor: 'pointer' }}
            />
            <label htmlFor="dontShowAgainCheck" style={{ fontSize: 12, color: 'var(--text-muted)', cursor: 'pointer' }}>
              Don't show on startup
            </label>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {currentStep > 0 && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                <ArrowLeft size={13} /> Back
              </button>
            )}

            {currentStep < tourSteps.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => setCurrentStep(prev => prev + 1)}
              >
                Next Step <ArrowRight size={13} />
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleFinish}
              >
                Get Started <CheckCircle size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
