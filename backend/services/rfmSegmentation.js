/**
 * Smart Customer Segmentation Algorithm (RFM + Behavioral Clustering)
 * Segments users into:
 *  - Loyal VIPs
 *  - Active Customers
 *  - New Signups
 *  - Inactive / At Risk
 *  - High Spenders
 */

export function segmentCustomers(customersList) {
  if (!Array.isArray(customersList) || customersList.length === 0) {
    return {
      customers: [],
      summary: {
        total: 0,
        loyalCount: 0,
        activeCount: 0,
        newCount: 0,
        inactiveCount: 0,
        highSpendersCount: 0
      }
    };
  }

  // Calculate statistics for dynamic thresholds
  const spends = customersList.map(c => Number(c.spend || c.past_spend || 0));
  const avgSpend = spends.reduce((a, b) => a + b, 0) / spends.length || 1000;
  const highSpendThreshold = Math.max(avgSpend * 1.5, 3000);

  const segmented = customersList.map((customer, index) => {
    const spend = Number(customer.spend ?? customer.past_spend ?? 0);
    const orders = Number(customer.orders ?? customer.purchases ?? customer.website_visits ?? 1);
    const daysInactive = Number(customer.days_inactive ?? customer.days_since_last_purchase ?? 0);
    const openRate = Number(customer.open_rate ?? customer.email_open_rate ?? 0.3);

    let segment = 'Active Customers';
    let segmentColor = 'emerald';
    let rfmScore = 0;

    // RFM calculation logic
    if (daysInactive >= 60) {
      segment = 'Inactive / At Risk';
      segmentColor = 'rose';
      rfmScore = spend > highSpendThreshold ? 45 : 25;
    } else if (spend >= highSpendThreshold && orders >= 5) {
      segment = 'Loyal VIPs';
      segmentColor = 'purple';
      rfmScore = 95;
    } else if (orders <= 2 && daysInactive <= 30) {
      segment = 'New Signups';
      segmentColor = 'blue';
      rfmScore = 65;
    } else if (spend >= highSpendThreshold) {
      segment = 'High Spenders';
      segmentColor = 'amber';
      rfmScore = 80;
    } else {
      segment = 'Active Customers';
      segmentColor = 'emerald';
      rfmScore = 70;
    }

    return {
      id: customer.id || customer.customer_id || `CUST-${1000 + index}`,
      name: customer.name || `Customer #${index + 1}`,
      email: customer.email || `customer${index + 1}@example.com`,
      age: customer.age ? Number(customer.age) : 32,
      income: customer.income ? Number(customer.income) : Math.round(spend * 15),
      spend: Math.round(spend),
      orders: orders,
      days_inactive: daysInactive,
      open_rate: Number(openRate.toFixed(2)),
      segment: segment,
      segmentColor: segmentColor,
      rfmScore: rfmScore
    };
  });

  const summary = {
    total: segmented.length,
    loyalCount: segmented.filter(c => c.segment === 'Loyal VIPs').length,
    activeCount: segmented.filter(c => c.segment === 'Active Customers').length,
    newCount: segmented.filter(c => c.segment === 'New Signups').length,
    inactiveCount: segmented.filter(c => c.segment === 'Inactive / At Risk').length,
    highSpendersCount: segmented.filter(c => c.segment === 'High Spenders').length,
    averageSpend: Math.round(segmented.reduce((acc, c) => acc + c.spend, 0) / (segmented.length || 1)),
    averageOpenRate: Number((segmented.reduce((acc, c) => acc + c.open_rate, 0) / (segmented.length || 1)).toFixed(2))
  };

  return { customers: segmented, summary };
}

/**
 * Parses raw CSV text into customer objects
 */
export function parseCSV(csvText) {
  if (!csvText || typeof csvText !== 'string') return [];
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
  const rows = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
    const obj = {};
    headers.forEach((header, idx) => {
      obj[header] = values[idx] || '';
    });
    rows.push(obj);
  }

  return rows;
}
