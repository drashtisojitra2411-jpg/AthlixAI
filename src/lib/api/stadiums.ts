import { apiRequest } from './client'
import type { PaginatedResult } from './types'

export interface AppStadium {
  id: string
  name: string
  location: string
  capacity: number
  description?: string | null
  image?: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface CreateStadiumInput {
  name: string
  location: string
  capacity: number
  description?: string
  image?: string
}

type RawAppStadium = Omit<AppStadium, 'id'> & { _id: string }

function toAppStadium(raw: RawAppStadium): AppStadium {
  const { _id, ...rest } = raw
  return { id: _id, ...rest }
}

export async function listStadiums(): Promise<PaginatedResult<AppStadium>> {
  const result = await apiRequest<PaginatedResult<RawAppStadium>>('/stadiums', {
    query: { limit: 100 },
  })
  return { ...result, items: result.items.map(toAppStadium) }
}

export async function getStadiumById(id: string): Promise<{ stadium: AppStadium }> {
  const { stadium } = await apiRequest<{ stadium: RawAppStadium }>(`/stadiums/${id}`)
  return { stadium: toAppStadium(stadium) }
}

export async function createStadium(input: CreateStadiumInput): Promise<{ stadium: AppStadium }> {
  const { stadium } = await apiRequest<{ stadium: RawAppStadium }>('/stadiums', {
    method: 'POST',
    body: input,
  })
  return { stadium: toAppStadium(stadium) }
}
