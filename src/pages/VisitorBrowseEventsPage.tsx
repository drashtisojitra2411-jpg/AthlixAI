import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, CalendarDays, Inbox, Loader2, MapPin, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VisitorShell } from '@/components/visitor/VisitorShell'
import { useStadiums } from '@/hooks/useStadiums'
import { useBrowseEvents } from '@/hooks/useBrowseEvents'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

// Radix Select items can't have an empty-string value (that's reserved for
// "no selection"), so "All stadiums" needs a real sentinel value that gets
// translated back to '' at the filter-state boundary.
const ALL_STADIUMS_VALUE = '__all__'

export function VisitorBrowseEventsPage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Browse Events · ATHLIX'
  }, [])

  const { stadiums } = useStadiums()
  const [stadiumId, setStadiumId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const filters = useMemo(
    () => ({
      stadiumId: stadiumId || undefined,
      from: from ? new Date(from).toISOString() : undefined,
      to: to ? new Date(to).toISOString() : undefined,
    }),
    [stadiumId, from, to],
  )

  const { events, loading, error } = useBrowseEvents(filters)

  return (
    <VisitorShell title="Browse Events">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Browse Events</h1>
        <p className="mt-0.5 text-sm text-text-muted">Live and upcoming events across every stadium.</p>
      </motion.div>

      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <Select
          value={stadiumId || ALL_STADIUMS_VALUE}
          onValueChange={(value) => setStadiumId(value === ALL_STADIUMS_VALUE ? '' : value)}
        >
          <SelectTrigger className="h-10 flex-1 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_STADIUMS_VALUE}>All stadiums</SelectItem>
            {stadiums.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="h-10 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-default)] px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
        />
        <input
          type="date"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="h-10 rounded-xl bg-[var(--color-surface-card)] border border-[var(--color-border-default)] px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-[var(--color-border-focus)]"
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
          <Loader2 className="size-4 animate-spin" /> Loading events…
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && events.length === 0 && (
        <div className="glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-2">
          <Inbox className="size-6 text-text-muted" />
          <p className="text-sm text-text-muted">No events match these filters right now.</p>
        </div>
      )}

      {!loading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event, i) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card glass-card-hover rounded-2xl p-5 flex flex-col"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-text-primary">{event.name}</h3>
                <Badge variant={event.status === 'Live' ? 'live' : 'default'}>{event.status}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{event.stadium?.name ?? event.venue}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
                <CalendarDays className="size-3.5 shrink-0" />
                {new Date(event.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              <div className="mt-3 text-xs text-text-muted">
                {event.seatsAvailable.toLocaleString()} of {event.totalSeats.toLocaleString()} seats available
              </div>
              <Button
                size="sm"
                className="mt-4 gap-1.5"
                disabled={event.seatsAvailable <= 0}
                onClick={() => navigate(`/visitor/events/${event.id}`)}
              >
                <Ticket className="size-3.5" /> {event.seatsAvailable <= 0 ? 'Sold Out' : 'View & Book'}
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </VisitorShell>
  )
}
