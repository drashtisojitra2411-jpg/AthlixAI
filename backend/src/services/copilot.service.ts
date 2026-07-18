import { ChatHistory } from "../models/ChatHistory.model";
import { getEventOperationalSummary, getVisitorEventSummary } from "./dashboard.service";
import { calculateSlaInfo } from "./emergency.service";
import {
  askGemini,
  askGeminiVisitor,
  type CompactEventContext,
  type CopilotAskResult,
  type VisitorAskResult,
  type VisitorEventContext,
} from "./gemini";

export interface CopilotAskOutcome {
  context: CompactEventContext;
  response: CopilotAskResult;
}

const DEFAULT_WEATHER = "unavailable";
const MAX_ACTIVE_INCIDENTS_IN_CONTEXT = 3;

export const buildCompactContext = async (
  eventId: string,
  weather?: string
): Promise<CompactEventContext> => {
  const summary = await getEventOperationalSummary(eventId);

  const attendance = summary.crowd.zones.reduce((sum, zone) => sum + zone.currentCount, 0);
  const securityAlerts = summary.emergency.activeReports.filter(
    (report) => report.type === "security"
  ).length;
  const medicalAlerts = summary.emergency.activeReports.filter(
    (report) => report.type === "medical"
  ).length;

  const activeIncidents = summary.emergency.activeReports
    .slice(0, MAX_ACTIVE_INCIDENTS_IN_CONTEXT)
    .map((report) => ({
      type: report.type,
      severity: report.severity,
      location: report.location || "unspecified",
      minutesElapsed: calculateSlaInfo(report).minutesElapsed,
    }));

  return {
    eventName: summary.event.name,
    eventStatus: summary.event.status,
    attendance,
    capacity: summary.event.capacity,
    crowdPercentage: summary.crowd.averageCapacity,
    weather: weather?.trim() || DEFAULT_WEATHER,
    currentTime: new Date().toISOString(),
    tickets: {
      totalSeats: summary.event.totalSeats,
      seatsBooked: summary.event.seatsBooked,
      seatsAvailable: summary.event.seatsAvailable,
      occupancyPercentage: summary.event.occupancyPercentage,
      averageTicketPrice: summary.event.averageTicketPrice,
    },
    parking: {
      capacity: summary.parking.totalSpaces,
      occupied: summary.parking.totalOccupied,
      occupancyPercentage: summary.parking.overallOccupancyRate,
      lotsAvailable: summary.parking.statusBreakdown.available,
      lotsWarning: summary.parking.statusBreakdown.warning,
      lotsFull: summary.parking.statusBreakdown.full,
    },
    revenue: {
      ticketRevenue: summary.event.ticketRevenue,
      expectedRevenue: summary.event.expectedRevenue,
      foodOrders: summary.event.foodOrders,
      merchandiseSales: summary.event.merchandiseSales,
    },
    emergency: {
      activeCount: summary.emergency.totalActive,
      resolvedCount: summary.emergency.totalResolved,
      securityAlerts,
      medicalAlerts,
      breachedSlaCount: summary.emergency.breachedSlaCount,
      activeIncidents,
    },
  };
};

export const askCopilot = async (
  userId: string,
  eventId: string,
  prompt: string,
  weather?: string
): Promise<CopilotAskOutcome> => {
  const context = await buildCompactContext(eventId, weather);
  const response = await askGemini(prompt, context);

  await ChatHistory.create([
    {
      user: userId,
      event: eventId,
      role: "user",
      message: prompt,
    },
    {
      user: userId,
      event: eventId,
      role: "assistant",
      message: response.summary,
      prompt,
      response: {
        recommendation: response.actionCard.topActions[0] ?? response.summary,
        summary: response.summary,
        confidence: response.actionCard.confidence,
        reasoning: response.insights.join(" ") || response.summary,
        suggestedActions: [],
        insights: response.insights,
        risks: response.risks,
        riskLevel: response.riskLevel,
        actionCard: response.actionCard,
      },
    },
  ]);

  return { context, response };
};

/* ============================================================
 * Visitor AI Assistant — pure addition below this line.
 *
 * Nothing above is modified. Deliberately built on getVisitorEventSummary
 * (not getEventOperationalSummary) so revenue/security data never reaches
 * this path. Also deliberately does NOT write to ChatHistory — that
 * collection is read unfiltered-by-role for the Organizer dashboard's
 * engagement widget (totalChatInteractions/recentMessages), and persisting
 * visitor Q&A there would silently inflate Organizer-visible numbers.
 * ============================================================ */

export interface VisitorCopilotAskOutcome {
  context: VisitorEventContext;
  response: VisitorAskResult;
}

export const buildVisitorContext = async (eventId: string): Promise<VisitorEventContext> => {
  const summary = await getVisitorEventSummary(eventId);

  return {
    eventName: summary.event.name,
    eventStatus: summary.event.status,
    venue: summary.event.venue,
    startDate: summary.event.startDate.toISOString(),
    endDate: summary.event.endDate.toISOString(),
    weather: summary.event.weather ?? "unavailable",
    crowdPercentage: summary.crowd.averageCapacity,
    parking: {
      occupancyPercentage: summary.parking.overallOccupancyRate,
      recommendedLot: summary.parking.recommendedLot?.lot ?? null,
      walkingMinutes: summary.parking.recommendedLot?.walkingMinutes ?? null,
    },
    foodCourt: {
      demandLevel: summary.foodCourt.demandLevel,
    },
  };
};

export const askVisitorCopilot = async (
  eventId: string,
  prompt: string
): Promise<VisitorCopilotAskOutcome> => {
  const context = await buildVisitorContext(eventId);
  const response = await askGeminiVisitor(prompt, context);

  return { context, response };
};
