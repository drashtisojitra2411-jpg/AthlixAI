import type { CrowdShiftEntry } from '@/lib/api/predictive'
import type { PredictedRegionOverlay } from '@/lib/heatmap/overlay'
import { STADIUM_REGIONS } from '@/lib/heatmap/regions.config'
import { occupancyToStatus } from '@/lib/heatmap/statusColors'

const KNOWN_STAND_IDS = new Set(
  STADIUM_REGIONS.filter((region) => region.category === 'stand').map((region) => region.id),
)

/**
 * Pure transform: PredictionResult.crowdShift -> a per-region overlay map for
 * the Stadium Heatmap. Never touches live StadiumRegionData or the existing
 * matchStadiumRegions() path — this is a strictly separate, additive layer.
 * Reuses the same occupancyToStatus() bucketing the live heatmap already
 * uses, so predicted and live regions read on an identical color scale.
 */
export function buildCrowdOverlay(crowdShift: CrowdShiftEntry[]): Record<string, PredictedRegionOverlay> {
  const overlay: Record<string, PredictedRegionOverlay> = {}

  for (const entry of crowdShift) {
    if (!KNOWN_STAND_IDS.has(entry.regionId)) continue

    const predictedOccupancy = Math.max(0, Math.min(100, Math.round(entry.predictedOccupancy)))
    overlay[entry.regionId] = {
      predictedOccupancy,
      status: occupancyToStatus(predictedOccupancy),
    }
  }

  return overlay
}
