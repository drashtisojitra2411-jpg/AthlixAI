import { useMemo } from 'react'
import type { CrowdZoneInput, ParkingInput } from '@/lib/copilot/engine'
import { matchStadiumRegions, type MatchRegionsOptions, type StadiumRegionData } from '@/lib/heatmap/matchRegions'
import { STADIUM_REGIONS } from '@/lib/heatmap/regions.config'

export function useStadiumRegions(
  crowd: CrowdZoneInput[],
  parking: ParkingInput[],
  generatedAt: string | null,
  options: MatchRegionsOptions = {},
): StadiumRegionData[] {
  const mode = options.mode ?? 'live'

  return useMemo(
    () => matchStadiumRegions(STADIUM_REGIONS, crowd, parking, generatedAt, { mode }),
    [crowd, parking, generatedAt, mode],
  )
}
