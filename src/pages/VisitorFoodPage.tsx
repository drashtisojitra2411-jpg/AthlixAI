import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, Inbox, Loader2, UtensilsCrossed } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { VisitorShell } from '@/components/visitor/VisitorShell'
import { useBookedEventSelector } from '@/hooks/useBookedEventSelector'
import { useVisitorEventSummary } from '@/hooks/useVisitorEventSummary'
import { cn } from '@/lib/utils'
import { EventSelect } from '@/components/shared/EventSelect'

const DEMAND_COPY: Record<'Low' | 'Moderate' | 'High', { badge: 'success' | 'warning' | 'error'; note: string }> = {
  Low: { badge: 'success', note: 'Short lines expected — good time to grab a bite.' },
  Moderate: { badge: 'warning', note: 'Moderate lines — allow a few extra minutes.' },
  High: { badge: 'error', note: 'High demand right now — expect longer waits.' },
}

export function VisitorFoodPage() {
  useEffect(() => {
    document.title = 'Food & Drinks · ATHLIX'
  }, [])

  const { events, selectedEventId, selectEvent, loading: eventsLoading, error: eventsError } = useBookedEventSelector()
  const { summary, loading: summaryLoading } = useVisitorEventSummary(selectedEventId)

  return (
    <VisitorShell title="Food & Drinks">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Food & Drinks</h1>
          <p className="mt-0.5 text-sm text-text-muted">Live food court demand for your event.</p>
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
          <p className="max-w-sm text-sm text-text-muted">Book a ticket to see live food court status.</p>
          <Link to="/visitor/events" className="text-sm text-accent hover:underline">Browse Events</Link>
        </div>
      )}

      {!eventsLoading && !eventsError && events.length > 0 && (
        summaryLoading ? (
          <div className="flex items-center gap-2 py-16 justify-center text-sm text-text-muted">
            <Loader2 className="size-4 animate-spin" /> Loading food court data…
          </div>
        ) : summary ? (
          <div className="glass-card rounded-2xl p-6 max-w-md">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex size-10 items-center justify-center rounded-xl accent-gradient">
                <UtensilsCrossed className="size-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-text-primary">Food Court Status</h3>
                <p className="text-xs text-text-muted">Updated live from concession orders</p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-[var(--color-surface-hover)] p-4">
              <div>
                <div className="text-2xl font-bold text-text-primary tabular-nums">{summary.foodCourt.ordersToday.toLocaleString()}</div>
                <div className="text-xs text-text-muted">orders processed today</div>
              </div>
              <Badge variant={DEMAND_COPY[summary.foodCourt.demandLevel].badge}>
                {summary.foodCourt.demandLevel} demand
              </Badge>
            </div>
            <p className={cn('mt-4 text-sm text-text-secondary')}>
              {DEMAND_COPY[summary.foodCourt.demandLevel].note}
            </p>
          </div>
        ) : null
      )}
    </VisitorShell>
  )
}
