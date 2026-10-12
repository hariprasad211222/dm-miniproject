import { getUserFromToken } from '../data/store.js';

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const result = getUserFromToken(authHeader);
  if (!result || !result.user) {
    return res.status(401).json({ error: 'Session expired or invalid. Please sign in again.' });
  }

  req.user = result.user;
  req.db = result.db;
  next();
}
