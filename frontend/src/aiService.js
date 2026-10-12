const DEFAULT_BASE_URL = 'https://api.openai.com/v1'

function getConfig() {
  return {
    apiKey: import.meta.env.VITE_AI_API_KEY || '',
    baseUrl: import.meta.env.VITE_AI_API_BASE_URL || DEFAULT_BASE_URL,
    model: import.meta.env.VITE_AI_MODEL || 'gpt-4o-mini',
    provider: (import.meta.env.VITE_AI_PROVIDER || '').toLowerCase() || 'auto',
  }
}

function getProvider(baseUrl, configuredProvider) {
  const value = (baseUrl || '').toLowerCase()
  if (configuredProvider === 'gemini') return 'gemini'
  if (configuredProvider === 'openai') return 'openai'
  if (value.includes('googleapis.com') || value.includes('gemini')) return 'gemini'
  return 'openai'
}

function getNormalizedModel(model, provider) {
  if (provider === 'gemini' && !model.toLowerCase().includes('gemini')) {
    return 'gemini-2.0-flash'
  }
  return model
}

export async function askAI(prompt) {
  const { apiKey, baseUrl, model, provider } = getConfig()

  if (!apiKey || apiKey === 'PASTE_YOUR_API_KEY_HERE') {
    return 'Add a valid AI key to the project .env file to enable live responses.'
  }

  try {
    const resolvedProvider = getProvider(baseUrl, provider)
    const normalizedModel = getNormalizedModel(model, provider)

    if (resolvedProvider === 'gemini') {
      const response = await fetch(
        `${baseUrl.replace(/\/$/, '')}/models/${normalizedModel}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text:
                      'You are DMAUT AI, an expert marketing operations assistant focused on campaign optimization, segmentation, and conversion growth.',
                  },
                  { text: prompt },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 220,
            },
          }),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || 'Gemini provider returned an error')
      }

      const data = await response.json()
      return (
        data.candidates?.[0]?.content?.parts
          ?.map((part) => part.text)
          .join('')
          .trim() ||
        'The AI model responded without content. Please try another prompt.'
      )
    }

    const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: normalizedModel,
        messages: [
          {
            role: 'system',
            content:
              'You are DMAUT AI, an expert marketing operations assistant focused on campaign optimization, segmentation, and conversion growth.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 220,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(errorText || 'AI provider returned an error')
    }

    const data = await response.json()
    return (
      data.choices?.[0]?.message?.content?.trim() ||
      'The AI model responded without content. Please try another prompt.'
    )
  } catch (error) {
    console.error('AI request failed:', error)
    return 'The AI provider is unavailable right now. Please check your endpoint and API key settings.'
  }
}
