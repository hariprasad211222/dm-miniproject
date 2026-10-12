import express from 'express';
import { saveDB } from '../data/store.js';
import { segmentCustomers } from '../services/rfmSegmentation.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

/**
 * List all automations for current user
 */
router.get('/', (req, res) => {
  const user = req.user;
  res.json({
    automations: user.automations || [],
    logs: user.automationLogs || []
  });
});

/**
 * Create automation rule for current user
 */
router.post('/', (req, res) => {
  const { name, trigger, triggerCondition, action, channel = 'Email', isActive = true } = req.body;

  if (!name || !trigger || !action) {
    return res.status(400).json({ error: 'Name, trigger, and action are required' });
  }

  const user = req.user;
  const db = req.db;
  if (!user.automations) user.automations = [];

  const newRule = {
    id: `auto-${Date.now()}`,
    name,
    trigger,
    triggerCondition: triggerCondition || 'Standard Trigger Match',
    action,
    channel,
    isActive: Boolean(isActive),
    stats: { triggeredCount: 0, executionSuccess: 0, lastFired: null },
    createdAt: new Date().toISOString()
  };

  user.automations.push(newRule);
  saveDB(db);

  res.status(201).json({ message: 'Automation rule created', automation: newRule });
});

/**
 * Update automation rule for current user
 */
router.put('/:id', (req, res) => {
  const user = req.user;
  const db = req.db;
  const index = (user.automations || []).findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Automation rule not found' });
  }

  const existing = user.automations[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id
  };

  user.automations[index] = updated;
  saveDB(db);

  res.json({ message: 'Automation updated', automation: updated });
});

/**
 * Delete automation rule for current user
 */
router.delete('/:id', (req, res) => {
  const user = req.user;
  const db = req.db;
  const initialLength = (user.automations || []).length;
  user.automations = (user.automations || []).filter(a => a.id !== req.params.id);

  if (user.automations.length === initialLength) {
    return res.status(404).json({ error: 'Automation rule not found' });
  }

  saveDB(db);
  res.json({ message: 'Automation deleted successfully' });
});

/**
 * Simulate automation rules against current user's customer base
 */
router.post('/simulate', (req, res) => {
  const { ruleId } = req.body;
  const user = req.user;
  const db = req.db;
  const customers = user.customers || [];
  const { customers: segmented } = segmentCustomers(customers);

  let targetRules = (user.automations || []).filter(a => a.isActive);
  if (ruleId) {
    targetRules = (user.automations || []).filter(a => a.id === ruleId);
  }

  if (targetRules.length === 0) {
    return res.status(400).json({ error: 'No active automation rules to simulate. Create or activate a rule first.' });
  }

  if (segmented.length === 0) {
    return res.status(400).json({ error: 'No customers available to simulate on. Import or add customers in Segmentation first.' });
  }

  const newLogs = [];
  const now = new Date().toISOString();

  targetRules.forEach(rule => {
    let matchedCustomers = [];
    const triggerLower = rule.trigger.toLowerCase();

    if (triggerLower.includes('sign') || triggerLower.includes('welcome') || triggerLower.includes('new')) {
      matchedCustomers = segmented.filter(c => c.segment === 'New Signups').slice(0, 3);
    } else if (triggerLower.includes('inactive') || triggerLower.includes('re-engagement') || triggerLower.includes('win-back')) {
      matchedCustomers = segmented.filter(c => c.segment === 'Inactive / At Risk').slice(0, 3);
    } else if (triggerLower.includes('vip') || triggerLower.includes('spend') || triggerLower.includes('loyal')) {
      matchedCustomers = segmented.filter(c => c.segment === 'Loyal VIPs' || c.spend > 4000).slice(0, 3);
    } else {
      matchedCustomers = segmented.slice(0, 2);
    }

    if (matchedCustomers.length === 0) {
      matchedCustomers = segmented.slice(0, 1);
    }

    matchedCustomers.forEach(cust => {
      const logEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: now,
        ruleName: rule.name,
        customer: cust.name,
        email: cust.email,
        action: rule.action,
        status: 'Delivered'
      };
      newLogs.push(logEntry);
    });

    rule.stats.triggeredCount = (rule.stats.triggeredCount || 0) + matchedCustomers.length;
    rule.stats.executionSuccess = (rule.stats.executionSuccess || 0) + matchedCustomers.length;
    rule.stats.lastFired = now;
  });

  user.automationLogs = [...newLogs, ...(user.automationLogs || [])].slice(0, 50);
  saveDB(db);

  res.json({
    message: `Simulation executed successfully! Generated ${newLogs.length} automated events.`,
    simulatedEventsCount: newLogs.length,
    newLogs: newLogs,
    updatedAutomations: user.automations
  });
});

/**
 * Load starter automation presets on-demand
 */
router.post('/load-starter', (req, res) => {
  const user = req.user;
  const db = req.db;

  const starter = [
    {
      id: `auto-${Date.now()}-1`,
      name: 'Instant Welcome Sequence',
      trigger: 'Customer Signs Up',
      triggerCondition: 'Immediate',
      action: 'Send Welcome Email + 10% Discount Code',
      channel: 'Email',
      isActive: true,
      stats: { triggeredCount: 0, executionSuccess: 0, lastFired: null },
      createdAt: new Date().toISOString()
    },
    {
      id: `auto-${Date.now()}-2`,
      name: 'Inactive Customer Re-Engagement',
      trigger: 'Customer Inactive > 45 Days',
      triggerCondition: 'Days Inactive >= 45 and Past Spend > $100',
      action: 'Prepare Win-Back Email with $20 Credit',
      channel: 'Email',
      isActive: true,
      stats: { triggeredCount: 0, executionSuccess: 0, lastFired: null },
      createdAt: new Date().toISOString()
    }
  ];

  user.automations = [...starter, ...(user.automations || [])];
  saveDB(db);

  res.json({ message: 'Loaded starter automation templates', automations: user.automations });
});

export default router;
