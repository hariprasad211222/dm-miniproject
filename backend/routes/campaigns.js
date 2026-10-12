import express from 'express';
import { loadDB, saveDB } from '../data/store.js';

const router = express.Router();

/**
 * List all campaigns with filtering
 */
router.get('/', (req, res) => {
  const { status, channel, search } = req.query;
  const db = loadDB();
  let campaigns = db.campaigns || [];

  if (status && status !== 'All') {
    campaigns = campaigns.filter(c => c.status.toLowerCase() === status.toLowerCase());
  }

  if (channel && channel !== 'All') {
    campaigns = campaigns.filter(c => c.channel.toLowerCase() === channel.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    campaigns = campaigns.filter(c =>
      c.title.toLowerCase().includes(s) ||
      (c.subjectLine && c.subjectLine.toLowerCase().includes(s)) ||
      (c.targetSegment && c.targetSegment.toLowerCase().includes(s))
    );
  }

  res.json({ campaigns });
});

/**
 * Get campaign by ID
 */
router.get('/:id', (req, res) => {
  const db = loadDB();
  const campaign = db.campaigns.find(c => c.id === req.params.id);
  if (!campaign) {
    return res.status(404).json({ error: 'Campaign not found' });
  }
  res.json({ campaign });
});

/**
 * Create campaign
 */
router.post('/', (req, res) => {
  const {
    title,
    channel = 'Email',
    status = 'Draft',
    targetSegment = 'All Customers',
    subjectLine = '',
    content = '',
    scheduledDate = new Date().toISOString(),
    audienceSize = 1000,
    budget = 500
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Campaign title is required' });
  }

  const db = loadDB();
  const newCampaign = {
    id: `cmp-${Date.now()}`,
    title,
    channel,
    status,
    targetSegment,
    subjectLine,
    content,
    scheduledDate,
    audienceSize: Number(audienceSize) || 1000,
    budget: Number(budget) || 0,
    metrics: {
      sent: status === 'Active' ? Number(audienceSize) || 1000 : 0,
      opened: status === 'Active' ? Math.round((Number(audienceSize) || 1000) * 0.42) : 0,
      clicks: status === 'Active' ? Math.round((Number(audienceSize) || 1000) * 0.16) : 0,
      conversions: status === 'Active' ? Math.round((Number(audienceSize) || 1000) * 0.045) : 0,
      revenue: status === 'Active' ? Math.round((Number(audienceSize) || 1000) * 0.045 * 85) : 0
    },
    createdAt: new Date().toISOString()
  };

  db.campaigns.unshift(newCampaign);
  saveDB(db);

  res.status(201).json({ message: 'Campaign created successfully', campaign: newCampaign });
});

/**
 * Update campaign
 */
router.put('/:id', (req, res) => {
  const db = loadDB();
  const index = db.campaigns.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const existing = db.campaigns[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString()
  };

  // If status changed to Active and metrics were zero, simulate initial delivery
  if (req.body.status === 'Active' && existing.metrics?.sent === 0) {
    const size = updated.audienceSize || 1200;
    updated.metrics = {
      sent: size,
      opened: Math.round(size * 0.44),
      clicks: Math.round(size * 0.18),
      conversions: Math.round(size * 0.048),
      revenue: Math.round(size * 0.048 * 92)
    };
  }

  db.campaigns[index] = updated;
  saveDB(db);

  res.json({ message: 'Campaign updated successfully', campaign: updated });
});

/**
 * Duplicate campaign
 */
router.post('/:id/duplicate', (req, res) => {
  const db = loadDB();
  const original = db.campaigns.find(c => c.id === req.params.id);

  if (!original) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const copy = {
    ...original,
    id: `cmp-${Date.now()}`,
    title: `${original.title} (Copy)`,
    status: 'Draft',
    metrics: { sent: 0, opened: 0, clicks: 0, conversions: 0, revenue: 0 },
    createdAt: new Date().toISOString()
  };

  db.campaigns.unshift(copy);
  saveDB(db);

  res.status(201).json({ message: 'Campaign duplicated', campaign: copy });
});

/**
 * Delete campaign
 */
router.delete('/:id', (req, res) => {
  const db = loadDB();
  const initialLength = db.campaigns.length;
  db.campaigns = db.campaigns.filter(c => c.id !== req.params.id);

  if (db.campaigns.length === initialLength) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  saveDB(db);
  res.json({ message: 'Campaign deleted successfully' });
});

export default router;
