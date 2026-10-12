import express from 'express';
import { saveDB } from '../data/store.js';
import { segmentCustomers, parseCSV } from '../services/rfmSegmentation.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();
router.use(requireAuth);

/**
 * Get segmented customers for current user
 */
router.get('/', (req, res) => {
  const { segment, search } = req.query;
  const user = req.user;
  const customers = user.customers || [];

  const { customers: segmented, summary } = segmentCustomers(customers);
  let filtered = segmented;

  if (segment && segment !== 'All') {
    filtered = filtered.filter(c => c.segment.toLowerCase() === segment.toLowerCase());
  }

  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(c =>
      c.name.toLowerCase().includes(s) ||
      c.email.toLowerCase().includes(s) ||
      c.id.toLowerCase().includes(s)
    );
  }

  res.json({
    summary,
    customers: filtered,
    totalRecords: segmented.length
  });
});

/**
 * Upload & import CSV data for current user
 */
router.post('/upload', (req, res) => {
  const { csvText, replace = true } = req.body;

  if (!csvText || typeof csvText !== 'string') {
    return res.status(400).json({ error: 'Valid CSV text content is required' });
  }

  const parsed = parseCSV(csvText);

  if (!parsed || parsed.length === 0) {
    return res.status(400).json({ error: 'No valid rows found in CSV file. Check header row.' });
  }

  const user = req.user;
  const db = req.db;

  if (replace) {
    user.customers = parsed;
  } else {
    user.customers = [...(user.customers || []), ...parsed];
  }

  saveDB(db);

  const { customers: segmented, summary } = segmentCustomers(user.customers);

  res.json({
    message: `Successfully imported and segmented ${parsed.length} customers!`,
    summary,
    customers: segmented.slice(0, 50),
    totalImported: parsed.length
  });
});

/**
 * Explicit starter/sample dataset loader for testing on-demand
 */
router.post('/reset-sample', (req, res) => {
  const user = req.user;
  const db = req.db;

  const sample = [
    { id: 'CUST-1001', name: 'Sophia Chen', email: 'sophia.chen@example.com', age: 34, income: 84000, spend: 3420, orders: 14, days_inactive: 6, open_rate: 0.72 },
    { id: 'CUST-1002', name: 'Marcus Vance', email: 'marcus.v@example.com', age: 42, income: 112000, spend: 7890, orders: 28, days_inactive: 3, open_rate: 0.85 },
    { id: 'CUST-1003', name: 'Elena Rostova', email: 'elena.rostova@example.com', age: 29, income: 62000, spend: 940, orders: 4, days_inactive: 18, open_rate: 0.54 },
    { id: 'CUST-1004', name: 'David Kim', email: 'dkim.marketing@example.com', age: 38, income: 95000, spend: 4120, orders: 18, days_inactive: 12, open_rate: 0.64 },
    { id: 'CUST-1005', name: 'Liam Gallagher', email: 'liam.g@example.com', age: 51, income: 104000, spend: 5300, orders: 21, days_inactive: 85, open_rate: 0.18 },
    { id: 'CUST-1006', name: 'Javier Morales', email: 'j.morales@example.com', age: 45, income: 58000, spend: 610, orders: 3, days_inactive: 110, open_rate: 0.12 },
    { id: 'CUST-1007', name: 'Zara Patel', email: 'zara.patel@example.com', age: 24, income: 52000, spend: 320, orders: 2, days_inactive: 4, open_rate: 0.68 },
    { id: 'CUST-1008', name: 'Henrik Lindqvist', email: 'h.lindqvist@example.com', age: 49, income: 128000, spend: 9140, orders: 32, days_inactive: 5, open_rate: 0.91 }
  ];

  user.customers = sample;
  saveDB(db);

  const { customers: segmented, summary } = segmentCustomers(sample);
  res.json({ message: 'Loaded starter sample dataset', summary, customers: segmented });
});

/**
 * Clear all customers for current user
 */
router.post('/clear', (req, res) => {
  const user = req.user;
  const db = req.db;
  user.customers = [];
  saveDB(db);
  const { customers: segmented, summary } = segmentCustomers([]);
  res.json({ message: 'All customer data cleared', summary, customers: [] });
});

/**
 * Download sample customer CSV format
 */
router.get('/sample-csv', (req, res) => {
  const csvContent = `customer_id,name,email,age,income,spend,orders,days_inactive,open_rate
CUST-101,Alex Morgan,alex.morgan@example.com,32,85000,4200,16,4,0.78
CUST-102,Brenda Taylor,b.taylor@example.com,45,115000,8900,32,2,0.92
CUST-103,Carl Jenkins,carl.j@example.com,28,52000,310,2,8,0.45
CUST-104,Diana Prince,diana.p@example.com,36,92000,3100,12,18,0.62
CUST-105,Evan Wright,evan.wright@example.com,52,78000,1400,6,88,0.18`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="marketing_sample_customers.csv"');
  res.send(csvContent);
});

export default router;
