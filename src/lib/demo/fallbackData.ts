import type { EmergencyAiRecommendation } from '@/lib/api/emergencies'
import type { PredictionResult } from '@/lib/api/predictive'
import { DEMO_FALLBACK_REGION_ID } from './script'

/** Shown only if the live Predictive Operations call times out or errors. */
export const FALLBACK_PREDICTION: PredictionResult = {
  summary:
    'Congestion is projected to intensify over the next 20-30 minutes as inflow continues, with the highlighted stand approaching critical density before easing after kickoff.',
  predictedAttendance: 42_000,
  crowdShift: [
    { regionId: DEMO_FALLBACK_REGION_ID, predictedOccupancy: 94 },
    { regionId: 'east-stand', predictedOccupancy: 78 },
  ],
  predictionTimeline: [
    { time: 'Before Event', occupancyLevel: 55, riskLevel: 'Low' },
    { time: 'Peak Entry', occupancyLevel: 92, riskLevel: 'High' },
    { time: 'Mid Match', occupancyLevel: 80, riskLevel: 'Moderate' },
    { time: 'Exit', occupancyLevel: 60, riskLevel: 'Low' },
  ],
  parkingRisk: 'Moderate',
  queuePrediction: { riskLevel: 'High', estimate: '12-15 minute wait at peak entry' },
  securityRisk: 'Moderate',
  medicalRisk: 'Moderate',
  recommendedActions: [
    'Open an additional entry lane at the affected gate',
    'Deploy extra stewards to the highlighted stand',
    'Stage a mobile medical unit nearby as a precaution',
  ],
  confidenceFactors: ['Historical entry-rate pattern', 'Current occupancy trend', 'Gate throughput capacity'],
  confidence: 82,
}

/** Shown only if the live Emergency AI recommendation call times out or errors. */
export const FALLBACK_RECOMMENDATION: EmergencyAiRecommendation = {
  incidentSummary:
    'Crowd density in the highlighted stand has exceeded safe thresholds following sustained inflow, with early signs of pushing near the front barriers.',
  severity: 'High',
  recommendedActions: [
    'Dispatch additional stewards to the affected stand immediately',
    'Open an alternate gate to relieve inbound pressure',
    'Pause further entry through the nearest gate until density drops',
    'Position a medical team nearby as a precaution',
  ],
  deploymentPriority: 'Immediate',
  estimatedResolutionMinutes: 12,
  confidence: 88,
}
