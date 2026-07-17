import type { StadiumRegionData } from '@/lib/heatmap/matchRegions'
import { STADIUM_REGIONS } from '@/lib/heatmap/regions.config'
import { DEMO_FALLBACK_REGION_ID } from './script'

export interface DemoCongestionRegion {
  id: string
  label: string
  occupancyPercent: number
  /** Whether this region's occupancy came from real live data, or the fixed demo fallback. */
  isLive: boolean
}

/**
 * Picks the single region the demo narrative centers on: the real
 * highest-occupancy live region if one exists at elevated-or-worse status,
 * otherwise a fixed fallback region with a scripted occupancy value — so the
 * demo always has a dramatic, presentable congestion point regardless of
 * whether this event currently has any real elevated occupancy.
 */
export function pickCongestionRegion(regions: StadiumRegionData[]): DemoCongestionRegion {
  const liveCandidates = regions
    .filter((region) => region.dataSource === 'LIVE' && region.status !== 'normal')
    .sort((a, b) => (b.occupancyPercent ?? 0) - (a.occupancyPercent ?? 0))

  if (liveCandidates.length > 0) {
    const top = liveCandidates[0]
    return { id: top.id, label: top.label, occupancyPercent: top.occupancyPercent ?? 0, isLive: true }
  }

  const fallbackLabel =
    STADIUM_REGIONS.find((region) => region.id === DEMO_FALLBACK_REGION_ID)?.label ?? 'North Stand'
  return { id: DEMO_FALLBACK_REGION_ID, label: fallbackLabel, occupancyPercent: 92, isLive: false }
}
