import { apiRequest } from './client'
import type { PaginatedResult } from './types'
import type { EventStatus } from './events'

export type TicketCategory = 'value' | 'premium' | 'elite'
export type BookingStatus = 'confirmed'

export interface BookingEventSummary {
  id: string
  name: string
  venue: string
  location?: string | null
  startDate: string
  endDate: string
  status: EventStatus
  coverImage?: string | null
}

export interface AppBooking {
  id: string
  user: string
  event: BookingEventSummary
  ticketCategory: TicketCategory
  quantity: number
  pricePerSeat: number
  totalAmount: number
  status: BookingStatus
  createdAt: string
  updatedAt: string
}

export interface CreateBookingInput {
  event: string
  ticketCategory: TicketCategory
  quantity: number
}

export interface BookingPricing {
  pricePerSeat: Record<TicketCategory, number>
  sectionByCategory: Record<TicketCategory, string>
}

type RawBookingEvent = Omit<BookingEventSummary, 'id'> & { _id: string }
type RawAppBooking = Omit<AppBooking, 'id' | 'event'> & { _id: string; event: RawBookingEvent }

function toAppBooking(raw: RawAppBooking): AppBooking {
  const { _id, event, ...rest } = raw
  const { _id: eventId, ...eventRest } = event
  return { id: _id, event: { id: eventId, ...eventRest }, ...rest }
}

export async function listMyBookings(): Promise<PaginatedResult<AppBooking>> {
  const result = await apiRequest<PaginatedResult<RawAppBooking>>('/bookings/mine', {
    query: { limit: 100 },
  })
  return { ...result, items: result.items.map(toAppBooking) }
}

// POST /bookings returns the booking with `event` as a plain id string (not
// populated) — the caller already has the full event details from wherever
// it initiated the booking, so this is intentionally a lighter shape.
export async function createBooking(input: CreateBookingInput): Promise<{ bookingId: string; totalAmount: number }> {
  const { booking } = await apiRequest<{ booking: { _id: string; totalAmount: number } }>('/bookings', {
    method: 'POST',
    body: input,
  })
  return { bookingId: booking._id, totalAmount: booking.totalAmount }
}

export function getBookingPricing(): Promise<{ pricing: BookingPricing }> {
  return apiRequest<{ pricing: BookingPricing }>('/bookings/pricing')
}
