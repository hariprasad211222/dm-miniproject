import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'db.json');

// Initial seed data generator
function getInitialSeed() {
  const sampleCustomers = [
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

  return {
    users: [
      {
        id: 'usr-1',
        name: 'Demo Admin',
        email: 'admin@marketing.ai',
        password: 'password123',
        role: 'Admin',
        createdAt: new Date().toISOString()
      },
      {
        id: 'usr-2',
        name: 'Marketing Lead',
        email: 'marketer@company.com',
        password: 'password123',
        role: 'Campaign Specialist',
        createdAt: new Date().toISOString()
      }
    ],
    campaigns: [
      {
        id: 'cmp-101',
        title: 'Spring Product Launch 2026',
        channel: 'Email',
        status: 'Active',
        targetSegment: 'Loyal VIPs',
        subjectLine: 'Exclusive First Access: Meet the Future of Workspace Tech',
        content: "Hey {{first_name}},\n\nAs one of our most valued members, you get 48 hours early access to our Spring 2026 Collection before the public announcement.\n\nUse code VIPSPRING for 25% off during this private window.\n\nDiscover the collection: https://brand.com/vip-spring",
        scheduledDate: '2026-10-15T09:00:00Z',
        audienceSize: 2450,
        budget: 1500,
        metrics: { sent: 2450, opened: 1540, clicks: 680, conversions: 184, revenue: 14250 },
        createdAt: '2026-10-01T12:00:00Z'
      },
      {
        id: 'cmp-102',
        title: 'Win-Back Re-engagement Series',
        channel: 'Email',
        status: 'Scheduled',
        targetSegment: 'Inactive / At Risk',
        subjectLine: 'We noticed you’ve been quiet — here’s $20 on us',
        content: "Hi {{first_name}},\n\nIt’s been a while since your last visit. We’ve added over 40 new updates that we know you’ll love.\n\nTo welcome you back, here is a $20 credit valid on any order over $60: WELCOMEBACK20.\n\nShop now: https://brand.com/back",
        scheduledDate: '2026-10-18T14:30:00Z',
        audienceSize: 1820,
        budget: 950,
        metrics: { sent: 0, opened: 0, clicks: 0, conversions: 0, revenue: 0 },
        createdAt: '2026-10-05T10:00:00Z'
      },
      {
        id: 'cmp-103',
        title: 'Q4 High-Intent Retargeting Ads',
        channel: 'Google Ads',
        status: 'Active',
        targetSegment: 'Active Customers',
        subjectLine: 'Supercharge Your Workflow in 1 Click',
        content: "Headline: Work Smarter, Not Harder | AI-Powered Automation\nDescription: Automate your tedious marketing tasks with precision. Start your 14-day free trial today.",
        scheduledDate: '2026-10-08T08:00:00Z',
        audienceSize: 12400,
        budget: 3200,
        metrics: { sent: 12400, opened: 5200, clicks: 1840, conversions: 312, revenue: 26400 },
        createdAt: '2026-10-02T15:20:00Z'
      },
      {
        id: 'cmp-104',
        title: 'Welcome Onboarding Sequence',
        channel: 'Email',
        status: 'Active',
        targetSegment: 'New Signups',
        subjectLine: 'Welcome aboard! Here are 3 quick tips to get started',
        content: "Welcome to the family!\n\nHere are 3 quick shortcuts to start hitting your goals faster:\n1. Connect your customer data\n2. Run your first automated content test\n3. Launch your first scheduled blast\n\nLet’s build something great together.",
        scheduledDate: '2026-10-01T00:00:00Z',
        audienceSize: 3100,
        budget: 400,
        metrics: { sent: 3100, opened: 2480, clicks: 1240, conversions: 420, revenue: 9800 },
        createdAt: '2026-09-28T09:15:00Z'
      },
      {
        id: 'cmp-105',
        title: 'Black Friday VIP Flash Teaser',
        channel: 'SMS',
        status: 'Draft',
        targetSegment: 'Loyal VIPs',
        subjectLine: 'SMS: Early Bird BF Deals',
        content: "VIP ALERT: Our biggest sale of the year unlocks in 3 days. Text PASS to unlock your secret link before anyone else.",
        scheduledDate: '2026-11-20T11:00:00Z',
        audienceSize: 850,
        budget: 300,
        metrics: { sent: 0, opened: 0, clicks: 0, conversions: 0, revenue: 0 },
        createdAt: '2026-10-10T16:45:00Z'
      }
    ],
    customers: sampleCustomers,
    automations: [
      {
        id: 'auto-1',
        name: 'Instant Welcome Sequence',
        trigger: 'Customer Signs Up',
        triggerCondition: 'Immediate',
        action: 'Send Welcome Email + 10% Discount Code',
        channel: 'Email',
        isActive: true,
        stats: { triggeredCount: 428, executionSuccess: 428, lastFired: '2026-10-12T16:20:00Z' },
        createdAt: '2026-09-15T11:00:00Z'
      },
      {
        id: 'auto-2',
        name: 'Inactive Customer Re-Engagement',
        trigger: 'Customer Inactive > 45 Days',
        triggerCondition: 'Days Inactive >= 45 and Past Spend > $500',
        action: 'Prepare Win-Back Email with $25 Credit',
        channel: 'Email',
        isActive: true,
        stats: { triggeredCount: 164, executionSuccess: 161, lastFired: '2026-10-11T09:40:00Z' },
        createdAt: '2026-09-18T14:30:00Z'
      },
      {
        id: 'auto-3',
        name: 'High-Value VIP Reward',
        trigger: 'Total Spend Crosses $5,000',
        triggerCondition: 'Spend >= 5000',
        action: 'Assign VIP Tag + Trigger Personal Account Manager Email',
        channel: 'Email',
        isActive: true,
        stats: { triggeredCount: 52, executionSuccess: 52, lastFired: '2026-10-10T18:12:00Z' },
        createdAt: '2026-09-20T10:00:00Z'
      },
      {
        id: 'auto-4',
        name: 'Abandoned Cart Follow-Up',
        trigger: 'Checkout Abandoned > 2 Hours',
        triggerCondition: 'Cart Value > $50',
        action: 'Send Dynamic SMS Reminder with Cart Recovery Link',
        channel: 'SMS',
        isActive: false,
        stats: { triggeredCount: 290, executionSuccess: 288, lastFired: '2026-10-09T12:00:00Z' },
        createdAt: '2026-09-25T15:10:00Z'
      }
    ],
    abTests: [
      {
        id: 'ab-1',
        title: 'Holiday Promo: Urgency vs Social Proof',
        versionA: {
          name: 'Version A (Urgency)',
          subject: '⚡ Last chance: 48 Hours left to claim 30% off',
          headline: 'Clock is Ticking: Don’t Miss Out',
          cta: 'Claim 30% Off Now',
          tone: 'Urgent / FOMO',
          metrics: { sent: 5000, opens: 1850, clicks: 620, conversions: 110, openRate: 37.0, ctr: 33.5, convRate: 17.7 }
        },
        versionB: {
          name: 'Version B (Social Proof)',
          subject: '⭐ Why 10,000+ top marketers trust this platform',
          headline: 'Join Thousands of High-Growth Teams',
          cta: 'See Customer Stories & Get Started',
          tone: 'Trust / Social Proof',
          metrics: { sent: 5000, opens: 2350, clicks: 910, conversions: 195, openRate: 47.0, ctr: 38.7, convRate: 21.4 }
        },
        analysis: {
          recommendedWinner: 'Version B (Social Proof)',
          confidenceScore: 94,
          liftPercentage: '+34.5% Conversion Lift',
          summary: 'Version B achieved a significantly higher Open Rate (+10.0%) and Conversion Rate (+3.7%), demonstrating that credibility and peer validation outperform manufactured urgency for mid-to-high ticket audiences.',
          frictionPointsA: ['Subject line urgency triggered spam filtering in 4.2% of inboxes', 'Aggressive CTA created hesitation for new users'],
          keySuccessFactorsB: ['High emotional resonance with peer trust', 'Curiosity-driven hook generated superior click-through'],
          actionableRecommendations: [
            'Adopt social proof frameworks for cold and mid-funnel prospect campaigns.',
            'Reserve countdown urgency exclusively for final 12-hour closing sequences.',
            'Incorporate real customer testimonial snippets directly below the primary CTA button.'
          ]
        }
      }
    ],
    automationLogs: [
      { id: 'log-1', timestamp: '2026-10-12T16:20:00Z', ruleName: 'Instant Welcome Sequence', customer: 'Zara Patel', action: 'Sent Welcome Email with code WELCOME10', status: 'Delivered' },
      { id: 'log-2', timestamp: '2026-10-12T14:15:00Z', ruleName: 'Inactive Customer Re-Engagement', customer: 'Javier Morales', action: 'Queued $25 Credit Win-Back Email', status: 'Queued' },
      { id: 'log-3', timestamp: '2026-10-12T11:05:00Z', ruleName: 'High-Value VIP Reward', customer: 'Henrik Lindqvist', action: 'Assigned VIP Tier Tag & Notified Rep', status: 'Executed' }
    ]
  };
}

// Load data or initialize
export function loadDB() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const initial = getInitialSeed();
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error loading DB file, fallback to initial seed:', err);
    return getInitialSeed();
  }
}

// Save data
export function saveDB(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error saving DB file:', err);
    return false;
  }
}
