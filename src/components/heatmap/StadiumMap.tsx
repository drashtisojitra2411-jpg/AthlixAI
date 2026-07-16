import { TooltipProvider } from '@/components/ui/tooltip'
import { REGION_GEOMETRY, VIEW_BOX } from '@/lib/heatmap/geometry'
import type { StadiumRegionData } from '@/lib/heatmap/matchRegions'
import type { PredictedRegionOverlay } from '@/lib/heatmap/overlay'
import { RegionShape } from './RegionShape'

interface StadiumMapProps {
  regions: StadiumRegionData[]
  onSelectRegion: (id: string) => void
  /** Optional predicted-values layer (Predictive Operations). Omit for live-only rendering — unchanged from before. */
  overlay?: Record<string, PredictedRegionOverlay>
}

export function StadiumMap({ regions, onSelectRegion, overlay }: StadiumMapProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <svg
        viewBox={VIEW_BOX}
        className="h-auto w-full"
        role="img"
        aria-label="Interactive stadium occupancy map"
      >
        {regions.map((region) => {
          const geometry = REGION_GEOMETRY[region.id]
          if (!geometry) return null

          return (
            <g key={region.id}>
              <RegionShape
                region={region}
                geometry={geometry}
                onSelect={onSelectRegion}
                overlay={overlay?.[region.id]}
              />
              <text
                x={geometry.label.x}
                y={geometry.label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="pointer-events-none select-none fill-white/90"
                style={{ fontSize: 12, fontWeight: 600 }}
              >
                {region.label}
              </text>
            </g>
          )
        })}
      </svg>
    </TooltipProvider>
  )
}
