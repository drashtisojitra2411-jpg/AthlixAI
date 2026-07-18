import { useEffect, useMemo, useState } from 'react'
import { useMyBookings } from './useMyBookings'
import type { BookingEventSummary } from '@/lib/api/bookings'

interface UseBookedEventSelectorResult {
  events: BookingEventSummary[]
  selectedEventId: string | null
  selectEvent: (eventId: string) => void
  loading: boolean
  error: string | null
}

/**
 * Stadium/Parking/Food pages need to pick which of the visitor's own booked
 * events to show live data for — not "all events" (a visitor cares about
 * the event they're attending, not the whole platform). Shared here so the
 * three pages don't each re-derive the same dedup/sort/selection logic.
 */
export function useBookedEventSelector(): UseBookedEventSelectorResult {
  const { bookings, loading, error } = useMyBookings()

  const events = useMemo(() => {
    const byId = new Map<string, BookingEventSummary>()
    for (const booking of bookings) {
      if (booking.event.status === 'Upcoming' || booking.event.status === 'Live') {
        byId.set(booking.event.id, booking.event)
      }
    }
    return [...byId.values()].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    )
  }, [bookings])

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)

  useEffect(() => {
    setSelectedEventId((current) =>
      current && events.some((event) => event.id === current) ? current : (events[0]?.id ?? null),
    )
  }, [events])

  return { events, selectedEventId, selectEvent: setSelectedEventId, loading, error }
}
