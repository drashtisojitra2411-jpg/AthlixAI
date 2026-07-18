import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertCircle, ArrowLeft, CalendarDays, Loader2, MapPin, Minus, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VisitorShell } from '@/components/visitor/VisitorShell'
import { useMyBookings } from '@/hooks/useMyBookings'
import * as eventsApi from '@/lib/api/events'
import type { BrowsableEvent } from '@/lib/api/events'
import * as bookingsApi from '@/lib/api/bookings'
import type { BookingPricing, TicketCategory } from '@/lib/api/bookings'
import { ApiRequestError } from '@/lib/api/client'

const CATEGORY_ORDER: TicketCategory[] = ['value', 'premium', 'elite']

export function VisitorEventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  const [event, setEvent] = useState<BrowsableEvent | null>(null)
  const [pricing, setPricing] = useState<BookingPricing | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [category, setCategory] = useState<TicketCategory>('value')
  const [quantity, setQuantity] = useState(1)
  const [confirmed, setConfirmed] = useState(false)

  const { createBooking, booking, bookingError } = useMyBookings()

  useEffect(() => {
    document.title = 'Book Tickets · ATHLIX'
  }, [])

  useEffect(() => {
    if (!eventId) return
    let cancelled = false
    setLoading(true)
    setError(null)

    Promise.all([eventsApi.getBrowseEvent(eventId), bookingsApi.getBookingPricing()])
      .then(([eventResult, pricingResult]) => {
        if (cancelled) return
        setEvent(eventResult.event)
        setPricing(pricingResult.pricing)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof ApiRequestError ? err.message : 'Failed to load this event')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [eventId])

  const maxQuantity = Math.min(10, event?.seatsAvailable ?? 1)
  const pricePerSeat = pricing?.pricePerSeat[category] ?? 0
  const total = useMemo(() => pricePerSeat * quantity, [pricePerSeat, quantity])

  const handleConfirm = async () => {
    if (!eventId) return
    try {
      await createBooking({ event: eventId, ticketCategory: category, quantity })
      setConfirmed(true)
    } catch {
      // bookingError is surfaced via useMyBookings()
    }
  }

  return (
    <VisitorShell title="Book Tickets">
      <button
        onClick={() => navigate('/visitor/events')}
        className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="size-4" /> Back to Browse Events
      </button>

      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-text-muted">
          <Loader2 className="size-4 animate-spin" /> Loading event…
        </div>
      )}

      {!loading && error && (
        <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-3 text-sm text-error">
          <AlertCircle className="size-4 shrink-0" /> {error}
        </div>
      )}

      {!loading && !error && event && pricing && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-xl font-bold text-text-primary">{event.name}</h1>
              <Badge variant={event.status === 'Live' ? 'live' : 'default'}>{event.status}</Badge>
            </div>
            {event.description && <p className="text-sm text-text-secondary">{event.description}</p>}
            <div className="flex items-center gap-1.5 text-sm text-text-muted">
              <MapPin className="size-4 shrink-0" />
              {event.stadium?.name ?? event.venue}{event.stadium ? ` · ${event.stadium.location}` : ''}
            </div>
            <div className="flex items-center gap-1.5 text-sm text-text-muted">
              <CalendarDays className="size-4 shrink-0" />
              {new Date(event.startDate).toLocaleString([], { dateStyle: 'full', timeStyle: 'short' })}
            </div>
            <div className="text-sm text-text-muted">
              {event.seatsAvailable.toLocaleString()} of {event.totalSeats.toLocaleString()} seats available ({event.occupancyPercentage}% booked)
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 space-y-5">
            {confirmed ? (
              <div className="flex flex-col items-center text-center gap-3 py-6">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-success/15">
                  <Badge variant="success">Confirmed</Badge>
                </div>
                <h3 className="font-semibold text-text-primary">Booking confirmed</h3>
                <p className="text-sm text-text-muted">Your tickets are ready in My Tickets.</p>
                <Button onClick={() => navigate('/visitor/tickets')}>View My Tickets</Button>
              </div>
            ) : (
              <>
                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">Ticket Category</label>
                  <div className="space-y-2">
                    {CATEGORY_ORDER.map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setCategory(tier)}
                        className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left transition-colors ${
                          category === tier
                            ? 'border-accent/40 bg-accent/10'
                            : 'border-[var(--color-border-default)] hover:bg-[var(--color-surface-hover)]'
                        }`}
                      >
                        <div>
                          <div className="text-sm font-medium text-text-primary capitalize">{tier}</div>
                          <div className="text-xs text-text-muted">{pricing.sectionByCategory[tier]}</div>
                        </div>
                        <div className="text-sm font-semibold text-text-primary tabular-nums">
                          ${pricing.pricePerSeat[tier]}/seat
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-text-secondary">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex size-9 items-center justify-center rounded-xl border border-[var(--color-border-default)] text-text-primary hover:bg-[var(--color-surface-hover)]"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="size-4" />
                    </button>
                    <span className="min-w-[2ch] text-center text-lg font-semibold text-text-primary tabular-nums">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                      className="flex size-9 items-center justify-center rounded-xl border border-[var(--color-border-default)] text-text-primary hover:bg-[var(--color-surface-hover)]"
                      aria-label="Increase quantity"
                      disabled={quantity >= maxQuantity}
                    >
                      <Plus className="size-4" />
                    </button>
                    <span className="text-xs text-text-muted">Max {maxQuantity} per booking</span>
                  </div>
                </div>

                <div className="rounded-xl bg-[var(--color-surface-hover)] p-4">
                  <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>{quantity} × ${pricePerSeat}</span>
                    <span>${total.toLocaleString()}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between border-t border-[var(--color-border-default)] pt-2">
                    <span className="text-sm font-semibold text-text-primary">Total</span>
                    <span className="text-lg font-bold text-text-primary tabular-nums">${total.toLocaleString()}</span>
                  </div>
                </div>

                {bookingError && (
                  <div className="flex items-center gap-2 rounded-xl border border-error/25 bg-error/5 px-3.5 py-2.5 text-sm text-error">
                    <AlertCircle className="size-4 shrink-0" /> {bookingError}
                  </div>
                )}

                <Button
                  className="w-full"
                  loading={booking}
                  disabled={event.seatsAvailable <= 0}
                  onClick={handleConfirm}
                >
                  Confirm Booking
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}
    </VisitorShell>
  )
}
