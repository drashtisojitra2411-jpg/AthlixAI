import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { StadiumRegionData } from '@/lib/heatmap/matchRegions'
import { STATUS_COLORS } from '@/lib/heatmap/statusColors'

interface RegionDetailsDrawerProps {
  region: StadiumRegionData | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
}

export function RegionDetailsDrawer({ region, open, onOpenChange }: RegionDetailsDrawerProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="left-auto right-0 top-0 max-h-full w-full max-w-md translate-x-0 translate-y-0 overflow-y-auto rounded-none rounded-l-[var(--radius-2xl)] h-full">
        {region && (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <DialogTitle>{region.label}</DialogTitle>
                <Badge variant="outline" className="capitalize">{region.category}</Badge>
              </div>
              <DialogDescription>{region.description}</DialogDescription>
            </DialogHeader>

            <div className="flex items-center gap-2">
              {region.dataSource === 'LIVE' ? (
                <Badge variant="success">🟢 LIVE</Badge>
              ) : (
                <Badge variant="outline">⚪ NO LIVE DATA</Badge>
              )}
              {region.dataSource === 'LIVE' && (
                <Badge
                  style={{ color: STATUS_COLORS[region.status].fill, borderColor: STATUS_COLORS[region.status].fill }}
                  variant="outline"
                >
                  {STATUS_COLORS[region.status].label}
                </Badge>
              )}
            </div>

            {region.dataSource === 'LIVE' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Occupancy</div>
                    <div className="mt-1 text-xl font-bold text-text-primary tabular-nums">
                      {region.occupancyPercent}%
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">
                      Current {region.unit === 'vehicles' ? 'Vehicles' : 'People'}
                    </div>
                    <div className="mt-1 text-xl font-bold text-text-primary tabular-nums">
                      {region.currentPeople}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Capacity</div>
                    <div className="mt-1 text-xl font-bold text-text-primary tabular-nums">{region.capacity}</div>
                  </div>
                  <div className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-3">
                    <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Status</div>
                    <div className="mt-1 text-xl font-bold text-text-primary">{STATUS_COLORS[region.status].label}</div>
                  </div>
                </div>

                {region.lastUpdated && (
                  <div className="text-xs text-text-muted">
                    Last updated: {formatTimestamp(region.lastUpdated)}
                  </div>
                )}

                {region.matchedSources && region.matchedSources.length > 0 && (
                  <div className="text-xs text-text-muted">
                    Live data matched from: {region.matchedSources.join(', ')}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[var(--color-border-default)] p-4 text-sm text-text-muted">
                No live operational data available for this area.
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
