import React, { useState, useEffect } from 'react';
import {
  apiGetCampaigns,
  apiDeleteCampaign,
  apiDuplicateCampaign,
  apiUpdateCampaign,
  apiLoadStarterCampaigns
} from '../../services/api.js';
import CampaignFormModal from './CampaignFormModal.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import {
  Layers,
  Plus,
  Search,
  Calendar,
  Users,
  Copy,
  Trash2,
  Edit,
  Play,
  Pause,
  CheckCircle,
  Eye,
  Mail,
  Radio,
  FileText
} from 'lucide-react';

export default function CampaignManager({ targetSegmentPreset = '' }) {
  const { showToast } = useToast();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [channelFilter, setChannelFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [previewCampaign, setPreviewCampaign] = useState(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const data = await apiGetCampaigns({
        status: statusFilter,
        channel: channelFilter,
        search: searchTerm
      });
      setCampaigns(data.campaigns || []);
    } catch (err) {
      showToast('Error loading campaigns: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [statusFilter, channelFilter, searchTerm]);

  useEffect(() => {
    if (targetSegmentPreset) {
      setSelectedCampaign(null);
      setIsFormOpen(true);
    }
  }, [targetSegmentPreset]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      await apiDeleteCampaign(id);
      showToast('Campaign deleted successfully', 'success');
      fetchCampaigns();
    } catch (err) {
      showToast('Failed to delete campaign: ' + err.message, 'error');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await apiDuplicateCampaign(id);
      showToast('Campaign duplicated', 'success');
      fetchCampaigns();
    } catch (err) {
      showToast('Failed to duplicate: ' + err.message, 'error');
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await apiUpdateCampaign(id, { status: newStatus });
      showToast(`Campaign status updated to ${newStatus}`, 'success');
      fetchCampaigns();
    } catch (err) {
      showToast('Failed to update status: ' + err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || 'draft').toLowerCase();
    let cls = 'status-draft';
    if (s === 'active') cls = 'status-active';
    else if (s === 'scheduled') cls = 'status-scheduled';
    else if (s === 'completed') cls = 'status-completed';
    else if (s === 'paused') cls = 'status-paused';

    return (
      <span className={`status-pill ${cls}`}>
        <span className="status-dot" />
        {status}
      </span>
    );
  };

  return (
    <div className="page-wrapper">
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--text-main)' }}>
              Campaign Manager
            </h1>
            <span className="badge badge-active" style={{ fontSize: 11 }}>Feature 2</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
            Create, schedule, track, and manage all multi-channel marketing campaigns in one unified dashboard.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => { setSelectedCampaign(null); setIsFormOpen(true); }}
        >
          <Plus size={16} /> Create Campaign
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['All', 'Active', 'Scheduled', 'Draft', 'Paused', 'Completed'].map(st => (
              <button
                key={st}
                type="button"
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Channel filter */}
            <select
              className="select"
              style={{ width: 140, padding: '6px 10px', fontSize: 13 }}
              value={channelFilter}
              onChange={e => setChannelFilter(e.target.value)}
            >
              <option value="All">All Channels</option>
              <option value="Email">Email</option>
              <option value="Google Ads">Google Ads</option>
              <option value="SMS">SMS</option>
              <option value="Social Media">Social Media</option>
            </select>

            {/* Search Input */}
            <div style={{ position: 'relative', width: 220 }}>
              <input
                type="text"
                className="input"
                style={{ paddingLeft: 32, padding: '6px 10px 6px 32px', fontSize: 13 }}
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search size={14} style={{ position: 'absolute', left: 10, top: 10, color: 'var(--text-dim)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns Table / Cards */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
              <th style={{ padding: '14px 20px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Campaign & Subject</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Channel</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Target Segment</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Schedule Date</th>
              <th style={{ padding: '14px 16px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase' }}>Performance</th>
              <th style={{ padding: '14px 20px', fontWeight: 600, fontSize: 12, textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading campaigns...
                </td>
              </tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: 48, textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
                    No campaigns found in your workspace. Create a new campaign or load a starter template.
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={async () => {
                        try {
                          await apiLoadStarterCampaigns();
                          showToast('Starter campaign loaded', 'success');
                          fetchCampaigns();
                        } catch (err) {
                          showToast('Error loading starter: ' + err.message, 'error');
                        }
                      }}
                    >
                      Load Starter Campaign
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => { setSelectedCampaign(null); setIsFormOpen(true); }}
                    >
                      <Plus size={14} /> Create Campaign
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              campaigns.map(cmp => (
                <tr
                  key={cmp.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'var(--transition)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 14 }}>
                      {cmp.title}
                    </div>
                    {cmp.subjectLine && (
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {cmp.subjectLine}
                      </div>
                    )}
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    <span className="badge" style={{ fontSize: 11 }}>{cmp.channel}</span>
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--text-main)' }}>
                      <Users size={14} style={{ color: 'var(--text-dim)' }} />
                      <span>{cmp.targetSegment}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>
                      ~{cmp.audienceSize?.toLocaleString() || 1000} users
                    </div>
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    {getStatusBadge(cmp.status)}
                  </td>

                  <td style={{ padding: '16px 16px', fontSize: 12.5, color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={13} />
                      <span>
                        {cmp.scheduledDate ? new Date(cmp.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Immediate'}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '16px 16px' }}>
                    {cmp.metrics?.sent > 0 ? (
                      <div style={{ fontSize: 12, lineHeight: 1.3 }}>
                        <div><strong>{cmp.metrics.opened?.toLocaleString()}</strong> opens ({Math.round((cmp.metrics.opened / cmp.metrics.sent) * 100)}%)</div>
                        <div style={{ color: 'var(--text-muted)' }}><strong>${cmp.metrics.revenue?.toLocaleString()}</strong> revenue</div>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>Not yet launched</span>
                    )}
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      {/* Content Preview */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        title="Preview content"
                        onClick={() => setPreviewCampaign(cmp)}
                      >
                        <Eye size={14} />
                      </button>

                      {/* Status toggle shortcuts */}
                      {cmp.status !== 'Active' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          title="Activate / Launch campaign"
                          onClick={() => handleStatusChange(cmp.id, 'Active')}
                        >
                          <Play size={14} />
                        </button>
                      )}

                      {cmp.status === 'Active' && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          title="Pause campaign"
                          onClick={() => handleStatusChange(cmp.id, 'Paused')}
                        >
                          <Pause size={14} />
                        </button>
                      )}

                      {/* Edit */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        title="Edit campaign"
                        onClick={() => { setSelectedCampaign(cmp); setIsFormOpen(true); }}
                      >
                        <Edit size={14} />
                      </button>

                      {/* Duplicate */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        title="Duplicate"
                        onClick={() => handleDuplicate(cmp.id)}
                      >
                        <Copy size={14} />
                      </button>

                      {/* Delete */}
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        title="Delete"
                        onClick={() => handleDelete(cmp.id)}
                        style={{ color: '#ef4444' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      <CampaignFormModal
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSelectedCampaign(null); }}
        campaign={selectedCampaign}
        onSaved={fetchCampaigns}
        initialSegment={targetSegmentPreset}
      />

      {/* Content Preview Modal */}
      {previewCampaign && (
        <div className="modal-overlay" onClick={() => setPreviewCampaign(null)}>
          <div className="modal-container" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">{previewCampaign.title}</h3>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Target: {previewCampaign.targetSegment} | Channel: {previewCampaign.channel}
                </span>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => setPreviewCampaign(null)}>✕</button>
            </div>
            <div className="modal-body">
              {previewCampaign.subjectLine && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subject Line</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main)', marginTop: 4 }}>
                    {previewCampaign.subjectLine}
                  </div>
                </div>
              )}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8 }}>Campaign Body / Content</div>
                <div className="prose-code" style={{ maxHeight: 360, overflowY: 'auto' }}>
                  {previewCampaign.content || 'No content provided for this campaign.'}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  navigator.clipboard.writeText(previewCampaign.content || '');
                  showToast('Copied content to clipboard', 'success');
                }}
              >
                <Copy size={13} /> Copy Content
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setSelectedCampaign(previewCampaign);
                  setPreviewCampaign(null);
                  setIsFormOpen(true);
                }}
              >
                <Edit size={13} /> Edit Campaign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
