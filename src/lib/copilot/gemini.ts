import { copilotResponseSchema, transformCopilotResponse } from './schema'
import type { CopilotInsightCardProps } from './schema'

const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent'

export const isGeminiConfigured = Boolean(import.meta.env.VITE_GEMINI_API_KEY)

export async function askCopilot(prompt: string): Promise<CopilotInsightCardProps> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('Gemini API key is not configured. Set VITE_GEMINI_API_KEY in your .env file.')
  }

  const systemInstruction = `You are Athlix Copilot, an intelligent decision-making partner for stadium and tournament operations.
Always respond with valid JSON matching this schema:
{
  "recommendation": "single actionable headline",
  "prediction": "optional future-state forecast with timeframe",
  "summary": "1-line contextual overview",
  "confidence": 0-100,
  "reasoning": "2-3 sentences explaining WHY",
  "suggestedActions": [{ "label": "string", "action": "string", "variant": "primary|secondary|ghost" }]
}
Never use markdown. Never include raw analysis outside the JSON structure.`

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Gemini API error: ${response.status} — ${error}`)
  }

  const data = await response.json()
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!rawText) {
    throw new Error('Empty response from Gemini API')
  }

  const parsed = copilotResponseSchema.parse(JSON.parse(rawText))
  return transformCopilotResponse(parsed)
}
