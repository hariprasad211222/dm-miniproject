/**
 * API Service Client
 * Includes user session token authorization, client identity headers for auto-healing,
 * and descriptive error handling.
 */

export function getStoredToken() {
  try {
    const raw = localStorage.getItem('dmaut_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || '';
    }
  } catch {}
  return '';
}

function getAuthHeaders() {
  const token = getStoredToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    const raw = localStorage.getItem('dmaut_auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.user) {
        headers['X-User-Name'] = encodeURIComponent(parsed.user.name || '');
        headers['X-User-Email'] = parsed.user.email || '';
        headers['X-User-Tier'] = parsed.user.accountType || 'business';
        headers['X-User-Id'] = parsed.user.id || '';
      }
    }
  } catch {}
  return headers;
}

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
    headers: getAuthHeaders(),
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

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to generate content');
  }
  return await res.json();
}

// 2. Campaign Manager
export async function apiGetCampaigns(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/campaigns?${query}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch campaigns');
  }
  return await res.json();
}

export async function apiCreateCampaign(data) {
  const res = await fetch('/api/campaigns', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create campaign');
  }
  return await res.json();
}

export async function apiUpdateCampaign(id, data) {
  const res = await fetch(`/api/campaigns/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update campaign');
  }
  return await res.json();
}

export async function apiDuplicateCampaign(id) {
  const res = await fetch(`/api/campaigns/${id}/duplicate`, {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to duplicate campaign');
  }
  return await res.json();
}

export async function apiDeleteCampaign(id) {
  const res = await fetch(`/api/campaigns/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete campaign');
  }
  return await res.json();
}

export async function apiLoadStarterCampaigns() {
  const res = await fetch('/api/campaigns/load-starter', {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load starter campaigns');
  }
  return await res.json();
}

// 3. Smart Customer Segmentation
export async function apiGetSegments(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/segments?${query}`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch segments');
  }
  return await res.json();
}

export async function apiUploadCustomerCSV(csvText) {
  const res = await fetch('/api/segments/upload', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ csvText, replace: true })
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || 'Failed to upload CSV');
  }
  return await res.json();
}

export async function apiResetSampleCustomers() {
  const res = await fetch('/api/segments/reset-sample', {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load sample data');
  }
  return await res.json();
}

export async function apiClearCustomers() {
  const res = await fetch('/api/segments/clear', {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to clear customer data');
  }
  return await res.json();
}

// 4. Marketing Automations
export async function apiGetAutomations() {
  const res = await fetch('/api/automations', {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch automations');
  }
  return await res.json();
}

export async function apiCreateAutomation(data) {
  const res = await fetch('/api/automations', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to create automation');
  }
  return await res.json();
}

export async function apiUpdateAutomation(id, data) {
  const res = await fetch(`/api/automations/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update automation');
  }
  return await res.json();
}

export async function apiDeleteAutomation(id) {
  const res = await fetch(`/api/automations/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete automation');
  }
  return await res.json();
}

export async function apiSimulateAutomations(ruleId = null) {
  const res = await fetch('/api/automations/simulate', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ ruleId })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Simulation failed');
  }
  return await res.json();
}

export async function apiLoadStarterAutomations() {
  const res = await fetch('/api/automations/load-starter', {
    method: 'POST',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to load starter automations');
  }
  return await res.json();
}

// 5. Campaign Optimization Assistant (A/B Test)
export async function apiOptimizeABTest({ versionA, versionB, metricGoal }) {
  const config = getAIConfig();
  const apiKey = config.provider === 'gemini' ? config.geminiKey : (config.provider === 'openai' ? config.openaiKey : config.groqKey);
  const model = config.provider === 'gemini' ? config.geminiModel : (config.provider === 'openai' ? config.openaiModel : config.groqModel);

  const res = await fetch('/api/ai/optimize', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      versionA,
      versionB,
      metricGoal,
      provider: config.provider,
      model,
      apiKey
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Optimization failed');
  }
  return await res.json();
}

// 6. Analytics Dashboard & AI Insights
export async function apiGetAnalytics() {
  const res = await fetch('/api/analytics', {
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch analytics');
  }
  return await res.json();
}

export async function apiGetAIInsights(summaryMetrics, topCampaigns, segments) {
  const config = getAIConfig();
  const apiKey = config.provider === 'gemini' ? config.geminiKey : (config.provider === 'openai' ? config.openaiKey : config.groqKey);
  const model = config.provider === 'gemini' ? config.geminiModel : (config.provider === 'openai' ? config.openaiModel : config.groqModel);

  const res = await fetch('/api/ai/insights', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      summaryMetrics,
      topCampaigns,
      segments,
      provider: config.provider,
      model,
      apiKey
    })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to fetch AI insights');
  }
  return await res.json();
}

export async function apiVerifyKey(provider, apiKey, model) {
  const res = await fetch('/api/ai/verify-key', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ provider, apiKey, model })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Key verification failed');
  }
  return await res.json();
}

// 7. Profile & Account Management
export async function apiUpdateProfile({ name, email }) {
  const res = await fetch('/api/auth/profile', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ name, email })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update profile');
  }
  return await res.json();
}

export async function apiChangePassword({ currentPassword, newPassword }) {
  const res = await fetch('/api/auth/password', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ currentPassword, newPassword })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to change password');
  }
  return await res.json();
}

export async function apiSwitchAccountType(accountType) {
  const res = await fetch('/api/auth/account-type', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ accountType })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to switch account type');
  }
  return await res.json();
}

export async function apiUpdateSettings(settings) {
  const res = await fetch('/api/auth/settings', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(settings)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to update settings');
  }
  return await res.json();
}

export async function apiDeleteAccount() {
  const res = await fetch('/api/auth/account', {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || 'Failed to delete account');
  }
  return await res.json();
}
