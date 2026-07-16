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

export function listMyEvents(): Promise<PaginatedResult<AppEvent>> {
  return apiRequest<PaginatedResult<AppEvent>>('/events/mine', {
    query: { limit: 100 },
  })
}

export function getEventById(id: string): Promise<{ event: AppEvent }> {
  return apiRequest<{ event: AppEvent }>(`/events/${id}`)
}

export function createEvent(input: CreateEventInput): Promise<{ event: AppEvent }> {
  return apiRequest<{ event: AppEvent }>('/events', {
    method: 'POST',
    body: input,
  })
}
