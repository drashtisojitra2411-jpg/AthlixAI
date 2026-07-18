import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, Car, Inbox, Loader2, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useMyEvents } from '@/hooks/useMyEvents'
import { useEventOperationalData } from '@/hooks/useEventOperationalData'
import { ParkingIntelligenceModule } from '@/components/dashboard/OperationsModules'

function ParkingHeader({ eventId, events, onSelectEvent }: {
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
            <Car className="size-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-text-primary tracking-tight">ATHLIX Parking</span>
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

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="text-xs text-text-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold text-text-primary tabular-nums">{value}</div>
    </div>
  )
}

export function ParkingPage() {
  const {
    events,
    selectedEventId,
    selectEvent,
    loading: eventsLoading,
    error: eventsError,
  } = useMyEvents()

  const { summary, parking, loading: summaryLoading, error: summaryError } = useEventOperationalData(selectedEventId)

  useEffect(() => {
    document.title = 'Parking · ATHLIX'
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary">
      <ParkingHeader eventId={selectedEventId} events={events} onSelectEvent={selectEvent} />

      <main className="mx-auto max-w-[1400px] p-4 sm:p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Parking</h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Occupancy, zone utilization, and AI-recommended routing for this event's parking network.
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
              Create an event from the Command Center to see its parking operations.
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
                <Loader2 className="size-4 animate-spin" /> Loading parking data…
              </div>
            ) : summary ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <StatTile label="Occupancy" value={`${summary.parking.overallOccupancyRate}%`} />
                  <StatTile label="Capacity" value={summary.event.parkingCapacity.toLocaleString()} />
                  <StatTile label="Occupied" value={summary.event.parkingOccupied.toLocaleString()} />
                  <StatTile label="Available" value={summary.parking.totalAvailable.toLocaleString()} />
                </div>

                {parking.length === 0 ? (
                  <div className="glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-2">
                    <Inbox className="size-6 text-text-muted" />
                    <p className="text-sm text-text-muted">No parking lots recorded for this event yet.</p>
                  </div>
                ) : (
                  <ParkingIntelligenceModule parking={parking} />
                )}
              </>
            ) : null}
          </div>
        )}
      </main>
    </div>
  )
}
