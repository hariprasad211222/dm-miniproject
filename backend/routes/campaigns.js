import express from 'express';
import { saveDB } from '../data/store.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

/**
 * List campaigns for the authenticated user
 */
router.get('/', (req, res) => {
  const { status, channel, search } = req.query;
  const user = req.user;
  let campaigns = user.campaigns || [];

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
 * Create campaign for current user
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
    audienceSize = 500,
    budget = 100
  } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Campaign title is required' });
  }

  const user = req.user;
  const db = req.db;
  if (!user.campaigns) user.campaigns = [];

  const newCampaign = {
    id: `cmp-${Date.now()}`,
    title,
    channel,
    status,
    targetSegment,
    subjectLine,
    content,
    scheduledDate,
    audienceSize: Number(audienceSize) || 500,
    budget: Number(budget) || 0,
    metrics: {
      sent: status === 'Active' ? Number(audienceSize) || 500 : 0,
      opened: status === 'Active' ? Math.round((Number(audienceSize) || 500) * 0.42) : 0,
      clicks: status === 'Active' ? Math.round((Number(audienceSize) || 500) * 0.16) : 0,
      conversions: status === 'Active' ? Math.round((Number(audienceSize) || 500) * 0.045) : 0,
      revenue: status === 'Active' ? Math.round((Number(audienceSize) || 500) * 0.045 * 85) : 0
    },
    createdAt: new Date().toISOString()
  };

  user.campaigns.unshift(newCampaign);
  saveDB(db);

  res.status(201).json({ message: 'Campaign created successfully', campaign: newCampaign });
});

/**
 * Update campaign for current user
 */
router.put('/:id', (req, res) => {
  const user = req.user;
  const db = req.db;
  const index = (user.campaigns || []).findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  const existing = user.campaigns[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id,
    updatedAt: new Date().toISOString()
  };

  if (req.body.status === 'Active' && existing.metrics?.sent === 0) {
    const size = updated.audienceSize || 500;
    updated.metrics = {
      sent: size,
      opened: Math.round(size * 0.44),
      clicks: Math.round(size * 0.18),
      conversions: Math.round(size * 0.048),
      revenue: Math.round(size * 0.048 * 92)
    };
  }

  user.campaigns[index] = updated;
  saveDB(db);

  res.json({ message: 'Campaign updated successfully', campaign: updated });
});

/**
 * Duplicate campaign for current user
 */
router.post('/:id/duplicate', (req, res) => {
  const user = req.user;
  const db = req.db;
  const original = (user.campaigns || []).find(c => c.id === req.params.id);

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

  user.campaigns.unshift(copy);
  saveDB(db);

  res.status(201).json({ message: 'Campaign duplicated', campaign: copy });
});

/**
 * Delete campaign for current user
 */
router.delete('/:id', (req, res) => {
  const user = req.user;
  const db = req.db;
  const initialLength = (user.campaigns || []).length;
  user.campaigns = (user.campaigns || []).filter(c => c.id !== req.params.id);

  if (user.campaigns.length === initialLength) {
    return res.status(404).json({ error: 'Campaign not found' });
  }

  saveDB(db);
  res.json({ message: 'Campaign deleted successfully' });
});

/**
 * Optional: Load starter pack campaigns if user explicitly asks
 */
router.post('/load-starter', (req, res) => {
  const user = req.user;
  const db = req.db;

  const starter = [
    {
      id: `cmp-${Date.now()}-1`,
      title: 'Spring Product Launch',
      channel: 'Email',
      status: 'Active',
      targetSegment: 'All Customers',
      subjectLine: 'Exclusive First Access: Meet the New Collection',
      content: 'Early access is unlocked today for all members. Use code SPRING20 for 20% off.',
      scheduledDate: new Date().toISOString(),
      audienceSize: 1200,
      budget: 350,
      metrics: { sent: 1200, opened: 540, clicks: 180, conversions: 42, revenue: 3570 },
      createdAt: new Date().toISOString()
    }
  ];

  user.campaigns = [...starter, ...(user.campaigns || [])];
  saveDB(db);

  res.json({ message: 'Starter campaign loaded', campaigns: user.campaigns });
});

export default router;
