import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Inbox, Loader2, LogOut, Map as MapIcon, Radar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/useAuth'
import { useMyEvents } from '@/hooks/useMyEvents'
import { useEventOperationalData } from '@/hooks/useEventOperationalData'
import { useStadiumRegions } from '@/hooks/useStadiumRegions'
import { StadiumMap } from '@/components/heatmap/StadiumMap'
import { StatusLegend } from '@/components/heatmap/StatusLegend'
import { RegionDetailsDrawer } from '@/components/heatmap/RegionDetailsDrawer'
import { EventSelect } from '@/components/shared/EventSelect'

function HeatmapHeader({ eventId, events, onSelectEvent }: {
  eventId: string | null
  events: Array<{ id: string; name: string }>
  onSelectEvent: (id: string) => void
}) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border-default)] bg-bg-primary/80 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 text-text-muted hover:text-text-primary transition-colors">
          <ArrowLeft className="size-4" />
          <span className="hidden text-sm sm:inline">Command Center</span>
        </Link>

        <div className="h-6 w-px bg-[var(--color-border-default)]" />

        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg accent-gradient">
            <MapIcon className="size-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">ATHLIX Stadium Heatmap</span>
        </div>

        <div className="flex-1" />

        <EventSelect events={events} value={eventId} onChange={onSelectEvent} />

        <Badge variant="live" className="hidden sm:inline-flex">MATCH LIVE</Badge>

        <Button variant="copilot" size="sm" className="hidden sm:inline-flex gap-1.5" asChild>
          <Link to="/dashboard/predictive-operations">
            <Radar className="size-3.5" /> Predictive Ops
          </Link>
        </Button>

        <button
          onClick={() => {
            logout()
            navigate('/login', { replace: true })
          }}
          className="flex size-9 items-center justify-center rounded-xl text-text-muted hover:bg-[var(--color-surface-hover)] hover:text-text-primary transition-colors"
          aria-label="Logout"
          title={user?.fullName}
        >
          <LogOut className="size-4" />
        </button>
      </div>
    </header>
  )
}

export function HeatmapPage() {
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const {
    events,
    selectedEventId,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
  } = useMyEvents()

  const { summary, crowd, parking, loading: summaryLoading, error: summaryError } = useEventOperationalData(selectedEventId)

  const regions = useStadiumRegions(crowd, parking, summary?.generatedAt ?? null)
  const selectedRegion = regions.find((region) => region.id === selectedRegionId) ?? null

  useEffect(() => {
    document.title = 'Stadium Heatmap · ATHLIX'
  }, [])

  const handleSelectRegion = (id: string) => {
    setSelectedRegionId(id)
    setDrawerOpen(true)
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <HeatmapHeader eventId={selectedEventId} events={events} onSelectEvent={selectEvent} />

      <main className="mx-auto max-w-[1400px] p-4 sm:p-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Stadium Heatmap</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Hover a region for a quick read, click for full detail. Gray, dashed regions have no matching live data.
          </p>
        </motion.div>

        {eventsLoading && (
          <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin" /> Loading your events…
          </div>
        )}

        {!eventsLoading && eventsError && (
          <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
            <AlertCircle className="size-4 shrink-0" /> {eventsError}
          </div>
        )}

        {!eventsLoading && !eventsError && events.length === 0 && (
          <div className="glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-3">
            <Inbox className="size-8 text-text-muted" />
            <h3 className="font-semibold text-text-primary">No events yet</h3>
            <p className="max-w-sm text-sm text-text-muted">
              Create an event from the Command Center to see its live stadium occupancy map.
            </p>
            <Link to="/dashboard" className="text-sm text-accent hover:underline">Go to Command Center</Link>
          </div>
        )}

        {!eventsLoading && !eventsError && events.length > 0 && (
          <div className="space-y-4">
            {summaryError && (
              <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
                <AlertCircle className="size-4 shrink-0" /> {summaryError}
              </div>
            )}

            <StatusLegend />

            <div className="glass-card rounded-3xl p-4 sm:p-6">
              {summaryLoading ? (
                <div className="flex items-center gap-2 py-16 justify-center text-sm text-text-muted">
                  <Loader2 className="size-4 animate-spin" /> Loading live occupancy…
                </div>
              ) : (
                <StadiumMap regions={regions} onSelectRegion={handleSelectRegion} />
              )}
            </div>
          </div>
        )}
      </main>

      <RegionDetailsDrawer region={selectedRegion} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </div>
  )
}
