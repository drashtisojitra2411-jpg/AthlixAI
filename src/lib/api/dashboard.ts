import { apiRequest } from './client'
import type { CrowdStatus, RiskLevel } from './crowd'
import type { EmergencySeverity, EmergencyType } from './emergencies'
import type { EventStatus } from './events'
import type { ParkingStatus, TrafficLevel } from './parking'
import type { MatchStatus, TournamentStatus } from './tournaments'

export interface EventCrowdSummary {
  event: string
  zoneCount: number
  averageCapacity: number
  highestRiskLevel: RiskLevel
  statusBreakdown: Record<CrowdStatus, number>
  criticalZones: Array<{ zone: string; capacity: number; currentCount: number; maxCount: number }>
  zones: Array<{ zone: string; capacity: number; currentCount: number; maxCount: number; status: CrowdStatus }>
}

export interface EventParkingSummary {
  event: string
  lotCount: number
  totalSpaces: number
  totalOccupied: number
  totalAvailable: number
  overallOccupancyRate: number
  statusBreakdown: Record<ParkingStatus, number>
  recommendedLot: {
    lot: string
    walkingMinutes: number
    gate: string
    trafficLevel: TrafficLevel
    availableSpaces: number
  } | null
  lots: Array<{
    lot: string
    totalSpaces: number
    occupiedSpaces: number
    availableSpaces: number
    walkingMinutes: number
    gate: string
    trafficLevel: TrafficLevel
    status: ParkingStatus
  }>
}

export interface EventEmergencySummary {
  event: string
  totalActive: number
  totalResolved: number
  severityBreakdown: Record<EmergencySeverity, number>
  typeBreakdown: Record<EmergencyType, number>
  breachedSlaCount: number
  activeReports: Array<{ _id: string; type: EmergencyType; severity: EmergencySeverity; createdAt: string; description?: string | null }>
}

export interface TournamentSummary {
  tournament: string
  name: string
  status: TournamentStatus
  teamCount: number
  totalMatches: number
  completedMatches: number
  upcomingMatches: Array<{ time: string; teamA: string; teamB: string; venue: string; status: MatchStatus }>
  liveMatches: Array<{ time: string; teamA: string; teamB: string; venue: string; status: MatchStatus }>
}

export interface SeatRecommendationSummary {
  _id: string
  budget: 'value' | 'premium' | 'elite'
  recommendedSection: string
  pricePerSeat: number
  fitScore: number
  groupSize: number
  distanceToAction: string
  reason: string
}

export interface ChatMessage {
  _id: string
  role: 'user' | 'assistant'
  message: string
  createdAt: string
}

export interface EventOperationalSummary {
  event: {
    id: string
    name: string
    status: EventStatus
    venue: string
    location: string | null
    startDate: string
    endDate: string
    capacity: number
    attendance: number
    weather: string | null
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
    organizer: string
  }
  crowd: EventCrowdSummary
  parking: EventParkingSummary
  emergency: EventEmergencySummary
  tournaments: TournamentSummary[]
  seating: {
    totalRecommendations: number
    averageFitScore: number
    topRecommendations: SeatRecommendationSummary[]
  }
  engagement: {
    totalChatInteractions: number
    recentMessages: ChatMessage[]
  }
  generatedAt: string
}

export function getEventOperationalSummary(
  eventId: string,
): Promise<{ summary: EventOperationalSummary }> {
  return apiRequest<{ summary: EventOperationalSummary }>(`/dashboard/event/${eventId}`)
}

/* ============================================================
 * Visitor-safe event summary — pure addition below this line.
 * Nothing above is modified. A deliberately narrower shape than
 * EventOperationalSummary (no revenue, no security/medical counts, no
 * incident detail) — mirrors backend/src/services/dashboard.service.ts's
 * getVisitorEventSummary, which is built independently of the sensitive
 * summary above rather than derived by filtering it.
 * ============================================================ */

export interface VisitorEventSummary {
  event: {
    id: string
    name: string
    status: EventStatus
    venue: string
    location: string | null
    startDate: string
    endDate: string
    weather: string | null
    attendance: number
    capacity: number
  }
  crowd: EventCrowdSummary
  parking: EventParkingSummary
  foodCourt: {
    ordersToday: number
    demandLevel: 'Low' | 'Moderate' | 'High'
  }
  generatedAt: string
}

export function getVisitorEventSummary(
  eventId: string,
): Promise<{ summary: VisitorEventSummary }> {
  return apiRequest<{ summary: VisitorEventSummary }>(`/dashboard/event/${eventId}/visitor-summary`)
}
