import express from 'express';
import { loadDB, saveDB } from '../data/store.js';
import { segmentCustomers, parseCSV } from '../services/rfmSegmentation.js';

const router = express.Router();

/**
 * Get segmented customers with summary metrics
 */
router.get('/', (req, res) => {
  const { segment, search } = req.query;
  const db = loadDB();
  const customers = db.customers || [];

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
 * Upload & import CSV data
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

  const db = loadDB();
  if (replace) {
    db.customers = parsed;
  } else {
    db.customers = [...db.customers, ...parsed];
  }

  saveDB(db);

  const { customers: segmented, summary } = segmentCustomers(db.customers);

  res.json({
    message: `Successfully imported and segmented ${parsed.length} customers!`,
    summary,
    customers: segmented.slice(0, 50),
    totalImported: parsed.length
  });
});

/**
 * Reset to default rich sample customers
 */
router.post('/reset-sample', (req, res) => {
  const db = loadDB();
  // Clear and reload
  const sample = [
    { id: 'CUST-1001', name: 'Sophia Chen', email: 'sophia.chen@example.com', age: 34, income: 84000, spend: 3420, orders: 14, days_inactive: 6, open_rate: 0.72 },
    { id: 'CUST-1002', name: 'Marcus Vance', email: 'marcus.v@example.com', age: 42, income: 112000, spend: 7890, orders: 28, days_inactive: 3, open_rate: 0.85 },
    { id: 'CUST-1003', name: 'Elena Rostova', email: 'elena.rostova@example.com', age: 29, income: 62000, spend: 940, orders: 4, days_inactive: 18, open_rate: 0.54 },
    { id: 'CUST-1004', name: 'David Kim', email: 'dkim.marketing@example.com', age: 38, income: 95000, spend: 4120, orders: 18, days_inactive: 12, open_rate: 0.64 },
    { id: 'CUST-1005', name: 'Amara Okafor', email: 'amara.okafor@example.com', age: 26, income: 48000, spend: 280, orders: 1, days_inactive: 8, open_rate: 0.40 },
    { id: 'CUST-1006', name: 'Liam Gallagher', email: 'liam.g@example.com', age: 51, income: 104000, spend: 5300, orders: 21, days_inactive: 85, open_rate: 0.18 },
    { id: 'CUST-1007', name: 'Chloe Dubois', email: 'chloe.dubois@example.com', age: 31, income: 71000, spend: 1850, orders: 8, days_inactive: 24, open_rate: 0.48 },
    { id: 'CUST-1008', name: 'Javier Morales', email: 'j.morales@example.com', age: 45, income: 58000, spend: 610, orders: 3, days_inactive: 110, open_rate: 0.12 },
    { id: 'CUST-1009', name: 'Zara Patel', email: 'zara.patel@example.com', age: 24, income: 52000, spend: 320, orders: 2, days_inactive: 4, open_rate: 0.68 },
    { id: 'CUST-1010', name: 'Henrik Lindqvist', email: 'h.lindqvist@example.com', age: 49, income: 128000, spend: 9140, orders: 32, days_inactive: 5, open_rate: 0.91 },
    { id: 'CUST-1011', name: 'Fatima Al-Mansoor', email: 'fatima.m@example.com', age: 37, income: 89000, spend: 2980, orders: 11, days_inactive: 38, open_rate: 0.42 },
    { id: 'CUST-1012', name: 'Lucas Silva', email: 'lucas.silva@example.com', age: 33, income: 64000, spend: 820, orders: 5, days_inactive: 14, open_rate: 0.58 },
    { id: 'CUST-1013', name: 'Maya Lin', email: 'maya.lin@example.com', age: 28, income: 76000, spend: 2150, orders: 9, days_inactive: 9, open_rate: 0.65 },
    { id: 'CUST-1014', name: 'Noah Becker', email: 'noah.b@example.com', age: 53, income: 98000, spend: 3450, orders: 15, days_inactive: 72, open_rate: 0.22 },
    { id: 'CUST-1015', name: 'Isabella Rossi', email: 'i.rossi@example.com', age: 39, income: 83000, spend: 3100, orders: 13, days_inactive: 15, open_rate: 0.61 },
    { id: 'CUST-1016', name: 'Tariq Hassan', email: 'tariq.h@example.com', age: 44, income: 115000, spend: 6720, orders: 24, days_inactive: 4, open_rate: 0.79 },
    { id: 'CUST-1017', name: 'Olivia Martin', email: 'olivia.m@example.com', age: 27, income: 54000, spend: 390, orders: 2, days_inactive: 95, open_rate: 0.15 },
    { id: 'CUST-1018', name: 'Aiden O’Connor', email: 'aiden.oc@example.com', age: 36, income: 88000, spend: 2400, orders: 10, days_inactive: 11, open_rate: 0.55 },
    { id: 'CUST-1019', name: 'Yuki Tanaka', email: 'yuki.tanaka@example.com', age: 30, income: 92000, spend: 4600, orders: 19, days_inactive: 2, open_rate: 0.88 },
    { id: 'CUST-1020', name: 'Grace Hopper', email: 'grace.h@example.com', age: 41, income: 135000, spend: 11200, orders: 40, days_inactive: 1, open_rate: 0.96 }
  ];

  db.customers = sample;
  saveDB(db);

  const { customers: segmented, summary } = segmentCustomers(sample);
  res.json({ message: 'Reset to sample customer dataset', summary, customers: segmented });
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
CUST-105,Evan Wright,evan.wright@example.com,52,78000,1400,6,88,0.18
CUST-106,Fiona Gallagher,fiona.g@example.com,24,46000,190,1,12,0.38
CUST-107,George Bailey,g.bailey@example.com,41,64000,750,4,104,0.12
CUST-108,Hannah Abbott,hannah.a@example.com,30,88000,5200,21,3,0.84
CUST-109,Ian Malcolm,ian.malcolm@example.com,48,130000,10500,38,1,0.95
CUST-110,Julia Alvarez,julia.a@example.com,27,59000,680,3,25,0.51`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="marketing_sample_customers.csv"');
  res.send(csvContent);
});

export default router;
