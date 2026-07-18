import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, CalendarDays, Inbox, Loader2, MapPin, Ticket } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { VisitorShell } from '@/components/visitor/VisitorShell'
import { useMyBookings } from '@/hooks/useMyBookings'

export function VisitorMyTicketsPage() {
  useEffect(() => {
    document.title = 'My Tickets · ATHLIX'
  }, [])

  const { bookings, loading, error } = useMyBookings()

  return (
    <VisitorShell title="My Tickets">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">My Tickets</h1>
        <p className="mt-0.5 text-sm text-text-muted">Every booking you've confirmed, upcoming and past.</p>
      </motion.div>

      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
          <Loader2 className="size-4 animate-spin" /> Loading your tickets…
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && bookings.length === 0 && (
        <div className="glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-3">
          <Inbox className="size-8 text-text-muted" />
          <h3 className="font-semibold text-text-primary">No tickets yet</h3>
          <p className="text-sm text-text-muted max-w-sm">Browse events to book your first ticket.</p>
          <Link to="/visitor/events" className="text-sm text-accent hover:underline">Browse Events</Link>
        </div>
      )}

      {!loading && !error && bookings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bookings.map((booking, i) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-text-primary truncate">{booking.event.name}</h3>
                <Badge variant={booking.event.status === 'Live' ? 'live' : 'default'}>{booking.event.status}</Badge>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-text-muted">
                <MapPin className="size-3.5 shrink-0" />
                <span className="truncate">{booking.event.venue}</span>
              </div>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-text-muted">
                <CalendarDays className="size-3.5 shrink-0" />
                {new Date(booking.event.startDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl bg-[var(--color-surface-hover)] p-3">
                <div className="flex items-center gap-1.5 text-sm text-text-primary">
                  <Ticket className="size-3.5" />
                  {booking.quantity} × <span className="capitalize">{booking.ticketCategory}</span>
                </div>
                <div className="text-sm font-semibold text-text-primary tabular-nums">
                  ${booking.totalAmount.toLocaleString()}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </VisitorShell>
  )
}
