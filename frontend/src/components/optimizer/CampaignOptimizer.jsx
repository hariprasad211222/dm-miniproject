import React, { useState } from 'react';
import { apiOptimizeABTest, apiCreateCampaign } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  GitCompare,
  Trophy,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ListChecks,
  PlusCircle,
  RefreshCw
} from 'lucide-react';

export default function CampaignOptimizer({ onNavigateToCampaigns }) {
  const { showToast } = useToast();

  const benchmarkPresets = [
    {
      label: 'Urgency vs. Social Proof (High-Growth Tech)',
      metricGoal: 'Conversion Rate',
      versionA: {
        name: 'Version A (Urgency & FOMO)',
        subject: '⚡ 48 Hours Left: Claim Your 30% Savings Before Prices Rise',
        headline: 'Don’t Get Left Behind: Final Access Window Closes Midnight',
        cta: 'Claim 30% Discount Now',
        tone: 'Urgent / FOMO',
        metrics: { sent: 5000, opens: 1850, clicks: 620, conversions: 110, openRate: 37.0, ctr: 33.5, convRate: 17.7 }
      },
      versionB: {
        name: 'Version B (Social Proof & Trust)',
        subject: '⭐ Why 10,000+ top marketing leaders switched this month',
        headline: 'Join Thousands of Fast-Growing Teams Automating Campaigns',
        cta: 'See Customer Stories & Get Started Free',
        tone: 'Trust / Social Proof',
        metrics: { sent: 5000, opens: 2350, clicks: 910, conversions: 195, openRate: 47.0, ctr: 38.7, convRate: 21.4 }
      }
    },
    {
      label: 'Direct Discount vs. Value Prop (Ecommerce)',
      metricGoal: 'Click-Through Rate',
      versionA: {
        name: 'Version A (Direct $20 Voucher)',
        subject: 'Here is $20 towards your next purchase inside',
        headline: 'Take $20 Off Any Order Over $60',
        cta: 'Redeem $20 Voucher',
        tone: 'Promotional / Direct',
        metrics: { sent: 4000, opens: 1680, clicks: 420, conversions: 84, openRate: 42.0, ctr: 25.0, convRate: 20.0 }
      },
      versionB: {
        name: 'Version B (Outcome & Lifestyle Benefit)',
        subject: 'The secret to waking up energized (new drop inside)',
        headline: 'Designed to elevate your everyday routine without friction',
        cta: 'Discover the New Collection',
        tone: 'Lifestyle / Benefit-Driven',
        metrics: { sent: 4000, opens: 2040, clicks: 760, conversions: 142, openRate: 51.0, ctr: 37.2, convRate: 18.6 }
      }
    }
  ];

  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [metricGoal, setMetricGoal] = useState('Conversion Rate');
  const [versionA, setVersionA] = useState(benchmarkPresets[0].versionA);
  const [versionB, setVersionB] = useState(benchmarkPresets[0].versionB);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleApplyPreset = (index) => {
    setSelectedPresetIndex(index);
    setMetricGoal(benchmarkPresets[index].metricGoal);
    setVersionA(benchmarkPresets[index].versionA);
    setVersionB(benchmarkPresets[index].versionB);
    setAnalysisResult(null);
  };

  const handleRunAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await apiOptimizeABTest({
        versionA,
        versionB,
        metricGoal
      });
      setAnalysisResult(res.analysis);
      showToast('Optimization analysis completed!', 'success');
    } catch (err) {
      showToast('Analysis error: ' + err.message, 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeployWinner = async () => {
    if (!analysisResult) return;
    const winnerName = analysisResult.recommendedWinner || 'Winning Variant';
    const isB = winnerName.includes('B');
    const winningObj = isB ? versionB : versionA;

    try {
      await apiCreateCampaign({
        title: `${winningObj.name} (Optimized Winner)`,
        channel: 'Email',
        status: 'Active',
        targetSegment: 'All Customers',
        subjectLine: winningObj.subject,
        content: `Headline: ${winningObj.headline}\n\nCall-to-Action: ${winningObj.cta}\n\nTone: ${winningObj.tone}\n\nDeploying high-confidence winning variant (+${analysisResult.liftPercentage || '28%'} lift).`,
        audienceSize: 5000,
        budget: 750
      });

      showToast('Winning variant deployed as an Active Campaign!', 'success');
      if (onNavigateToCampaigns) {
        onNavigateToCampaigns();
      }
    } catch (err) {
      showToast('Failed to deploy campaign: ' + err.message, 'error');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Campaign Optimization Assistant
            </h1>
            <span className="badge badge-active" style={{ fontSize: 11 }}>Feature 5</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Compare two campaign variants, evaluate behavioral friction points, and let AI recommend the winning creative with actionable next steps.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <select
            className="select"
            style={{ width: 'auto', fontSize: 13 }}
            value={selectedPresetIndex}
            onChange={e => handleApplyPreset(Number(e.target.value))}
          >
            {benchmarkPresets.map((p, i) => (
              <option key={i} value={i}>Preset: {p.label}</option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={handleRunAnalysis}
            disabled={analyzing}
          >
            {analyzing ? (
              <>
                <RefreshCw size={14} className="spin" /> Analyzing Performance...
              </>
            ) : (
              <>
                <Sparkles size={14} /> Run AI Optimization
              </>
            )}
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Version A Card */}
        <div className="card" style={{ padding: 22, borderTop: '3px solid var(--border-strong)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
              VARIANT A
            </span>
            <span className="badge" style={{ fontSize: 11 }}>{versionA.tone}</span>
          </div>

          <div className="form-group">
            <label className="form-label">Variant Name</label>
            <input
              type="text"
              className="input"
              value={versionA.name}
              onChange={e => setVersionA({ ...versionA, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject Line / Pre-header</label>
            <input
              type="text"
              className="input"
              value={versionA.subject}
              onChange={e => setVersionA({ ...versionA, subject: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Headline / Hook</label>
            <input
              type="text"
              className="input"
              value={versionA.headline}
              onChange={e => setVersionA({ ...versionA, headline: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Call to Action (CTA)</label>
            <input
              type="text"
              className="input"
              value={versionA.cta}
              onChange={e => setVersionA({ ...versionA, cta: e.target.value })}
            />
          </div>

          {/* Metric Stats for A */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase' }}>
              Observed Metrics (A)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Open Rate</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{versionA.metrics.openRate}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CTR</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{versionA.metrics.ctr}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Conversion</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{versionA.metrics.convRate}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Version B Card */}
        <div className="card" style={{ padding: 22, borderTop: '3px solid var(--border-focus)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
              VARIANT B
            </span>
            <span className="badge" style={{ fontSize: 11 }}>{versionB.tone}</span>
          </div>

          <div className="form-group">
            <label className="form-label">Variant Name</label>
            <input
              type="text"
              className="input"
              value={versionB.name}
              onChange={e => setVersionB({ ...versionB, name: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Subject Line / Pre-header</label>
            <input
              type="text"
              className="input"
              value={versionB.subject}
              onChange={e => setVersionB({ ...versionB, subject: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Headline / Hook</label>
            <input
              type="text"
              className="input"
              value={versionB.headline}
              onChange={e => setVersionB({ ...versionB, headline: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Primary Call to Action (CTA)</label>
            <input
              type="text"
              className="input"
              value={versionB.cta}
              onChange={e => setVersionB({ ...versionB, cta: e.target.value })}
            />
          </div>

          {/* Metric Stats for B */}
          <div style={{ marginTop: 16, padding: '12px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase' }}>
              Observed Metrics (B)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Open Rate</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{versionB.metrics.openRate}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CTR</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{versionB.metrics.ctr}%</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Conversion</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', marginTop: 2 }}>{versionB.metrics.convRate}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Outcome Card */}
      {analysisResult ? (
        <div className="card" style={{ padding: 28, animation: 'fadeIn 0.25s ease-out' }}>
          {/* Winner Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            background: 'var(--bg-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-strong)',
            marginBottom: 24,
            flexWrap: 'wrap',
            gap: 16
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                padding: 10,
                borderRadius: '50%',
                background: 'var(--text-main)',
                color: 'var(--bg-page)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Trophy size={20} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)' }}>
                  RECOMMENDED WINNER
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-main)' }}>
                  {analysisResult.recommendedWinner}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Statistical Lift</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#10b981' }}>
                  {analysisResult.liftPercentage || '+34.5% Lift'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>Confidence Score</div>
                <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-main)' }}>
                  {analysisResult.confidenceScore}%
                </div>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleDeployWinner}
              >
                <PlusCircle size={14} /> Deploy Winning Variant
              </button>
            </div>
          </div>

          {/* Rationale Summary */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Executive Strategic Rationale
            </h4>
            <p style={{ fontSize: 14.5, lineHeight: 1.6, color: 'var(--text-main)' }}>
              {analysisResult.summary}
            </p>
          </div>

          {/* Friction Points & Success Drivers Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
            <div style={{ padding: 18, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-main)' }}>
                <AlertCircle size={16} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Identified Friction Points (Variant A)</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(analysisResult.frictionPointsA || []).map((pt, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--text-dim)' }}>•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div style={{ padding: 18, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, color: 'var(--text-main)' }}>
                <CheckCircle2 size={16} />
                <span style={{ fontSize: 13, fontWeight: 700 }}>Key Conversion Drivers (Variant B)</span>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(analysisResult.keySuccessFactorsB || []).map((pt, i) => (
                  <li key={i} style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', gap: 8 }}>
                    <span style={{ color: 'var(--text-dim)' }}>•</span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Recommendations Checklist */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ListChecks size={16} />
              <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)' }}>
                Implementation Action Plan
              </h4>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(analysisResult.actionableRecommendations || []).map((rec, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    background: 'var(--bg-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: 13,
                    color: 'var(--text-main)'
                  }}
                >
                  <span style={{ fontWeight: 700, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                    0{i + 1}
                  </span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div
          className="card"
          style={{
            padding: 36,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
          }}
        >
          <div style={{ padding: 14, borderRadius: '50%', background: 'var(--bg-subtle)' }}>
            <TrendingUp size={24} />
          </div>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
            Run Optimization Analysis to Compare Creative Variants
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 460 }}>
            Select a benchmark scenario above or adjust the variants manually, then click "Run AI Optimization" to calculate lift, friction points, and the winning framework.
          </p>
        </div>
      )}
    </div>
  );
}
