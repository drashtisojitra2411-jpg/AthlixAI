import { DASHBOARD, EMERGENCY, FOOD_COURT_DEMAND } from "../config/constants";
import { ChatHistory, type IChatHistory } from "../models/ChatHistory.model";
import { EmergencyReport } from "../models/EmergencyReport.model";
import { Event, type EventStatus } from "../models/Event.model";
import {
  SeatRecommendation,
  type ISeatRecommendation,
} from "../models/SeatRecommendation.model";
import { User, type UserRole } from "../models/User.model";
import {
  getEventCrowdSummary,
  type EventCrowdSummary,
} from "./crowdPrediction.service";
import {
  getEventEmergencySummary,
  type EventEmergencySummary,
} from "./emergency.service";
import {
  getEventParkingSummary,
  type EventParkingSummary,
} from "./parking.service";
import {
  buildTournamentSummary,
  getTournamentsForEvent,
  type TournamentSummary,
} from "./tournament.service";
import { assertEventExists } from "./utils/queryHelpers";

export interface EventOperationalSummary {
  event: {
    id: string;
    name: string;
    status: EventStatus;
    venue: string;
    location: string | null;
    startDate: Date;
    endDate: Date;
    capacity: number;
    attendance: number;
    weather: string | null;
    totalSeats: number;
    seatsBooked: number;
    seatsAvailable: number;
    occupancyPercentage: number;
    averageTicketPrice: number;
    ticketRevenue: number;
    expectedRevenue: number;
    parkingCapacity: number;
    parkingOccupied: number;
    foodOrders: number;
    merchandiseSales: number;
    entryGatesOpen: number;
    securityPersonnel: number;
    medicalPersonnel: number;
    organizer: string;
  };
  crowd: EventCrowdSummary;
  parking: EventParkingSummary;
  emergency: EventEmergencySummary;
  tournaments: TournamentSummary[];
  seating: {
    totalRecommendations: number;
    averageFitScore: number;
    topRecommendations: ISeatRecommendation[];
  };
  engagement: {
    totalChatInteractions: number;
    recentMessages: IChatHistory[];
  };
  generatedAt: Date;
}

export interface PlatformOverview {
  totalEvents: number;
  eventsByStatus: Record<EventStatus, number>;
  totalUsers: number;
  usersByRole: Record<UserRole, number>;
  totalActiveEmergenciesAcrossEvents: number;
  generatedAt: Date;
}

interface SeatFitScoreAggregation {
  _id: null;
  averageFitScore: number;
  count: number;
}

const EVENT_STATUSES: EventStatus[] = [
  "Upcoming",
  "Live",
  "Completed",
  "Cancelled",
];

const USER_ROLES: UserRole[] = ["Admin", "Organizer", "Visitor"];

export const getEventOperationalSummary = async (
  eventId: string
): Promise<EventOperationalSummary> => {
  const event = await assertEventExists(eventId);

  const [
    crowd,
    parking,
    emergency,
    tournaments,
    seatFitAggregation,
    topRecommendations,
    totalChatInteractions,
    recentMessages,
  ] = await Promise.all([
    getEventCrowdSummary(eventId),
    getEventParkingSummary(eventId),
    getEventEmergencySummary(eventId),
    getTournamentsForEvent(eventId),
    SeatRecommendation.aggregate<SeatFitScoreAggregation>([
      { $match: { event: event._id } },
      {
        $group: {
          _id: null,
          averageFitScore: { $avg: "$fitScore" },
          count: { $sum: 1 },
        },
      },
    ]),
    SeatRecommendation.find({ event: eventId })
      .sort({ fitScore: -1 })
      .limit(DASHBOARD.TOP_SEAT_RECOMMENDATION_LIMIT),
    ChatHistory.countDocuments({ event: eventId }),
    ChatHistory.find({ event: eventId })
      .sort({ createdAt: -1 })
      .limit(DASHBOARD.RECENT_CHAT_LIMIT),
  ]);

  const seatFitStats = seatFitAggregation[0];

  return {
    event: {
      id: event.id,
      name: event.name,
      status: event.status,
      venue: event.venue,
      location: event.location ?? null,
      startDate: event.startDate,
      endDate: event.endDate,
      capacity: event.capacity,
      attendance: event.attendance,
      weather: event.weather ?? null,
      totalSeats: event.totalSeats,
      seatsBooked: event.seatsBooked,
      seatsAvailable: event.seatsAvailable,
      occupancyPercentage: event.occupancyPercentage,
      averageTicketPrice: event.averageTicketPrice,
      ticketRevenue: event.ticketRevenue,
      expectedRevenue: event.expectedRevenue,
      parkingCapacity: event.parkingCapacity,
      parkingOccupied: event.parkingOccupied,
      foodOrders: event.foodOrders,
      merchandiseSales: event.merchandiseSales,
      entryGatesOpen: event.entryGatesOpen,
      securityPersonnel: event.securityPersonnel,
      medicalPersonnel: event.medicalPersonnel,
      organizer: event.organizer.toString(),
    },
    crowd,
    parking,
    emergency,
    tournaments: tournaments.map(buildTournamentSummary),
    seating: {
      totalRecommendations: seatFitStats?.count ?? 0,
      averageFitScore: seatFitStats
        ? Math.round(seatFitStats.averageFitScore)
        : 0,
      topRecommendations,
    },
    engagement: {
      totalChatInteractions,
      recentMessages,
    },
    generatedAt: new Date(),
  };
};

