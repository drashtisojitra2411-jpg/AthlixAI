import { apiRequest } from './client'
import type { PaginatedResult } from './types'

export type EventStatus = 'Upcoming' | 'Active' | 'Completed' | 'Cancelled'

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
  coverImage?: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateEventInput {
  name: string
  description?: string
  venue: string
  location?: string
  startDate: string
  endDate: string
  capacity: number
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
