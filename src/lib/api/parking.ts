import { apiRequest } from './client'

export type ParkingStatus = 'full' | 'warning' | 'available'
export type TrafficLevel = 'Low' | 'Moderate' | 'High'

export interface ParkingPrediction {
  _id: string
  event: string
  lot: string
  totalSpaces: number
  occupiedSpaces: number
  status: ParkingStatus
  walkingMinutes: number
  gate: string
  trafficLevel: TrafficLevel
  recordedAt: string
}

export function getLatestLotSnapshots(eventId: string): Promise<{ lots: ParkingPrediction[] }> {
  return apiRequest<{ lots: ParkingPrediction[] }>(`/parking/event/${eventId}/latest`)
}
