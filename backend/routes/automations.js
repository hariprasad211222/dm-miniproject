import express from 'express';
import { loadDB, saveDB } from '../data/store.js';
import { segmentCustomers } from '../services/rfmSegmentation.js';

const router = express.Router();

/**
 * List all automation rules and recent logs
 */
router.get('/', (req, res) => {
  const db = loadDB();
  res.json({
    automations: db.automations || [],
    logs: db.automationLogs || []
  });
});

/**
 * Create automation rule
 */
router.post('/', (req, res) => {
  const { name, trigger, triggerCondition, action, channel = 'Email', isActive = true } = req.body;

  if (!name || !trigger || !action) {
    return res.status(400).json({ error: 'Name, trigger, and action are required' });
  }

  const db = loadDB();
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

  db.automations.push(newRule);
  saveDB(db);

  res.status(201).json({ message: 'Automation rule created', automation: newRule });
});

/**
 * Update automation rule (or toggle active)
 */
router.put('/:id', (req, res) => {
  const db = loadDB();
  const index = db.automations.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Automation rule not found' });
  }

  const existing = db.automations[index];
  const updated = {
    ...existing,
    ...req.body,
    id: existing.id
  };

  db.automations[index] = updated;
  saveDB(db);

  res.json({ message: 'Automation updated', automation: updated });
});

/**
 * Delete automation rule
 */
router.delete('/:id', (req, res) => {
  const db = loadDB();
  const initialLength = db.automations.length;
  db.automations = db.automations.filter(a => a.id !== req.params.id);

  if (db.automations.length === initialLength) {
    return res.status(404).json({ error: 'Automation rule not found' });
  }

  saveDB(db);
  res.json({ message: 'Automation deleted successfully' });
});

/**
 * Run / Simulate automation rules on active customer dataset
 */
router.post('/simulate', (req, res) => {
  const { ruleId } = req.body;
  const db = loadDB();
  const customers = db.customers || [];
  const { customers: segmented } = segmentCustomers(customers);

  let targetRules = db.automations.filter(a => a.isActive);
  if (ruleId) {
    targetRules = db.automations.filter(a => a.id === ruleId);
  }

  if (targetRules.length === 0) {
    return res.status(400).json({ error: 'No active automation rules to simulate.' });
  }

  const newLogs = [];
  const now = new Date().toISOString();

  targetRules.forEach(rule => {
    // Determine matching customers based on trigger logic
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

  db.automationLogs = [...newLogs, ...(db.automationLogs || [])].slice(0, 50);
  saveDB(db);

  res.json({
    message: `Simulation executed successfully! Generated ${newLogs.length} automated events.`,
    simulatedEventsCount: newLogs.length,
    newLogs: newLogs,
    updatedAutomations: db.automations
  });
});

export default router;
