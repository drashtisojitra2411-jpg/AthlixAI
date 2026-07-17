export type DemoStageId = 'overview' | 'congestion' | 'prediction' | 'emergency' | 'recommendation'

export interface DemoStage {
  id: DemoStageId
  label: string
  narration: string
  durationMs: number
}

/** Total runtime ~76s — fits the 60-90s guided-demo window. */
export const DEMO_SCRIPT: DemoStage[] = [
  {
    id: 'overview',
    label: 'Live Event Overview',
    narration:
      'ATHLIX monitors this event live — attendance, parking, and emergency status all update in real time.',
    durationMs: 12_000,
  },
  {
    id: 'congestion',
    label: 'Crowd Congestion Detected',
    narration:
      'The stadium heatmap flags rising occupancy in one region the moment it happens.',
    durationMs: 16_000,
  },
  {
    id: 'prediction',
    label: 'AI Predicts Escalation',
    narration:
      'Predictive Operations simulates the next stretch of the event and forecasts where congestion is headed.',
    durationMs: 18_000,
  },
  {
    id: 'emergency',
    label: 'Emergency Triggered',
    narration:
      'Congestion escalates into a live incident — the Emergency Command Center picks it up immediately.',
    durationMs: 14_000,
  },
  {
    id: 'recommendation',
    label: 'AI Response Recommendation',
    narration:
      'Athlix AI recommends a full response plan in seconds — severity, actions, priority, and confidence.',
    durationMs: 16_000,
  },
]

/** Used only when live data has no region with elevated-or-worse occupancy to highlight. */
export const DEMO_FALLBACK_REGION_ID = 'north-stand'
