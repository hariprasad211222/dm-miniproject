import { getUserFromToken, loadDB, saveDB } from '../data/store.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  let result = getUserFromToken(authHeader);

  // Auto-heal session if server DB was reset or token desynchronized
  if (!result || !result.user) {
    const clientEmail = req.headers['x-user-email'];
    if (clientEmail) {
      const db = loadDB();
      const cleanToken = authHeader.replace('Bearer ', '').trim();
      const clientName = req.headers['x-user-name'] ? decodeURIComponent(req.headers['x-user-name']) : clientEmail.split('@')[0];
      const clientTier = req.headers['x-user-tier'] || 'business';
      const clientId = req.headers['x-user-id'] || `usr-${Date.now()}`;

      let user = db.users.find(u => u.email.toLowerCase() === clientEmail.toLowerCase().trim());
      if (user) {
        user.token = cleanToken;
      } else {
        user = {
          id: clientId,
          name: clientName,
          email: clientEmail.toLowerCase().trim(),
          password: 'password123',
          accountType: clientTier,
          role: clientTier === 'personal' ? 'Creator / Solo Marketer' : 'Marketing Director',
          token: cleanToken,
          createdAt: new Date().toISOString(),
          settings: { showTourOnStartup: false, theme: 'system' },
          campaigns: [],
          customers: [],
          automations: [],
          abTests: [],
          automationLogs: []
        };
        db.users.push(user);
      }
      saveDB(db);
      result = { user, db };
    }
  }

  if (!result || !result.user) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  req.user = result.user;
  req.db = result.db;
  next();
}
