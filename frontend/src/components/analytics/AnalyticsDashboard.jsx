import React, { useState, useEffect } from 'react';
import { apiGetAnalytics, apiGetAIInsights } from '../../services/api.js';
import StatCard from '../common/StatCard.jsx';
import { TimelineChart, ChannelBreakdownChart } from './MetricCharts.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  BarChart3,
  Sparkles,
  TrendingUp,
  Users,
  Layers,
  DollarSign,
  Percent,
  RefreshCw,
  Lightbulb,
  ArrowUpRight,
  CheckCircle2
} from 'lucide-react';

export default function AnalyticsDashboard({ onNavigateToFeature }) {
  const { showToast } = useToast();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState([]);
  const [generatingInsights, setGeneratingInsights] = useState(false);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await apiGetAnalytics();
      setAnalytics(data);
    } catch (err) {
      showToast('Error loading analytics: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleGenerateInsights = async () => {
    if (!analytics) return;
    setGeneratingInsights(true);
    try {
      const res = await apiGetAIInsights(
        analytics.kpi,
        analytics.topCampaigns,
        analytics.segmentPerformance
      );
      setInsights(res.insights || []);
      showToast('Generated strategic growth recommendations!', 'success');
    } catch (err) {
      showToast('Failed to generate insights: ' + err.message, 'error');
    } finally {
      setGeneratingInsights(false);
    }
  };

  const kpi = analytics?.kpi || {};

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Analytics & Intelligence Dashboard
            </h1>
            <span className="badge badge-active" style={{ fontSize: 11 }}>Feature 6</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Monitor campaign engagement, conversion funnel velocity, customer segment value, and AI strategic recommendations.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleGenerateInsights}
          disabled={generatingInsights}
        >
          {generatingInsights ? (
            <>
              <RefreshCw size={14} className="spin" /> Generating AI Suggestions...
            </>
          ) : (
            <>
              <Sparkles size={14} /> Generate AI Suggestions for Improvement
            </>
          )}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard
          title="Total Campaigns"
          value={kpi.totalCampaigns || 5}
          icon={Layers}
          subtitle={`${kpi.activeCampaigns || 3} currently active`}
        />
        <StatCard
          title="Audience Reached"
          value={(kpi.totalAudience || 20850).toLocaleString()}
          icon={Users}
          subtitle="Targeted recipients"
          trend="+12.4%"
        />
        <StatCard
          title="Avg Engagement Rate"
          value={`${kpi.avgOpenRate || 42.4}%`}
          icon={Percent}
          subtitle="Email & ad views"
          trend="+3.1%"
        />
        <StatCard
          title="Conversion Rate"
          value={`${kpi.avgConversionRate || 5.2}%`}
          icon={TrendingUp}
          subtitle="Overall checkout rate"
          trend="+0.8%"
        />
        <StatCard
          title="Attributed Revenue"
          value={`$${(kpi.totalRevenue || 50450).toLocaleString()}`}
          icon={DollarSign}
          subtitle="Direct campaign sales"
          trend="+18.5%"
        />
      </div>

      {/* AI Generated Suggestions Banner */}
      {insights.length > 0 && (
        <div className="card" style={{ padding: 24, marginBottom: 24, borderTop: '3px solid var(--border-focus)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ padding: 6, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
                <Lightbulb size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)', margin: 0 }}>
                  AI-Generated Strategic Recommendations
                </h3>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Actionable experiments and improvements synthesized from current audience and conversion metrics
                </p>
              </div>
            </div>
            <span className="badge badge-active" style={{ fontSize: 11 }}>AI Strategy</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {insights.map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: 16,
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-subtle)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span className="badge" style={{ fontSize: 10 }}>{item.category}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: '#10b981' }}>
                      {item.estimatedLift}
                    </span>
                  </div>
                  <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-main)', marginBottom: 6 }}>
                    {item.title}
                  </h4>
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                    {item.description}
                  </p>
                </div>

                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11 }}
                    onClick={() => {
                      if (item.category === 'Automation' && onNavigateToFeature) onNavigateToFeature('automations');
                      else if (onNavigateToFeature) onNavigateToFeature('generator');
                    }}
                  >
                    Take Action <ArrowUpRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Performance Over Time */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
                7-Day Campaign Performance Timeline
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Daily volume delivered vs. engaged user opens</p>
            </div>
            <span className="badge" style={{ fontSize: 11 }}>Weekly</span>
          </div>

          <TimelineChart data={analytics?.timelineData || []} />
        </div>

        {/* Channel Revenue Share */}
        <div className="card" style={{ padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
                Revenue by Marketing Channel
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Distribution across active blast channels</p>
            </div>
            <span className="badge" style={{ fontSize: 11 }}>Share %</span>
          </div>

          <ChannelBreakdownChart channels={analytics?.channelBreakdown || []} />
        </div>
      </div>

      {/* Segment Performance Table */}
      <div className="card" style={{ padding: 22 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
              Segment Value & Conversion Matrix
            </h3>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Comparison of customer segments by responsiveness and average spend</p>
          </div>
          <span className="badge" style={{ fontSize: 11 }}>RFM Analysis</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase' }}>Segment Name</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase' }}>Audience Count</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase' }}>Conversion Rate</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase' }}>Average Customer Spend</th>
              <th style={{ padding: '10px 14px', fontWeight: 600, fontSize: 11.5, textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {(analytics?.segmentPerformance || []).map((seg, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {seg.segment}
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>
                  {seg.count} profiles
                </td>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>
                  <span style={{ color: seg.convRate > 10 ? '#10b981' : (seg.convRate < 4 ? '#ef4444' : 'var(--text-main)') }}>
                    {seg.convRate}%
                  </span>
                </td>
                <td style={{ padding: '12px 14px', color: 'var(--text-main)' }}>
                  ${Math.round(seg.avgSpend || 0).toLocaleString()}
                </td>
                <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 11 }}
                    onClick={() => onNavigateToFeature && onNavigateToFeature('segmentation')}
                  >
                    View Segment
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
