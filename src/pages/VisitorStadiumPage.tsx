import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Inbox, Loader2, MapPin, Users } from 'lucide-react'
import { VisitorShell } from '@/components/visitor/VisitorShell'
import { StadiumMap } from '@/components/heatmap/StadiumMap'
import { StatusLegend } from '@/components/heatmap/StatusLegend'
import { RegionDetailsDrawer } from '@/components/heatmap/RegionDetailsDrawer'
import { useBookedEventSelector } from '@/hooks/useBookedEventSelector'
import { useVisitorEventSummary } from '@/hooks/useVisitorEventSummary'
import { useStadiumRegions } from '@/hooks/useStadiumRegions'
import * as eventsApi from '@/lib/api/events'
import type { BrowsableEvent } from '@/lib/api/events'
import { EventSelect } from '@/components/shared/EventSelect'

export function VisitorStadiumPage() {
  useEffect(() => {
    document.title = 'Stadium Map · ATHLIX'
  }, [])

  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const { events, selectedEventId, selectEvent, loading: eventsLoading, error: eventsError } = useBookedEventSelector()
  const { crowd, parking, summary, loading: summaryLoading } = useVisitorEventSummary(selectedEventId)
  const regions = useStadiumRegions(crowd, parking, summary?.generatedAt ?? null)
  const selectedRegion = regions.find((region) => region.id === selectedRegionId) ?? null

  const [eventDetail, setEventDetail] = useState<BrowsableEvent | null>(null)
  useEffect(() => {
    if (!selectedEventId) {
      setEventDetail(null)
      return
    }
    let cancelled = false
    eventsApi.getBrowseEvent(selectedEventId).then((result) => {
      if (!cancelled) setEventDetail(result.event)
    }).catch(() => {
      if (!cancelled) setEventDetail(null)
    })
    return () => {
      cancelled = true
    }
  }, [selectedEventId])

  const handleSelectRegion = (id: string) => {
    setSelectedRegionId(id)
    setDrawerOpen(true)
  }

  return (
    <VisitorShell title="Stadium Map">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Stadium Map</h1>
          <p className="mt-0.5 text-sm text-text-muted">Live occupancy across the venue.</p>
        </div>
        <EventSelect events={events} value={selectedEventId} onChange={selectEvent} />
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
          <h3 className="font-semibold text-text-primary">No upcoming events</h3>
          <p className="max-w-sm text-sm text-text-muted">Book a ticket to see the live stadium map for your event.</p>
          <Link to="/visitor/events" className="text-sm text-accent hover:underline">Browse Events</Link>
        </div>
      )}

      {!eventsLoading && !eventsError && events.length > 0 && (
        <div className="space-y-4">
          {eventDetail?.stadium && (
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary mb-3">Stadium Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-[var(--color-surface-hover)] p-3">
                  <div className="flex items-center gap-1.5 text-text-muted"><MapPin className="size-3.5" /><span className="text-[11px] uppercase tracking-[0.14em]">Name</span></div>
                  <div className="mt-1 text-sm font-semibold text-text-primary truncate">{eventDetail.stadium.name}</div>
                </div>
                <div className="rounded-xl bg-[var(--color-surface-hover)] p-3">
                  <div className="text-[11px] uppercase tracking-[0.14em] text-text-muted">Location</div>
                  <div className="mt-1 text-sm font-semibold text-text-primary truncate">{eventDetail.stadium.location}</div>
                </div>
                <div className="rounded-xl bg-[var(--color-surface-hover)] p-3">
                  <div className="flex items-center gap-1.5 text-text-muted"><Users className="size-3.5" /><span className="text-[11px] uppercase tracking-[0.14em]">Capacity</span></div>
                  <div className="mt-1 text-sm font-semibold text-text-primary tabular-nums">{eventDetail.capacity.toLocaleString()}</div>
                </div>
              </div>
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

      <RegionDetailsDrawer region={selectedRegion} open={drawerOpen} onOpenChange={setDrawerOpen} />
    </VisitorShell>
  )
}
