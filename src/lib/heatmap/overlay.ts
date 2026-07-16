import type { RegionStatus } from './statusColors'

/**
 * A non-live, predicted value for a single stadium region. Always a
 * separate, optional layer rendered on top of live StadiumRegionData —
 * never merged into it and never written by the live matching path
 * (matchStadiumRegions / useStadiumRegions). Consumed by the Predictive
 * Operations feature (src/lib/predictive/overlayMapping.ts) but defined
 * here since it describes heatmap regions.
 */
export interface PredictedRegionOverlay {
  predictedOccupancy: number
  status: RegionStatus
}
