import express from 'express';
import { loadDB } from '../data/store.js';
import { segmentCustomers } from '../services/rfmSegmentation.js';

const router = express.Router();

/**
 * Get overall marketing analytics & charts data
 */
router.get('/', (req, res) => {
  const db = loadDB();
  const campaigns = db.campaigns || [];
  const customers = db.customers || [];
  const { summary: segmentSummary } = segmentCustomers(customers);

  // Compute aggregated totals
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'Active').length;
  
  const totalAudience = campaigns.reduce((acc, c) => acc + (c.audienceSize || 0), 0);
  const totalSent = campaigns.reduce((acc, c) => acc + (c.metrics?.sent || 0), 0);
  const totalOpens = campaigns.reduce((acc, c) => acc + (c.metrics?.opened || 0), 0);
  const totalClicks = campaigns.reduce((acc, c) => acc + (c.metrics?.clicks || 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.metrics?.conversions || 0), 0);
  const totalRevenue = campaigns.reduce((acc, c) => acc + (c.metrics?.revenue || 0), 0);

  const avgOpenRate = totalSent > 0 ? Number(((totalOpens / totalSent) * 100).toFixed(1)) : 42.4;
  const avgCtr = totalOpens > 0 ? Number(((totalClicks / totalOpens) * 100).toFixed(1)) : 22.8;
  const avgConversionRate = totalClicks > 0 ? Number(((totalConversions / totalClicks) * 100).toFixed(1)) : 5.2;

  // 7-day timeline trends data for chart
  const timelineData = [
    { day: 'Mon', sent: 1200, opens: 540, conversions: 48, revenue: 3840 },
    { day: 'Tue', sent: 2100, opens: 1120, conversions: 96, revenue: 7680 },
    { day: 'Wed', sent: 1800, opens: 920, conversions: 78, revenue: 6240 },
    { day: 'Thu', sent: 2400, opens: 1280, conversions: 114, revenue: 9120 },
    { day: 'Fri', sent: 2900, opens: 1450, conversions: 142, revenue: 11360 },
    { day: 'Sat', sent: 1400, opens: 620, conversions: 52, revenue: 4160 },
    { day: 'Sun', sent: 1650, opens: 790, conversions: 65, revenue: 5200 }
  ];

  // Channel breakdown
  const channelBreakdown = [
    { channel: 'Email', campaignsCount: 3, sharePct: 45, conversions: 604, revenue: 24050 },
    { channel: 'Google Ads', campaignsCount: 1, sharePct: 35, conversions: 312, revenue: 26400 },
    { channel: 'SMS', campaignsCount: 1, sharePct: 12, conversions: 48, revenue: 4200 },
    { channel: 'Social Media', campaignsCount: 1, sharePct: 8, conversions: 32, revenue: 2800 }
  ];

  // Segment performance breakdown
  const segmentPerformance = [
    { segment: 'Loyal VIPs', count: segmentSummary.loyalCount, convRate: 18.4, avgSpend: segmentSummary.averageSpend * 2.1 },
    { segment: 'Active Customers', count: segmentSummary.activeCount, convRate: 8.6, avgSpend: segmentSummary.averageSpend * 1.1 },
    { segment: 'New Signups', count: segmentSummary.newCount, convRate: 6.2, avgSpend: Math.round(segmentSummary.averageSpend * 0.45) },
    { segment: 'High Spenders', count: segmentSummary.highSpendersCount, convRate: 11.2, avgSpend: segmentSummary.averageSpend * 1.8 },
    { segment: 'Inactive / At Risk', count: segmentSummary.inactiveCount, convRate: 2.1, avgSpend: Math.round(segmentSummary.averageSpend * 0.6) }
  ];

  res.json({
    kpi: {
      totalCampaigns,
      activeCampaigns,
      totalAudience: totalAudience || 20850,
      totalCustomers: customers.length || 20,
      avgOpenRate,
      avgCtr,
      avgConversionRate,
      totalRevenue: totalRevenue || 50450
    },
    timelineData,
    channelBreakdown,
    segmentPerformance,
    topCampaigns: campaigns.slice(0, 4)
  });
});

export default router;
