import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, BarChart3, Inbox, Loader2, LogOut, ShoppingBag, Ticket, UtensilsCrossed } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMyEvents } from '@/hooks/useMyEvents'
import { useEventOperationalData } from '@/hooks/useEventOperationalData'
import type { EventOperationalSummary } from '@/lib/api/dashboard'

// No dedicated food/merchandise pricing field exists yet — these are
// labeled estimates from the recorded order/unit counts, the same
// convention DashboardPage already uses for "Seat Revenue (Est.)".
const AVG_FOOD_ORDER_VALUE = 450
const AVG_MERCH_ITEM_PRICE = 1200

function RevenueHeader({ eventId, events, onSelectEvent }: {
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
            <BarChart3 className="size-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">ATHLIX Revenue</span>
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

function RevenueBreakdown({ event }: { event: EventOperationalSummary['event'] }) {
  const foodRevenue = event.foodOrders * AVG_FOOD_ORDER_VALUE
  const merchandiseRevenue = event.merchandiseSales * AVG_MERCH_ITEM_PRICE
  const total = event.ticketRevenue + foodRevenue + merchandiseRevenue

  const streams = [
    { label: 'Ticket Revenue', value: event.ticketRevenue, color: '#6c63ff', estimated: false },
    { label: 'Food Revenue (Est.)', value: foodRevenue, color: '#3b82f6', estimated: true },
    { label: 'Merchandise Revenue (Est.)', value: merchandiseRevenue, color: '#10b981', estimated: true },
  ]

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-text-primary">Revenue Breakdown</h3>
          <p className="text-xs text-text-muted mt-0.5">Total: ₹{total.toLocaleString()}</p>
        </div>
      </div>
      <div className="space-y-4">
        {streams.map((stream, i) => {
          const pct = total === 0 ? 0 : Math.round((stream.value / total) * 100)
          return (
            <div key={stream.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="text-text-secondary">{stream.label}</span>
                <span className="font-medium text-text-primary tabular-nums">₹{stream.value.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full bg-[var(--color-surface-hover)] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: stream.color }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function RevenuePage() {
  const {
    events,
    selectedEventId,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
  } = useMyEvents()

  const { summary, loading: summaryLoading, error: summaryError } = useEventOperationalData(selectedEventId)

  useEffect(() => {
    document.title = 'Revenue · ATHLIX'
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary">
      <RevenueHeader eventId={selectedEventId} events={events} onSelectEvent={selectEvent} />

      <main className="mx-auto max-w-[1400px] p-4 sm:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Revenue</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Ticket, food, and merchandise revenue for this event.
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
              Create an event from the Command Center to see its revenue breakdown.
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
                <Loader2 className="size-4 animate-spin" /> Loading revenue data…
              </div>
            ) : summary ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatTile label="Ticket Revenue" value={`₹${summary.event.ticketRevenue.toLocaleString()}`} icon={Ticket} />
                  <StatTile label="Food Revenue (Est.)" value={`₹${(summary.event.foodOrders * AVG_FOOD_ORDER_VALUE).toLocaleString()}`} icon={UtensilsCrossed} />
                  <StatTile label="Merchandise Revenue (Est.)" value={`₹${(summary.event.merchandiseSales * AVG_MERCH_ITEM_PRICE).toLocaleString()}`} icon={ShoppingBag} />
                  <StatTile label="Avg. Ticket Price" value={`₹${summary.event.averageTicketPrice.toLocaleString()}`} icon={BarChart3} />
                </div>

                <RevenueBreakdown event={summary.event} />
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}
