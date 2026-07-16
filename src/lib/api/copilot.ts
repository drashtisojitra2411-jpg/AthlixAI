import { apiRequest } from './client'

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical'

export interface CompactEventContext {
  eventName: string
  attendance: number
  crowdPercentage: number
  parkingPercentage: number
  securityAlerts: number
  medicalAlerts: number
  weather: string
  currentTime: string
}

export interface CopilotActionCard {
  riskLevel: RiskLevel
  topActions: string[]
  expectedImpact: string
  confidence: number
}

export interface CopilotAskResult {
  summary: string
  insights: string[]
  risks: string[]
  riskLevel: RiskLevel
  actionCard: CopilotActionCard
}

export interface CopilotAskOutcome {
  context: CompactEventContext
  response: CopilotAskResult
}

export function askCopilot(eventId: string, prompt: string, weather?: string): Promise<CopilotAskOutcome> {
  return apiRequest<CopilotAskOutcome>('/copilot/ask', {
    method: 'POST',
    body: { eventId, prompt, weather },
  })
}
