import { apiRequest } from './client'
import type { PaginatedResult } from './types'

export type TournamentStatus = 'Scheduled' | 'Ongoing' | 'Completed'
export type MatchStatus = 'upcoming' | 'active' | 'completed'

export interface TournamentMatch {
  time: string
  teamA: string
  teamB: string
  venue: string
  status: MatchStatus
  score?: string | null
}

export interface Tournament {
  _id: string
  event: string
  name: string
  teams: string[]
  matches: TournamentMatch[]
  status: TournamentStatus
}

export function listByEvent(eventId: string): Promise<PaginatedResult<Tournament>> {
  return apiRequest<PaginatedResult<Tournament>>(`/tournaments/event/${eventId}`, {
    query: { limit: 50 },
  })
}
