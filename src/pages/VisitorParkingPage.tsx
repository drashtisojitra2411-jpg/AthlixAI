import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Car, Footprints, Inbox, Loader2, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { VisitorShell } from '@/components/visitor/VisitorShell'
import { useBookedEventSelector } from '@/hooks/useBookedEventSelector'
import { useVisitorEventSummary } from '@/hooks/useVisitorEventSummary'

export function VisitorParkingPage() {
  useEffect(() => {
    document.title = 'Parking · ATHLIX'
  }, [])

  const { events, selectedEventId, selectEvent, loading: eventsLoading, error: eventsError } = useBookedEventSelector()
  const { summary, loading: summaryLoading } = useVisitorEventSummary(selectedEventId)
  const recommendedLot = summary?.parking.recommendedLot ?? null

  return (
    <VisitorShell title="Parking">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Parking</h1>
          <p className="mt-0.5 text-sm text-text-muted">Live availability and the shortest walk to your gate.</p>
        </div>
        {events.length > 0 && (
          <select
            value={selectedEventId ?? ''}
            onChange={(e) => selectEvent(e.target.value)}
            className="h-9 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-default)] px-3 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        )}
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
          <p className="max-w-sm text-sm text-text-muted">Book a ticket to see live parking availability.</p>
          <Link to="/visitor/events" className="text-sm text-accent hover:underline">Browse Events</Link>
        </div>
      )}

      {!eventsLoading && !eventsError && events.length > 0 && (
        summaryLoading ? (
          <div className="flex items-center gap-2 py-16 justify-center text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin" /> Loading parking data…
          </div>
        ) : !summary || summary.parking.lots.length === 0 ? (
          <div className="glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-2">
            <Inbox className="size-6 text-text-muted" />
            <p className="text-sm text-text-muted">No parking data recorded for this event yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recommendedLot && (
              <div className="glass-card rounded-2xl p-5 border-accent/25">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-accent">
                      <Car className="size-3.5" /> Recommended Lot
                    </div>
                    <div className="mt-1.5 text-xl font-bold text-text-primary">{recommendedLot.lot}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end gap-1.5 text-sm text-text-primary">
                      <Footprints className="size-4" /> {recommendedLot.walkingMinutes} min walk
                    </div>
                    <div className="mt-1 text-xs text-text-muted">via {recommendedLot.gate}</div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {summary.parking.lots.map((lot) => (
                <div key={lot.lot} className="glass-card rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-text-muted">{lot.lot}</div>
                      <div className="mt-1.5 text-lg font-bold text-text-primary tabular-nums">
                        {lot.availableSpaces.toLocaleString()}
                      </div>
                      <div className="text-xs text-text-muted">spaces available</div>
                    </div>
                    <Badge variant={lot.trafficLevel === 'High' ? 'error' : lot.trafficLevel === 'Moderate' ? 'warning' : 'success'}>
                      {lot.trafficLevel}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-text-muted">
                    <span className="flex items-center gap-1"><Footprints className="size-3.5" /> {lot.walkingMinutes} min</span>
                    <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {lot.gate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      )}
    </VisitorShell>
  )
}
