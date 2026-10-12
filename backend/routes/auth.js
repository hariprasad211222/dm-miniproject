import express from 'express';
import { loadDB, saveDB } from '../data/store.js';

const router = express.Router();

/**
 * Register a new user
 */
router.post('/register', (req, res) => {
  const { name, email, password, role = 'Marketing Strategist' } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const db = loadDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name: name || email.split('@')[0],
    email: email.toLowerCase().trim(),
    password: password, // In production, hash with bcrypt; here stored cleanly for mock/prototype
    role: role,
    token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  saveDB(db);

  // Return user without password
  const { password: _, ...userWithoutPass } = newUser;
  return res.status(201).json({
    message: 'Registration successful',
    user: userWithoutPass,
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

  const db = loadDB();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = `token-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  user.token = token;
  saveDB(db);

  const { password: _, ...userWithoutPass } = user;
  return res.json({
    message: 'Login successful',
    user: userWithoutPass,
    token: token
  });
});

/**
 * Verify current session
 */
router.get('/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = authHeader.replace('Bearer ', '');
  const db = loadDB();
  const user = db.users.find(u => u.token === token);

  if (!user) {
    return res.status(401).json({ error: 'Session expired or invalid' });
  }

  const { password: _, ...userWithoutPass } = user;
  return res.json({ user: userWithoutPass });
});

export default router;
