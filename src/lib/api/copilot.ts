import { apiRequest } from './client'

export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical'

export interface CompactEventContext {
  eventName: string
  eventStatus: string
  attendance: number
  capacity: number
  crowdPercentage: number
  weather: string
  currentTime: string
  tickets: {
    totalSeats: number
    seatsBooked: number
    seatsAvailable: number
    occupancyPercentage: number
    averageTicketPrice: number
  }
  parking: {
    capacity: number
    occupied: number
    occupancyPercentage: number
    lotsAvailable: number
    lotsWarning: number
    lotsFull: number
  }
  revenue: {
    ticketRevenue: number
    expectedRevenue: number
    foodOrders: number
    merchandiseSales: number
  }
  emergency: {
    activeCount: number
    resolvedCount: number
    securityAlerts: number
    medicalAlerts: number
    breachedSlaCount: number
    activeIncidents: Array<{
      type: string
      severity: string
      location: string
      minutesElapsed: number
    }>
  }
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

/* ============================================================
 * Visitor AI Assistant — pure additions below this line.
 * Nothing above is modified. VisitorEventContext deliberately carries no
 * revenue or security/medical data — see backend/src/services/gemini.ts.
 * ============================================================ */

export interface VisitorEventContext {
  eventName: string
  eventStatus: string
  venue: string
  startDate: string
  endDate: string
  weather: string
  crowdPercentage: number
  parking: {
    occupancyPercentage: number
    recommendedLot: string | null
    walkingMinutes: number | null
  }
  foodCourt: {
    demandLevel: 'Low' | 'Moderate' | 'High'
  }
}

export interface VisitorAskResult {
  answer: string
  tips: string[]
}

export interface VisitorCopilotAskOutcome {
  context: VisitorEventContext
  response: VisitorAskResult
}

export function askVisitorCopilot(eventId: string, prompt: string): Promise<VisitorCopilotAskOutcome> {
  return apiRequest<VisitorCopilotAskOutcome>('/copilot/visitor/ask', {
    method: 'POST',
    body: { eventId, prompt },
  })
}
