import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle, Calendar, CloudSun, Inbox, Loader2, MapPin, Megaphone,
  Ticket, Users, Car,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VisitorShell } from '@/components/visitor/VisitorShell'
import { useMyBookings } from '@/hooks/useMyBookings'
import { useVisitorEventSummary } from '@/hooks/useVisitorEventSummary'
import { useVisitorAnnouncements } from '@/hooks/useVisitorAnnouncements'
import * as tournamentsApi from '@/lib/api/tournaments'
import type { TournamentMatch } from '@/lib/api/tournaments'
import { cn } from '@/lib/utils'

function SectionEmpty({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <Inbox className="size-6 text-text-muted" />
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  )
}

function useEventSchedule(eventId: string | null) {
  const [matches, setMatches] = useState<TournamentMatch[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!eventId) {
      setMatches([])
      return
    }
    let cancelled = false
    setLoading(true)
    tournamentsApi
      .listByEvent(eventId)
      .then((result) => {
        if (cancelled) return
        const allMatches = result.items.flatMap((tournament) => tournament.matches)
        setMatches(allMatches.sort((a, b) => a.time.localeCompare(b.time)))
      })
      .catch(() => {
        if (!cancelled) setMatches([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [eventId])

  return { matches, loading }
}

export function VisitorHomePage() {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = 'Home · ATHLIX'
  }, [])

  const { bookings, loading: bookingsLoading, error: bookingsError } = useMyBookings()

  const featuredBooking = useMemo(() => {
    const upcoming = bookings.filter((b) => b.event.status === 'Upcoming' || b.event.status === 'Live')
    return [...upcoming].sort(
      (a, b) => new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime(),
    )[0]
  }, [bookings])

  const featuredEventId = featuredBooking?.event.id ?? null

  const { summary, loading: summaryLoading } = useVisitorEventSummary(featuredEventId)
  const { announcements } = useVisitorAnnouncements(featuredEventId)
  const { matches } = useEventSchedule(featuredEventId)

  const upcomingBookings = useMemo(
    () =>
      [...bookings]
        .filter((b) => b.event.status === 'Upcoming' || b.event.status === 'Live')
        .sort((a, b) => new Date(a.event.startDate).getTime() - new Date(b.event.startDate).getTime())
        .slice(0, 4),
    [bookings],
  )

  return (
    <VisitorShell title="Home">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Welcome back</h1>
        <p className="mt-0.5 text-sm text-text-muted">Your live event overview, tickets, and stadium info.</p>
      </motion.div>

      {bookingsLoading && (
        <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
          <Loader2 className="size-4 animate-spin" /> Loading your events…
        </div>
      )}

      {!bookingsLoading && bookingsError && (
        <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {bookingsError}
        </div>
      )}

      {!bookingsLoading && !bookingsError && !featuredBooking && (
        <div className="glass-card rounded-3xl p-10 flex flex-col items-center text-center gap-3">
          <Ticket className="size-8 text-text-muted" />
          <h3 className="font-semibold text-text-primary">No upcoming events yet</h3>
          <p className="text-sm text-text-muted max-w-sm">
            Browse live and upcoming events to book your tickets and unlock your stadium experience.
          </p>
          <Button onClick={() => navigate('/visitor/events')}>Browse Events</Button>
        </div>
      )}

      {!bookingsLoading && !bookingsError && featuredBooking && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-text-primary">Live Event Overview</h3>
                  <p className="text-xs text-text-muted mt-0.5">{featuredBooking.event.name}</p>
                </div>
                <Badge variant={featuredBooking.event.status === 'Live' ? 'live' : 'default'}>
                  {featuredBooking.event.status}
                </Badge>
              </div>

              {summaryLoading ? (
                <div className="flex items-center gap-2 py-4 text-sm text-text-muted">
                  <Loader2 className="size-4 animate-spin" /> Loading live data…
                </div>
              ) : summary ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-[var(--color-surface-hover)] p-3">
                    <div className="flex items-center gap-1.5 text-text-muted"><Users className="size-3.5" /><span className="text-[11px] uppercase tracking-[0.14em]">Crowd</span></div>
                    <div className="mt-1 text-lg font-bold text-text-primary tabular-nums">{summary.crowd.averageCapacity}%</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-surface-hover)] p-3">
                    <div className="flex items-center gap-1.5 text-text-muted"><Car className="size-3.5" /><span className="text-[11px] uppercase tracking-[0.14em]">Parking</span></div>
                    <div className="mt-1 text-lg font-bold text-text-primary tabular-nums">{summary.parking.overallOccupancyRate}%</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-surface-hover)] p-3">
                    <div className="flex items-center gap-1.5 text-text-muted"><CloudSun className="size-3.5" /><span className="text-[11px] uppercase tracking-[0.14em]">Weather</span></div>
                    <div className="mt-1 text-sm font-semibold text-text-primary truncate">{summary.event.weather ?? 'Unavailable'}</div>
                  </div>
                  <div className="rounded-xl bg-[var(--color-surface-hover)] p-3">
                    <div className="flex items-center gap-1.5 text-text-muted"><MapPin className="size-3.5" /><span className="text-[11px] uppercase tracking-[0.14em]">Venue</span></div>
                    <div className="mt-1 text-sm font-semibold text-text-primary truncate">{summary.event.venue}</div>
                  </div>
                </div>
              ) : (
                <SectionEmpty message="Live data isn't available for this event yet." />
              )}
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="size-4 text-accent" />
                <h3 className="font-semibold text-text-primary">Event Schedule</h3>
              </div>
              {matches.length === 0 ? (
                <SectionEmpty message="No match schedule published yet." />
              ) : (
                <div className="space-y-3">
                  {matches.map((match, i) => (
                    <div key={`${match.time}-${i}`} className="flex items-center justify-between text-sm">
                      <span className={cn('text-text-secondary', match.status === 'active' && 'text-accent font-medium')}>
                        {match.teamA} vs {match.teamB}
                      </span>
                      <span className="text-xs text-text-muted tabular-nums">{match.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="glass-card rounded-2xl p-5">
              <h3 className="font-semibold text-text-primary text-sm mb-3">Upcoming Bookings</h3>
              {upcomingBookings.length === 0 ? (
                <SectionEmpty message="No upcoming bookings." />
              ) : (
                <div className="space-y-3">
                  {upcomingBookings.map((b) => (
                    <div key={b.id} className="rounded-xl border border-[var(--color-border-default)] p-3">
                      <div className="text-sm font-medium text-text-primary truncate">{b.event.name}</div>
                      <div className="text-xs text-text-muted mt-0.5">{b.quantity} × {b.ticketCategory}</div>
                    </div>
                  ))}
                </div>
              )}
              <Button variant="ghost" size="sm" className="w-full mt-3" onClick={() => navigate('/visitor/tickets')}>
                View all tickets
              </Button>
            </div>

            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Megaphone className="size-4 text-accent" />
                <h3 className="font-semibold text-text-primary text-sm">Live Announcements</h3>
              </div>
              {announcements.length === 0 ? (
                <SectionEmpty message="No announcements right now." />
              ) : (
                <div className="space-y-2.5">
                  {announcements.slice(0, 5).map((a) => (
                    <div key={a.id} className="rounded-xl bg-[var(--color-surface-hover)] p-3 text-xs text-text-secondary">
                      <span className="font-medium text-text-primary capitalize">{a.type.replace('-', ' ')}</span>
                      {' — '}{a.location} · <span className="capitalize">{a.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </VisitorShell>
  )
}
