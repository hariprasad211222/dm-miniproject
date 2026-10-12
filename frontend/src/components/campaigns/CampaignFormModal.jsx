import React, { useState, useEffect } from 'react';
import { apiCreateCampaign, apiUpdateCampaign } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Layers, Calendar, Users, DollarSign, Send } from 'lucide-react';

export default function CampaignFormModal({ isOpen, onClose, campaign, onSaved, initialSegment = '' }) {
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [channel, setChannel] = useState('Email');
  const [status, setStatus] = useState('Draft');
  const [targetSegment, setTargetSegment] = useState('All Customers');
  const [subjectLine, setSubjectLine] = useState('');
  const [content, setContent] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [audienceSize, setAudienceSize] = useState(2500);
  const [budget, setBudget] = useState(500);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (campaign) {
      setTitle(campaign.title || '');
      setChannel(campaign.channel || 'Email');
      setStatus(campaign.status || 'Draft');
      setTargetSegment(campaign.targetSegment || 'All Customers');
      setSubjectLine(campaign.subjectLine || '');
      setContent(campaign.content || '');
      setScheduledDate(campaign.scheduledDate ? campaign.scheduledDate.substring(0, 16) : '');
      setAudienceSize(campaign.audienceSize || 2500);
      setBudget(campaign.budget || 500);
    } else {
      setTitle('');
      setChannel('Email');
      setStatus('Draft');
      setTargetSegment(initialSegment || 'All Customers');
      setSubjectLine('');
      setContent('');
      const defaultDate = new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 16);
      setScheduledDate(defaultDate);
      setAudienceSize(2500);
      setBudget(500);
    }
  }, [campaign, isOpen, initialSegment]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please provide a campaign title', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        channel,
        status,
        targetSegment,
        subjectLine,
        content,
        scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : new Date().toISOString(),
        audienceSize: Number(audienceSize),
        budget: Number(budget)
      };

      if (campaign && campaign.id) {
        await apiUpdateCampaign(campaign.id, payload);
        showToast('Campaign updated successfully!', 'success');
      } else {
        await apiCreateCampaign(payload);
        showToast('Campaign created successfully!', 'success');
      }

      onSaved();
      onClose();
    } catch (err) {
      showToast('Failed to save campaign: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ padding: 8, background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)' }}>
              <Layers size={18} />
            </div>
            <div>
              <h3 className="modal-title">
                {campaign ? 'Edit Campaign' : 'Create New Campaign'}
              </h3>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Configure schedule, target segment audience, and copy
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Campaign Title</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Q4 Black Friday Early Access"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Channel</label>
                <select className="select" value={channel} onChange={e => setChannel(e.target.value)}>
                  <option value="Email">Email</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="SMS">SMS</option>
                  <option value="Social Media">Social Media</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Status</label>
                <select className="select" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="Draft">Draft</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Target Segment</label>
                <select className="select" value={targetSegment} onChange={e => setTargetSegment(e.target.value)}>
                  <option value="All Customers">All Customers</option>
                  <option value="Loyal VIPs">Loyal VIPs</option>
                  <option value="Active Customers">Active Customers</option>
                  <option value="New Signups">New Signups</option>
                  <option value="Inactive / At Risk">Inactive / At Risk</option>
                  <option value="High Spenders">High Spenders</option>
                </select>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Subject Line / Hook</label>
              <input
                type="text"
                className="input"
                placeholder="e.g. Exclusive First Look: Save 25% Today"
                value={subjectLine}
                onChange={e => setSubjectLine(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Campaign Message Body / Ad Copy</label>
              <textarea
                className="textarea"
                style={{ minHeight: 120 }}
                placeholder="Enter campaign body, email layout, or ad copy text..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Schedule Date & Time</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Est. Audience Size</label>
                <input
                  type="number"
                  className="input"
                  value={audienceSize}
                  onChange={e => setAudienceSize(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Budget ($)</label>
                <input
                  type="number"
                  className="input"
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Saving...' : (campaign ? 'Update Campaign' : 'Create Campaign')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
