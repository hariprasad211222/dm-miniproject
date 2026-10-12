/**
 * API Service Client
 * Connects frontend to Express backend endpoints, reads configured AI keys,
 * and maintains resilience.
 */

// Helper to get stored AI config
export function getAIConfig() {
  try {
    const raw = localStorage.getItem('dmaut_ai_config');
    if (raw) return JSON.parse(raw);
  } catch {}
  return {
    provider: 'gemini',
    geminiKey: '',
    geminiModel: 'gemini-2.0-flash',
    openaiKey: '',
    openaiModel: 'gpt-4o-mini',
    groqKey: '',
    groqModel: 'llama-3.3-70b-versatile'
  };
}

export function saveAIConfig(config) {
  localStorage.setItem('dmaut_ai_config', JSON.stringify(config));
}

// 1. AI Marketing Content Generator
export async function apiGenerateContent({ type, product, audience, tone, keyBenefits, customPrompt }) {
  const config = getAIConfig();
  const apiKey = config.provider === 'gemini' ? config.geminiKey : (config.provider === 'openai' ? config.openaiKey : config.groqKey);
  const model = config.provider === 'gemini' ? config.geminiModel : (config.provider === 'openai' ? config.openaiModel : config.groqModel);

  const res = await fetch('/api/ai/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type,
      product,
      audience,
      tone,
      keyBenefits,
      customPrompt,
      provider: config.provider,
      model,
      apiKey
    })
  });

  if (!res.ok) throw new Error('Failed to generate content');
  return await res.json();
}

// 2. Campaign Manager
export async function apiGetCampaigns(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/campaigns?${query}`);
  if (!res.ok) throw new Error('Failed to fetch campaigns');
  return await res.json();
}

export async function apiCreateCampaign(data) {
  const res = await fetch('/api/campaigns', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create campaign');
  return await res.json();
}

export async function apiUpdateCampaign(id, data) {
  const res = await fetch(`/api/campaigns/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update campaign');
  return await res.json();
}

export async function apiDuplicateCampaign(id) {
  const res = await fetch(`/api/campaigns/${id}/duplicate`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to duplicate campaign');
  return await res.json();
}

export async function apiDeleteCampaign(id) {
  const res = await fetch(`/api/campaigns/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete campaign');
  return await res.json();
}

// 3. Smart Customer Segmentation
export async function apiGetSegments(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/segments?${query}`);
  if (!res.ok) throw new Error('Failed to fetch segments');
  return await res.json();
}

export async function apiUploadCustomerCSV(csvText) {
  const res = await fetch('/api/segments/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ csvText, replace: true })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errData.error || 'Failed to upload CSV');
  }
  return await res.json();
}

export async function apiResetSampleCustomers() {
  const res = await fetch('/api/segments/reset-sample', {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset sample data');
  return await res.json();
}

// 4. Marketing Automations
export async function apiGetAutomations() {
  const res = await fetch('/api/automations');
  if (!res.ok) throw new Error('Failed to fetch automations');
  return await res.json();
}

export async function apiCreateAutomation(data) {
  const res = await fetch('/api/automations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to create automation');
  return await res.json();
}

export async function apiUpdateAutomation(id, data) {
  const res = await fetch(`/api/automations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error('Failed to update automation');
  return await res.json();
}

export async function apiDeleteAutomation(id) {
  const res = await fetch(`/api/automations/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete automation');
  return await res.json();
}

export async function apiSimulateAutomations(ruleId = null) {
  const res = await fetch('/api/automations/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ruleId })
  });
  if (!res.ok) throw new Error('Simulation failed');
  return await res.json();
}

// 5. Campaign Optimization Assistant (A/B Test)
export async function apiOptimizeABTest({ versionA, versionB, metricGoal }) {
  const config = getAIConfig();
  const apiKey = config.provider === 'gemini' ? config.geminiKey : (config.provider === 'openai' ? config.openaiKey : config.groqKey);
  const model = config.provider === 'gemini' ? config.geminiModel : (config.provider === 'openai' ? config.openaiModel : config.groqModel);

  const res = await fetch('/api/ai/optimize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      versionA,
      versionB,
      metricGoal,
      provider: config.provider,
      model,
      apiKey
    })
  });
  if (!res.ok) throw new Error('Optimization failed');
  return await res.json();
}

// 6. Analytics Dashboard & AI Insights
export async function apiGetAnalytics() {
  const res = await fetch('/api/analytics');
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return await res.json();
}

export async function apiGetAIInsights(summaryMetrics, topCampaigns, segments) {
  const config = getAIConfig();
  const apiKey = config.provider === 'gemini' ? config.geminiKey : (config.provider === 'openai' ? config.openaiKey : config.groqKey);
  const model = config.provider === 'gemini' ? config.geminiModel : (config.provider === 'openai' ? config.openaiModel : config.groqModel);

  const res = await fetch('/api/ai/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      summaryMetrics,
      topCampaigns,
      segments,
      provider: config.provider,
      model,
      apiKey
    })
  });
  if (!res.ok) throw new Error('Failed to fetch AI insights');
  return await res.json();
}

export async function apiVerifyKey(provider, apiKey, model) {
  const res = await fetch('/api/ai/verify-key', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ provider, apiKey, model })
  });
  return await res.json();
}
