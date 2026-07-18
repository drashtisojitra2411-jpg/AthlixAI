import { useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Armchair, Inbox, Loader2, LogOut, Percent, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { useMyEvents } from '@/hooks/useMyEvents'
import { useEventOperationalData } from '@/hooks/useEventOperationalData'
import type { SeatRecommendationSummary } from '@/lib/api/dashboard'

function TicketingHeader({ eventId, events, onSelectEvent }: {
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
            <Ticket className="size-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">ATHLIX Ticketing</span>
        </div>

        <div className="flex-1" />

        {events.length > 0 && (
          <select
            value={eventId ?? ''}
            onChange={(event) => onSelectEvent(event.target.value)}
            className="h-9 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-default)] px-3 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>{event.name}</option>
            ))}
          </select>
        )}

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

function StatTile({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Ticket }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 text-xs text-text-muted">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-text-primary tabular-nums">{value}</div>
    </div>
  )
}

const BUDGET_LABEL: Record<SeatRecommendationSummary['budget'], string> = {
  value: 'Value',
  premium: 'Premium',
  elite: 'Elite',
}

const BUDGET_BADGE: Record<SeatRecommendationSummary['budget'], 'outline' | 'info' | 'copilot'> = {
  value: 'outline',
  premium: 'info',
  elite: 'copilot',
}

function TicketCategories({ recommendations }: { recommendations: SeatRecommendationSummary[] }) {
  const categories = useMemo(() => {
    const groups: Record<SeatRecommendationSummary['budget'], SeatRecommendationSummary[]> = {
      value: [],
      premium: [],
      elite: [],
    }
    for (const rec of recommendations) {
      groups[rec.budget].push(rec)
    }
    return (['elite', 'premium', 'value'] as const)
      .map((tier) => {
        const items = groups[tier]
        if (items.length === 0) return null
        const avgPrice = Math.round(items.reduce((sum, r) => sum + r.pricePerSeat, 0) / items.length)
        const sections = [...new Set(items.map((r) => r.recommendedSection))]
        return { tier, count: items.length, avgPrice, sections }
      })
      .filter((c): c is NonNullable<typeof c> => c !== null)
  }, [recommendations])

  if (categories.length === 0) {
    return (
      <div className="glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-2">
        <Inbox className="size-6 text-text-muted" />
        <p className="text-sm text-text-muted">No ticket category data recorded for this event yet.</p>
      </div>
    )
  }

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-semibold text-text-primary mb-4">Ticket Categories</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.tier}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-[var(--color-border-default)] bg-[rgba(255,255,255,0.03)] p-4"
          >
            <div className="flex items-center justify-between">
              <Badge variant={BUDGET_BADGE[cat.tier]}>{BUDGET_LABEL[cat.tier]}</Badge>
              <span className="text-xs text-text-muted">{cat.count} {cat.count === 1 ? 'record' : 'records'}</span>
            </div>
            <div className="mt-3 text-xl font-bold text-text-primary tabular-nums">${cat.avgPrice}/seat</div>
            <div className="mt-1 text-xs text-text-muted truncate">{cat.sections.join(', ')}</div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export function TicketingPage() {
  const {
    events,
    selectedEventId,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
  } = useMyEvents()

  const { summary, loading: summaryLoading, error: summaryError } = useEventOperationalData(selectedEventId)

  useEffect(() => {
    document.title = 'Ticketing · ATHLIX'
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary">
      <TicketingHeader eventId={selectedEventId} events={events} onSelectEvent={selectEvent} />

      <main className="mx-auto max-w-[1400px] p-4 sm:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Ticketing</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Seat inventory, occupancy, and category breakdown for this event.
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
              Create an event from the Command Center to see its ticketing breakdown.
            </p>
            <Link to="/dashboard" className="text-sm text-accent hover:underline">Go to Command Center</Link>
          </div>
        )}

        {!eventsLoading && !eventsError && events.length > 0 && (
          <div className="space-y-6">
            {summaryError && (
              <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
                <AlertCircle className="size-4 shrink-0" /> {summaryError}
              </div>
            )}

            {summaryLoading ? (
              <div className="flex items-center gap-2 py-16 justify-center text-sm text-text-muted">
                <Loader2 className="size-4 animate-spin" /> Loading ticketing data…
              </div>
            ) : summary ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatTile label="Total Seats" value={summary.event.totalSeats.toLocaleString()} icon={Armchair} />
                  <StatTile label="Seats Booked" value={summary.event.seatsBooked.toLocaleString()} icon={Ticket} />
                  <StatTile label="Seats Available" value={summary.event.seatsAvailable.toLocaleString()} icon={Armchair} />
                  <StatTile label="Occupancy" value={`${summary.event.occupancyPercentage}%`} icon={Percent} />
                </div>

                <TicketCategories recommendations={summary.seating.topRecommendations} />
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}
