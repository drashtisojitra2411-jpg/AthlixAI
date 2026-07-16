import { apiRequest } from './client'

export type EmergencyType = 'medical' | 'fire' | 'lost-child' | 'security'
export type EmergencyStatus = 'reported' | 'dispatched' | 'in-progress' | 'resolved'
export type EmergencySeverity = 'low' | 'medium' | 'high' | 'critical'

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

export function getEventEmergencySummary(
  eventId: string,
): Promise<{ summary: EventEmergencySummary }> {
  return apiRequest<{ summary: EventEmergencySummary }>(
    `/emergencies/event/${eventId}/summary`,
  )
}
