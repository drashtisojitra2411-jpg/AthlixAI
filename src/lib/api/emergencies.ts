import { apiRequest } from './client'
import type { PaginatedResult } from './types'

export type EmergencyType =
  | 'medical'
  | 'fire'
  | 'lost-child'
  | 'security'
  | 'crowd-surge'
  | 'gate-blockage'
  | 'weather-alert'
export type EmergencyStatus = 'reported' | 'dispatched' | 'in-progress' | 'resolved'
export type EmergencySeverity = 'low' | 'medium' | 'high' | 'critical'
export type RiskLevel = 'Low' | 'Moderate' | 'High' | 'Critical'
export type DeploymentPriority = 'Low' | 'Medium' | 'High' | 'Immediate'

export interface EmergencyReport {
  _id: string
  event: string
  reportedBy?: string | null
  type: EmergencyType
  description?: string | null
  location?: string | null
  status: EmergencyStatus
  severity: EmergencySeverity
  resolvedAt?: string | null
  createdAt: string
  updatedAt: string
}

export interface EventEmergencySummary {
  event: string
  totalActive: number
  totalResolved: number
  severityBreakdown: Record<EmergencySeverity, number>
  typeBreakdown: Record<EmergencyType, number>
  breachedSlaCount: number
  activeReports: EmergencyReport[]
}

export interface EmergencyAiRecommendation {
  incidentSummary: string
  severity: RiskLevel
  recommendedActions: string[]
  deploymentPriority: DeploymentPriority
  estimatedResolutionMinutes: number
  confidence: number
}

export interface ReportEmergencyInput {
  event: string
  type: EmergencyType
  description?: string
  location?: string
  severity?: EmergencySeverity
}

export interface EmergencyReportFilters {
  status?: EmergencyStatus
  type?: EmergencyType
  severity?: EmergencySeverity
}

export function getEventEmergencySummary(
  eventId: string,
): Promise<{ summary: EventEmergencySummary }> {
  return apiRequest<{ summary: EventEmergencySummary }>(
    `/emergencies/event/${eventId}/summary`,
  )
}

export function listEmergencyReportsByEvent(
  eventId: string,
  filters: EmergencyReportFilters = {},
): Promise<PaginatedResult<EmergencyReport>> {
  return apiRequest<PaginatedResult<EmergencyReport>>(`/emergencies/event/${eventId}`, {
    query: { limit: 50, ...filters },
  })
}

export function listActiveEmergencies(eventId: string): Promise<{ reports: EmergencyReport[] }> {
  return apiRequest<{ reports: EmergencyReport[] }>(`/emergencies/event/${eventId}/active`)
}

export function reportEmergency(input: ReportEmergencyInput): Promise<{ report: EmergencyReport }> {
  return apiRequest<{ report: EmergencyReport }>('/emergencies', {
    method: 'POST',
    body: input,
  })
}

export function updateEmergencyStatus(
  id: string,
  status: EmergencyStatus,
): Promise<{ report: EmergencyReport }> {
  return apiRequest<{ report: EmergencyReport }>(`/emergencies/${id}/status`, {
    method: 'PATCH',
    body: { status },
  })
}

export function getEmergencyAiRecommendation(
  id: string,
): Promise<{ recommendation: EmergencyAiRecommendation }> {
  return apiRequest<{ recommendation: EmergencyAiRecommendation }>(
    `/emergencies/${id}/ai-recommendation`,
    { method: 'POST' },
  )
}

export interface DemoEmergencyScenario {
  eventId: string
  type: EmergencyType
  severity: EmergencySeverity
  location?: string
  description?: string
}

/**
 * Presentation Mode only. Generates a real AI recommendation for a scripted
 * incident that is never written to the database — see
 * backend/src/services/emergency.service.ts#getDemoEmergencyAiRecommendation.
 */
export function getDemoEmergencyAiRecommendation(
  scenario: DemoEmergencyScenario,
): Promise<{ recommendation: EmergencyAiRecommendation }> {
  return apiRequest<{ recommendation: EmergencyAiRecommendation }>(
    '/emergencies/demo/ai-recommendation',
    { method: 'POST', body: scenario },
  )
}
