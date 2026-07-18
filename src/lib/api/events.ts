import { apiRequest } from './client'
import type { PaginatedResult } from './types'

export type EventStatus = 'Upcoming' | 'Live' | 'Completed' | 'Cancelled'

export interface AppEvent {
  id: string
  name: string
  description?: string | null
  venue: string
  location?: string | null
  startDate: string
  endDate: string
  status: EventStatus
  organizer: string
  capacity: number
  attendance: number
  weather?: string | null
  totalSeats: number
  seatsBooked: number
  seatsAvailable: number
  occupancyPercentage: number
  averageTicketPrice: number
  ticketRevenue: number
  expectedRevenue: number
  parkingCapacity: number
  parkingOccupied: number
  foodOrders: number
  merchandiseSales: number
  entryGatesOpen: number
  securityPersonnel: number
  medicalPersonnel: number
  coverImage?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateEventInput {
  name: string
  description?: string
  venue: string
  location?: string
  stadium?: string
  startDate: string
  endDate: string
  capacity: number
  attendance?: number
  weather?: string
  totalSeats?: number
  seatsBooked?: number
  averageTicketPrice?: number
  expectedRevenue?: number
  parkingCapacity?: number
  parkingOccupied?: number
  foodOrders?: number
  merchandiseSales?: number
  entryGatesOpen?: number
  securityPersonnel?: number
  medicalPersonnel?: number
}

// Mongoose's default JSON serialization only emits "_id", not "id" — this
// boundary maps it once so every consumer of AppEvent can keep using the
// plain "id" field it already expects, without touching every call site.
type RawAppEvent = Omit<AppEvent, 'id'> & { _id: string }

function toAppEvent(raw: RawAppEvent): AppEvent {
  const { _id, ...rest } = raw
  return { id: _id, ...rest }
}

export async function listMyEvents(): Promise<PaginatedResult<AppEvent>> {
  const result = await apiRequest<PaginatedResult<RawAppEvent>>('/events/mine', {
    query: { limit: 100 },
  })
  return { ...result, items: result.items.map(toAppEvent) }
}

export async function listLiveEvents(): Promise<PaginatedResult<AppEvent>> {
  const result = await apiRequest<PaginatedResult<RawAppEvent>>('/events/live')
  return { ...result, items: result.items.map(toAppEvent) }
}

export async function getEventById(id: string): Promise<{ event: AppEvent }> {
  const { event } = await apiRequest<{ event: RawAppEvent }>(`/events/${id}`)
  return { event: toAppEvent(event) }
}

export async function createEvent(input: CreateEventInput): Promise<{ event: AppEvent }> {
  const { event } = await apiRequest<{ event: RawAppEvent }>('/events', {
    method: 'POST',
    body: input,
  })
  return { event: toAppEvent(event) }
}

/* ============================================================
 * Visitor event browsing — pure additions below this line.
 * Nothing above is modified. BrowsableEvent is a deliberately narrower
 * shape than AppEvent (no revenue/security fields) — it mirrors the
 * visitor-safe DTO backend/src/services/event.service.ts builds, not the
 * raw event document AppEvent represents.
 * ============================================================ */

export interface BrowsableEvent {
  id: string
  name: string
  description?: string | null
  venue: string
  location?: string | null
  stadium: { id: string; name: string; location: string } | null
  startDate: string
  endDate: string
  status: EventStatus
  capacity: number
  attendance: number
  totalSeats: number
  seatsAvailable: number
  occupancyPercentage: number
  coverImage?: string | null
  weather?: string | null
}

export interface BrowseEventsFilters {
  stadiumId?: string
  from?: string
  to?: string
}

export async function listBrowseEvents(
  filters: BrowseEventsFilters = {},
): Promise<PaginatedResult<BrowsableEvent>> {
  return apiRequest<PaginatedResult<BrowsableEvent>>('/events/browse', {
    query: { limit: 100, ...filters },
  })
}

export function getBrowseEvent(id: string): Promise<{ event: BrowsableEvent }> {
  return apiRequest<{ event: BrowsableEvent }>(`/events/browse/${id}`)
}
