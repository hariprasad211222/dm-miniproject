import React, { useState, useEffect, useRef } from 'react';
import {
  apiGetSegments,
  apiUploadCustomerCSV,
  apiResetSampleCustomers
} from '../../services/api.js';
import StatCard from '../common/StatCard.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Users,
  UploadCloud,
  Download,
  RotateCcw,
  Search,
  FileSpreadsheet,
  PlusCircle,
  Crown,
  Activity,
  UserPlus,
  AlertTriangle,
  DollarSign
} from 'lucide-react';

export default function CustomerSegmentation({ onTargetInCampaign }) {
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [segmentData, setSegmentData] = useState({
    customers: [],
    summary: {
      total: 0,
      loyalCount: 0,
      activeCount: 0,
      newCount: 0,
      inactiveCount: 0,
      highSpendersCount: 0,
      averageSpend: 0,
      averageOpenRate: 0
    }
  });

  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState(false);

  const fetchSegments = async () => {
    setLoading(true);
    try {
      const data = await apiGetSegments({
        segment: selectedSegment,
        search: searchTerm
      });
      setSegmentData(data);
    } catch (err) {
      showToast('Failed to load segments: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSegments();
  }, [selectedSegment, searchTerm]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      showToast('Please upload a valid .csv file', 'error');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result;
        const res = await apiUploadCustomerCSV(text);
        showToast(res.message, 'success');
        fetchSegments();
      } catch (err) {
        showToast('CSV Upload error: ' + err.message, 'error');
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleResetSample = async () => {
    try {
      const res = await apiResetSampleCustomers();
      showToast(res.message, 'success');
      fetchSegments();
    } catch (err) {
      showToast('Reset failed: ' + err.message, 'error');
    }
  };

  const handleDownloadSample = () => {
    window.location.href = '/api/segments/sample-csv';
  };

  const handleExportCSV = () => {
    const rows = segmentData.customers || [];
    if (rows.length === 0) {
      showToast('No customers to export in current view', 'error');
      return;
    }

    const headers = ['id', 'name', 'email', 'spend', 'orders', 'days_inactive', 'open_rate', 'segment', 'rfmScore'];
    const csvLines = [headers.join(',')];

    rows.forEach(r => {
      csvLines.push([
        r.id,
        `"${r.name}"`,
        r.email,
        r.spend,
        r.orders,
        r.days_inactive,
        r.open_rate,
        `"${r.segment}"`,
        r.rfmScore
      ].join(','));
    });

    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `segmented_customers_${selectedSegment.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported CSV successfully', 'success');
  };

  const summary = segmentData.summary || {};

  const getSegmentBadge = (seg) => {
    if (seg === 'Loyal VIPs') return <span className="badge" style={{ borderColor: 'var(--text-main)', fontWeight: 700 }}>👑 Loyal VIP</span>;
    if (seg === 'Active Customers') return <span className="badge" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>⚡ Active</span>;
    if (seg === 'New Signups') return <span className="badge" style={{ color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.4)' }}>✨ New Signup</span>;
    if (seg === 'Inactive / At Risk') return <span className="badge" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.4)' }}>⚠️ Inactive / At Risk</span>;
    return <span className="badge">💎 High Spender</span>;
  };

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Smart Customer Segmentation
            </h1>
            <span className="badge badge-active" style={{ fontSize: 11 }}>Feature 3</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Import customer records via CSV to automatically cluster buyers into RFM segments: Loyal VIPs, Active, New, and At-Risk.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleDownloadSample}
            title="Download formatted sample CSV file"
          >
            <Download size={14} /> Sample CSV
          </button>

          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleResetSample}
            title="Reload initial demo dataset"
          >
            <RotateCcw size={14} /> Reload Demo Data
          </button>

          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <UploadCloud size={14} /> {uploading ? 'Processing CSV...' : 'Upload Customer CSV'}
          </button>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard
          title="Total Customers"
          value={summary.total || 0}
          icon={Users}
          subtitle="Analyzed profiles"
        />
        <StatCard
          title="Loyal VIPs"
          value={summary.loyalCount || 0}
          icon={Crown}
          subtitle={`Avg $${(summary.averageSpend * 2.2).toFixed(0)} spend`}
          trend="+4.2%"
        />
        <StatCard
          title="Active Users"
          value={summary.activeCount || 0}
          icon={Activity}
          subtitle={`${Math.round(((summary.activeCount || 0) / (summary.total || 1)) * 100)}% of user base`}
        />
        <StatCard
          title="New Signups"
          value={summary.newCount || 0}
          icon={UserPlus}
          subtitle="Joined last 30d"
        />
        <StatCard
          title="Inactive / At-Risk"
          value={summary.inactiveCount || 0}
          icon={AlertTriangle}
          subtitle="> 60 days idle"
          trend="-2.1%"
        />
      </div>

      {/* Segment Selector & Action Bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          {/* Segment Filter Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'All', label: 'All Customers', count: summary.total },
              { id: 'Loyal VIPs', label: 'Loyal VIPs', count: summary.loyalCount },
              { id: 'Active Customers', label: 'Active', count: summary.activeCount },
              { id: 'New Signups', label: 'New Signups', count: summary.newCount },
              { id: 'Inactive / At Risk', label: 'Inactive / At-Risk', count: summary.inactiveCount }
            ].map(seg => (
              <button
                key={seg.id}
                type="button"
                className={`btn btn-sm ${selectedSegment === seg.id ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSelectedSegment(seg.id)}
              >
                <span>{seg.label}</span>
                <span style={{ opacity: 0.7, fontSize: 11 }}>({seg.count || 0})</span>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Search */}
            <div style={{ position: 'relative', width: 200 }}>
              <input
                type="text"
                className="input"
                style={{ paddingLeft: 30, padding: '6px 10px 6px 30px', fontSize: 13 }}
                placeholder="Search name, email, ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-dim)' }} />
            </div>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportCSV}
              title="Download current table as CSV"
            >
              <FileSpreadsheet size={14} /> Export CSV
            </button>

            {selectedSegment !== 'All' && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => onTargetInCampaign && onTargetInCampaign(selectedSegment)}
                title="Create a targeted campaign for this segment"
              >
                <PlusCircle size={14} /> Campaign for Segment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Customer ID & Name</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Contact Email</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Historical Spend</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Orders</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Days Inactive</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Email Open Rate</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>RFM Category</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', textAlign: 'right' }}>RFM Score</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading customer segment data...
                </td>
              </tr>
            ) : segmentData.customers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No customer records found in this segment. Upload a CSV or reload demo data above.
                </td>
              </tr>
            ) : (
              segmentData.customers.map(cust => (
                <tr
                  key={cust.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{cust.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{cust.id}</div>
                  </td>

                  <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>
                    {cust.email}
                  </td>

                  <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                    ${cust.spend?.toLocaleString()}
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {cust.orders} purchases
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ color: cust.days_inactive > 60 ? '#ef4444' : 'var(--text-muted)' }}>
                      {cust.days_inactive} days
                    </span>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 48, height: 5, background: 'var(--bg-subtle)', borderRadius: 4, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (cust.open_rate || 0) * 100)}%`, height: '100%', background: 'var(--text-main)' }} />
                      </div>
                      <span style={{ fontSize: 12 }}>{Math.round((cust.open_rate || 0) * 100)}%</span>
                    </div>
                  </td>

                  <td style={{ padding: '14px 16px' }}>
                    {getSegmentBadge(cust.segment)}
                  </td>

                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontWeight: 700,
                      fontSize: 12.5,
                      padding: '2px 8px',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      {cust.rfmScore}/100
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
