import express from 'express';
import { generateContent, optimizeCampaignAB, generateAnalyticsInsights } from '../services/aiProvider.js';

const router = express.Router();

/**
 * FEATURE 1: AI Marketing Content Generator
 */
router.post('/generate', async (req, res) => {
  try {
    const { type, product, audience, tone, keyBenefits, customPrompt, provider, model, apiKey } = req.body;
    const result = await generateContent({
      type,
      product,
      audience,
      tone,
      keyBenefits,
      customPrompt,
      provider: provider || 'gemini',
      model,
      apiKey
    });
    res.json(result);
  } catch (err) {
    console.error('Error generating content:', err);
    res.status(500).json({ error: err.message || 'Generation failed' });
  }
});

/**
 * FEATURE 5: Campaign Optimization Assistant (A/B Test)
 */
router.post('/optimize', async (req, res) => {
  try {
    const { versionA, versionB, metricGoal, provider, model, apiKey } = req.body;
    if (!versionA || !versionB) {
      return res.status(400).json({ error: 'Both versionA and versionB are required' });
    }

    const result = await optimizeCampaignAB({
      versionA,
      versionB,
      metricGoal: metricGoal || 'Conversion Rate',
      provider: provider || 'gemini',
      model,
      apiKey
    });
    res.json(result);
  } catch (err) {
    console.error('Error optimizing campaign:', err);
    res.status(500).json({ error: err.message || 'Optimization analysis failed' });
  }
});

/**
 * FEATURE 6: Analytics Dashboard AI Insights
 */
router.post('/insights', async (req, res) => {
  try {
    const { summaryMetrics, topCampaigns, segments, provider, model, apiKey } = req.body;
    const result = await generateAnalyticsInsights({
      summaryMetrics: summaryMetrics || {},
      topCampaigns: topCampaigns || [],
      segments: segments || [],
      provider: provider || 'gemini',
      model,
      apiKey
    });
    res.json(result);
  } catch (err) {
    console.error('Error generating insights:', err);
    res.status(500).json({ error: err.message || 'Insights generation failed' });
  }
});

/**
 * Verify / Test AI connection with API Key
 */
router.post('/verify-key', async (req, res) => {
  try {
    const { provider, apiKey, model } = req.body;
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }

    const testPrompt = 'Respond with "Connection Successful" if you receive this message.';
    const result = await generateContent({
      type: 'headlines',
      product: 'Connection Test',
      audience: 'Developer',
      tone: 'Professional',
      provider: provider || 'gemini',
      model: model || 'gemini-2.0-flash',
      apiKey
    });

    if (result.isFallback) {
      return res.status(400).json({
        valid: false,
        message: 'Could not connect with provided credentials. Please double check your API key.'
      });
    }

    res.json({
      valid: true,
      provider: result.provider,
      model: result.model,
      message: 'Connection verified successfully!'
    });
  } catch (err) {
    res.status(400).json({ valid: false, message: err.message });
  }
});

export default router;