export const getPlatformOverview = async (): Promise<PlatformOverview> => {
  const [eventStatusCounts, userRoleCounts, totalActiveEmergenciesAcrossEvents] =
    await Promise.all([
      Event.aggregate<{ _id: EventStatus; count: number }>([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      User.aggregate<{ _id: UserRole; count: number }>([
        { $group: { _id: "$role", count: { $sum: 1 } } },
      ]),
      EmergencyReport.countDocuments({
        status: { $in: [...EMERGENCY.ACTIVE_STATUSES] },
      }),
    ]);

  const eventsByStatus = EVENT_STATUSES.reduce((accumulator, status) => {
    accumulator[status] = 0;
    return accumulator;
  }, {} as Record<EventStatus, number>);
  for (const entry of eventStatusCounts) {
    eventsByStatus[entry._id] = entry.count;
  }

  const usersByRole = USER_ROLES.reduce((accumulator, role) => {
    accumulator[role] = 0;
    return accumulator;
  }, {} as Record<UserRole, number>);
  for (const entry of userRoleCounts) {
    usersByRole[entry._id] = entry.count;
  }

  const totalEvents = eventStatusCounts.reduce(
    (sum, entry) => sum + entry.count,
    0
  );
  const totalUsers = userRoleCounts.reduce((sum, entry) => sum + entry.count, 0);

  return {
    totalEvents,
    eventsByStatus,
    totalUsers,
    usersByRole,
    totalActiveEmergenciesAcrossEvents,
    generatedAt: new Date(),
  };
};

/* ============================================================
 * Visitor-safe event summary — pure addition below this line.
 * Nothing above is modified. Built directly from the same low-level
 * services getEventOperationalSummary composes (getEventCrowdSummary,
 * getEventParkingSummary) — deliberately NOT derived by filtering
 * getEventOperationalSummary's output, so the sensitive object (revenue,
 * security/medical counts, incident detail) is never constructed on a
 * code path a visitor can reach.
 * ============================================================ */

export interface VisitorEventSummary {
  event: {
    id: string;
    name: string;
    status: EventStatus;
    venue: string;
    location: string | null;
    startDate: Date;
    endDate: Date;
    weather: string | null;
    attendance: number;
    capacity: number;
  };
  crowd: EventCrowdSummary;
  parking: EventParkingSummary;
  foodCourt: {
    ordersToday: number;
    demandLevel: "Low" | "Moderate" | "High";
  };
  generatedAt: Date;
}

const deriveFoodCourtDemand = (
  foodOrders: number,
  attendance: number
): "Low" | "Moderate" | "High" => {
  if (attendance <= 0) return "Low";
  const ratio = foodOrders / attendance;
  if (ratio >= FOOD_COURT_DEMAND.HIGH_DEMAND_RATIO) return "High";
  if (ratio >= FOOD_COURT_DEMAND.MODERATE_DEMAND_RATIO) return "Moderate";
  return "Low";
};

export const getVisitorEventSummary = async (
  eventId: string
): Promise<VisitorEventSummary> => {
  const event = await assertEventExists(eventId);

  const [crowd, parking] = await Promise.all([
    getEventCrowdSummary(eventId),
    getEventParkingSummary(eventId),
  ]);

  return {
    event: {
      id: event.id,
      name: event.name,
      status: event.status,
      venue: event.venue,
      location: event.location ?? null,
      startDate: event.startDate,
      endDate: event.endDate,
      weather: event.weather ?? null,
      attendance: event.attendance,
      capacity: event.capacity,
    },
    crowd,
    parking,
    foodCourt: {
      ordersToday: event.foodOrders,
      demandLevel: deriveFoodCourtDemand(event.foodOrders, event.attendance),
    },
    generatedAt: new Date(),
  };
};
