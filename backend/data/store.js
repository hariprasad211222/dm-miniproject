import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'db.json');

// Initialize empty DB with no demo data
function getInitialSeed() {
  return {
    users: []
  };
}

export function loadDB() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialSeed();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    if (!parsed.users) parsed.users = [];
    return parsed;
  } catch (err) {
    console.error('Error loading DB file, fallback to empty:', err);
    return getInitialSeed();
  }
}

export function saveDB(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving DB file:', err);
    return false;
  }
}

/**
 * Helper to get a user and their isolated data by token or userId
 */
export function getUserFromToken(token) {
  if (!token) return null;
  const db = loadDB();
  const cleanToken = token.replace('Bearer ', '').trim();
  const user = db.users.find(u => u.token === cleanToken);
  if (!user) return null;

  // Ensure collections exist
  if (!user.campaigns) user.campaigns = [];
  if (!user.customers) user.customers = [];
  if (!user.automations) user.automations = [];
  if (!user.abTests) user.abTests = [];
  if (!user.automationLogs) user.automationLogs = [];
  if (!user.settings) user.settings = { showTourOnStartup: true, theme: 'system' };

  return { user, db };
}
