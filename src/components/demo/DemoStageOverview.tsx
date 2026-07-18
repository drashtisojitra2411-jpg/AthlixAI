import { Loader2 } from 'lucide-react'
import { StadiumMap } from '@/components/heatmap/StadiumMap'
import { StatusLegend } from '@/components/heatmap/StatusLegend'
import type { EventOperationalSummary } from '@/lib/api/dashboard'
import type { StadiumRegionData } from '@/lib/heatmap/matchRegions'

interface DemoStageOverviewProps {
  summary: EventOperationalSummary | null
  regions: StadiumRegionData[]
  loading: boolean
  onSelectRegion: (id: string) => void
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="text-xs text-text-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold text-text-primary tabular-nums">{value}</div>
    </div>
  )
}

export function DemoStageOverview({ summary, regions, loading, onSelectRegion }: DemoStageOverviewProps) {
  const attendance = summary?.crowd.zones.reduce((sum, zone) => sum + zone.currentCount, 0) ?? 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatTile label="Event" value={summary?.event.name ?? '—'} />
        <StatTile label="Live Attendance" value={attendance.toLocaleString()} />
        <StatTile label="Avg. Crowd Capacity" value={`${summary?.crowd.averageCapacity ?? 0}%`} />
        <StatTile label="Parking Occupancy" value={`${summary?.parking.overallOccupancyRate ?? 0}%`} />
      </div>

      <StatusLegend />

      <div className="glass-card rounded-3xl p-4 sm:p-6">
        {loading ? (
          <div className="flex items-center gap-2 py-16 justify-center text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin" /> Loading live occupancy…
          </div>
        ) : (
          <StadiumMap regions={regions} onSelectRegion={onSelectRegion} />
        )}
      </div>
    </div>
  )
}
