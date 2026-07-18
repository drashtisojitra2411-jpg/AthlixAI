import { AlertTriangle } from 'lucide-react'
import { StadiumMap } from '@/components/heatmap/StadiumMap'
import { StatusLegend } from '@/components/heatmap/StatusLegend'
import type { DemoCongestionRegion } from '@/lib/demo/pickCongestionRegion'
import type { StadiumRegionData } from '@/lib/heatmap/matchRegions'
import type { PredictedRegionOverlay } from '@/lib/heatmap/overlay'
import { occupancyToStatus } from '@/lib/heatmap/statusColors'

interface DemoStageCongestionProps {
  regions: StadiumRegionData[]
  congestionRegion: DemoCongestionRegion
  onSelectRegion: (id: string) => void
}

export function DemoStageCongestion({ regions, congestionRegion, onSelectRegion }: DemoStageCongestionProps) {
  const overlay: Record<string, PredictedRegionOverlay> = {
    [congestionRegion.id]: {
      predictedOccupancy: congestionRegion.occupancyPercent,
      status: occupancyToStatus(congestionRegion.occupancyPercent),
    },
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-warning/25 bg-warning/5 px-3.5 py-3 text-sm text-warning">
        <AlertTriangle className="size-4 shrink-0" />
        <span>
          <strong>{congestionRegion.label}</strong> is at {congestionRegion.occupancyPercent}% occupancy
          {congestionRegion.isLive ? ' — live reading' : ' — scripted for this demo'}.
        </span>
      </div>

      <StatusLegend />

      <div className="glass-card rounded-3xl p-4 sm:p-6">
        <StadiumMap regions={regions} onSelectRegion={onSelectRegion} overlay={overlay} />
      </div>
    </div>
  )
}
