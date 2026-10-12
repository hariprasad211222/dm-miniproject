import express from 'express';
import { loadDB, saveDB } from '../data/store.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * Register a new user with Personal or Business account type
 */
router.post('/register', (req, res) => {
  const { name, email, password, accountType = 'business', role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = loadDB();
  const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const type = (accountType === 'personal' || accountType === 'business') ? accountType : 'business';

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name?.trim() || cleanEmail.split('@')[0],
    email: cleanEmail,
    password: password,
    accountType: type,
    role: role || (type === 'personal' ? 'Creator / Solo Marketer' : 'Marketing Director'),
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
    settings: {
      showTourOnStartup: true,
      theme: 'system',
      defaultTone: 'Professional'
    },
    campaigns: [],
    customers: [],
    automations: [],
    abTests: [],
    automationLogs: []
  };

  db.users.push(newUser);
  saveDB(db);

  const { password: _, campaigns, customers, automations, abTests, automationLogs, ...userMeta } = newUser;
  return res.status(201).json({
    message: 'Account created successfully',
    user: userMeta,
    token: newUser.token
  });
});

/**
 * Login user
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = loadDB();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  user.token = token;
  saveDB(db);

  const { password: _, campaigns, customers, automations, abTests, automationLogs, ...userMeta } = user;
  return res.json({
    message: 'Login successful',
    user: userMeta,
    token: token
  });
});

/**
 * Verify current session
 */
router.get('/me', requireAuth, (req, res) => {
  const { password: _, campaigns, customers, automations, abTests, automationLogs, ...userMeta } = req.user;
  return res.json({ user: userMeta });
});

/**
 * Update profile details (Name, Email)
 */
router.put('/profile', requireAuth, (req, res) => {
  const { name, email } = req.body;
  const user = req.user;
  const db = req.db;

  if (email && email.toLowerCase().trim() !== user.email) {
    const cleanEmail = email.toLowerCase().trim();
    const clash = db.users.find(u => u.id !== user.id && u.email.toLowerCase() === cleanEmail);
    if (clash) {
      return res.status(409).json({ error: 'Another account already uses this email' });
    }
    user.email = cleanEmail;
  }

  if (name) {
    user.name = name.trim();
  }

  saveDB(db);
  const { password: _, campaigns, customers, automations, abTests, automationLogs, ...userMeta } = user;
  res.json({ message: 'Profile updated successfully', user: userMeta });
});

/**
 * Change password
 */
router.put('/password', requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = req.user;
  const db = req.db;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  if (user.password !== currentPassword) {
    return res.status(401).json({ error: 'Incorrect current password' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }

  user.password = newPassword;
  saveDB(db);
  res.json({ message: 'Password updated successfully' });
});

/**
 * Switch account type (Personal <-> Business)
 */
router.put('/account-type', requireAuth, (req, res) => {
  const { accountType } = req.body;
  const user = req.user;
  const db = req.db;

  if (accountType !== 'personal' && accountType !== 'business') {
    return res.status(400).json({ error: 'Invalid account type. Must be "personal" or "business"' });
  }

  user.accountType = accountType;
  saveDB(db);
  const { password: _, campaigns, customers, automations, abTests, automationLogs, ...userMeta } = user;
  res.json({ message: `Switched to ${accountType === 'business' ? 'Business Pro' : 'Personal Creator'} account`, user: userMeta });
});

/**
 * Update user settings (e.g. showTourOnStartup)
 */
router.put('/settings', requireAuth, (req, res) => {
  const user = req.user;
  const db = req.db;
  user.settings = { ...user.settings, ...req.body };
  saveDB(db);
  res.json({ message: 'Settings saved', settings: user.settings });
});

/**
 * Delete account and all associated user data
 */
router.delete('/account', requireAuth, (req, res) => {
  const user = req.user;
  const db = req.db;

  db.users = db.users.filter(u => u.id !== user.id);
  saveDB(db);

  res.json({ message: 'Your account and all workspace data have been deleted permanently.' });
});

export default router;
