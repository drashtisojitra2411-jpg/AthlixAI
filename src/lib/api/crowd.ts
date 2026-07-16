import { apiRequest } from './client'

export type CrowdStatus = 'normal' | 'warning' | 'critical'
export type RiskLevel = 'Low' | 'Moderate' | 'High'

export interface CrowdPrediction {
  _id: string
  event: string
  zone: string
  capacity: number
  currentCount: number
  maxCount: number
  status: CrowdStatus
  predictedPeak?: number | null
  riskLevel: RiskLevel
  recordedAt: string
}

export function getLatestZoneSnapshots(eventId: string): Promise<{ zones: CrowdPrediction[] }> {
  return apiRequest<{ zones: CrowdPrediction[] }>(`/crowd-predictions/event/${eventId}/latest`)
}
