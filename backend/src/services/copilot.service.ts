import { ChatHistory } from "../models/ChatHistory.model";
import { getEventOperationalSummary } from "./dashboard.service";
import { askGemini, type CompactEventContext, type CopilotAskResult } from "./gemini";

export interface CopilotAskOutcome {
  context: CompactEventContext;
  response: CopilotAskResult;
}

const DEFAULT_WEATHER = "unavailable";

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

  return {
    eventName: summary.event.name,
    attendance,
    crowdPercentage: summary.crowd.averageCapacity,
    parkingPercentage: summary.parking.overallOccupancyRate,
    securityAlerts,
    medicalAlerts,
    weather: weather?.trim() || DEFAULT_WEATHER,
    currentTime: new Date().toISOString(),
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
