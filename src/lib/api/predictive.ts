import { apiRequest } from './client'
import type { CompactEventContext, RiskLevel } from './copilot'

export type MatchImportance = 'Low' | 'Medium' | 'High' | 'Critical'

export interface PredictiveControls {
  attendanceChangePercent: number
  weather: string
  matchImportance: MatchImportance
  openGates: number
  parkingAvailabilityPercent: number
  securityStaffCount: number
  medicalStaffCount: number
}

export interface StandRegionRef {
  id: string
  label: string
}

export interface CrowdShiftEntry {
  regionId: string
  predictedOccupancy: number
}

export type PredictionTimelineStage = 'Before Event' | 'Peak Entry' | 'Mid Match' | 'Exit'

export interface PredictionTimelineEntry {
  time: PredictionTimelineStage
  occupancyLevel: number
  riskLevel: RiskLevel
}

export interface PredictionResult {
  summary: string
  predictedAttendance: number
  crowdShift: CrowdShiftEntry[]
  predictionTimeline: PredictionTimelineEntry[]
  parkingRisk: RiskLevel
  queuePrediction: { riskLevel: RiskLevel; estimate: string }
  securityRisk: RiskLevel
  medicalRisk: RiskLevel
  recommendedActions: string[]
  confidenceFactors: string[]
  confidence: number
}

export interface RunPredictionOutcome {
  context: CompactEventContext
  controls: PredictiveControls
  prediction: PredictionResult
}

export function runPrediction(
  eventId: string,
  controls: PredictiveControls,
  standRegions: StandRegionRef[],
): Promise<RunPredictionOutcome> {
  return apiRequest<RunPredictionOutcome>('/predictive/run', {
    method: 'POST',
    body: { eventId, controls, standRegions },
  })
}
