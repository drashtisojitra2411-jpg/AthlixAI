import { EMERGENCY } from "../config/constants";
import {
  EmergencyReport,
  type EmergencySeverity,
  type EmergencyStatus,
  type EmergencyType,
  type IEmergencyReport,
} from "../models/EmergencyReport.model";
import {
  askGeminiEmergencyPlan,
  type EmergencyAiRecommendation,
  type RiskLevel,
} from "./gemini";
import { getEventCrowdSummary } from "./crowdPrediction.service";
import { paginate, type PaginatedResult, type PaginationOptions } from "./utils/pagination";
import {
  assertEventExists,
  assertExists,
  assertUserExists,
  assertValidObjectId,
} from "./utils/queryHelpers";

export interface ReportEmergencyInput {
  event: string;
  reportedBy?: string;
  type: EmergencyType;
  description?: string;
  location?: string;
  severity?: EmergencySeverity;
}

export interface EmergencyReportFilters {
  status?: EmergencyStatus;
  type?: EmergencyType;
  severity?: EmergencySeverity;
}

export interface EmergencySlaInfo {
  slaMinutes: number;
  minutesElapsed: number;
  isBreached: boolean;
}

export interface EventEmergencySummary {
  event: string;
  totalActive: number;
  totalResolved: number;
  severityBreakdown: Record<EmergencySeverity, number>;
  typeBreakdown: Record<EmergencyType, number>;
  breachedSlaCount: number;
  activeReports: IEmergencyReport[];
}

const ACTIVE_STATUSES: EmergencyStatus[] = [...EMERGENCY.ACTIVE_STATUSES];

export const calculateSlaInfo = (report: IEmergencyReport): EmergencySlaInfo => {
  const slaMinutes = EMERGENCY.SEVERITY_SLA_MINUTES[report.severity];
  const referenceTime = report.resolvedAt ?? new Date();
  const minutesElapsed = Math.max(
    0,
    Math.round(
      (referenceTime.getTime() - report.createdAt.getTime()) / (60 * 1000)
    )
  );

  return {
    slaMinutes,
    minutesElapsed,
    isBreached: report.status !== "resolved" && minutesElapsed > slaMinutes,
  };
};

export const reportEmergency = async (
  input: ReportEmergencyInput
): Promise<IEmergencyReport> => {
  await assertEventExists(input.event);
  if (input.reportedBy) {
    await assertUserExists(input.reportedBy);
  }

  return EmergencyReport.create({
    event: input.event,
    reportedBy: input.reportedBy ?? null,
    type: input.type,
    description: input.description,
    location: input.location,
    severity: input.severity ?? "medium",
    status: "reported",
  });
};

export const getEmergencyReportById = async (
  id: string
): Promise<IEmergencyReport> => {
  assertValidObjectId(id, "Emergency report id");
  const report = await EmergencyReport.findById(id);
  return assertExists(report, "Emergency report not found");
};

export const listEmergencyReportsByEvent = async (
  eventId: string,
  filters: EmergencyReportFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<IEmergencyReport>> => {
  await assertEventExists(eventId);

  const filter: Record<string, unknown> = { event: eventId };
  if (filters.status) {
    filter.status = filters.status;
  }
  if (filters.type) {
    filter.type = filters.type;
  }
  if (filters.severity) {
    filter.severity = filters.severity;
  }

  return paginate(EmergencyReport, filter, pagination, { createdAt: -1 });
};

export const listActiveEmergencies = async (
  eventId: string
): Promise<IEmergencyReport[]> => {
  await assertEventExists(eventId);
  return EmergencyReport.find({
    event: eventId,
    status: { $in: ACTIVE_STATUSES },
  }).sort({ createdAt: -1 });
};

export const updateEmergencyStatus = async (
  id: string,
  status: EmergencyStatus
): Promise<IEmergencyReport> => {
  const report = await getEmergencyReportById(id);

  report.status = status;
  report.resolvedAt = status === "resolved" ? new Date() : undefined;

  await report.save();
  return report;
};

export const getEventEmergencySummary = async (
  eventId: string
): Promise<EventEmergencySummary> => {
  await assertEventExists(eventId);

  const reports = await EmergencyReport.find({ event: eventId }).sort({
    createdAt: -1,
  });

  const severityBreakdown: Record<EmergencySeverity, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };
  const typeBreakdown: Record<EmergencyType, number> = {
    medical: 0,
    fire: 0,
    "lost-child": 0,
    security: 0,
    "crowd-surge": 0,
    "gate-blockage": 0,
    "weather-alert": 0,
  };

  let totalActive = 0;
  let totalResolved = 0;
  let breachedSlaCount = 0;
  const activeReports: IEmergencyReport[] = [];

  for (const report of reports) {
    severityBreakdown[report.severity] += 1;
    typeBreakdown[report.type] += 1;

    if (report.status === "resolved") {
      totalResolved += 1;
    } else {
      totalActive += 1;
      activeReports.push(report);
    }

    if (calculateSlaInfo(report).isBreached) {
      breachedSlaCount += 1;
    }
  }

  return {
    event: eventId,
    totalActive,
    totalResolved,
    severityBreakdown,
    typeBreakdown,
    breachedSlaCount,
    activeReports,
  };
};

export const deleteEmergencyReport = async (id: string): Promise<void> => {
  const report = await getEmergencyReportById(id);
  await report.deleteOne();
};

/* ============================================================
 * Emergency Command Center — AI response recommendations.
 *
 * Pure addition below this line; nothing above is modified. Reuses the
 * existing Gemini backend (askGeminiEmergencyPlan) the same way
 * dashboard.service.ts reuses getEventEmergencySummary.
 * ============================================================ */

const SEVERITY_TO_RISK_LEVEL: Record<EmergencySeverity, RiskLevel> = {
  low: "Low",
  medium: "Moderate",
  high: "High",
  critical: "Critical",
};

export const getEmergencyAiRecommendation = async (
  id: string
): Promise<EmergencyAiRecommendation> => {
  const report = await getEmergencyReportById(id);
  const event = await assertEventExists(report.event.toString());
  const crowd = await getEventCrowdSummary(report.event.toString());
  const sla = calculateSlaInfo(report);

  const attendance = crowd.zones.reduce((sum, zone) => sum + zone.currentCount, 0);

  return askGeminiEmergencyPlan({
    incidentType: report.type,
    status: report.status,
    reportedSeverity: SEVERITY_TO_RISK_LEVEL[report.severity],
    location: report.location ?? "Unknown",
    description: report.description ?? "No description provided",
    minutesElapsed: sla.minutesElapsed,
    slaMinutes: sla.slaMinutes,
    isSlaBreached: sla.isBreached,
    eventName: event.name,
    attendance,
    crowdPercentage: crowd.averageCapacity,
    weather: "Unavailable",
  });
};

export interface DemoEmergencyScenario {
  eventId: string;
  type: EmergencyType;
  severity: EmergencySeverity;
  location?: string;
  description?: string;
}

/**
 * Presentation Mode ("Emergency" demo stage) — generates a real AI
 * recommendation for a scripted, non-persisted incident. Unlike
 * getEmergencyAiRecommendation, this never reads or writes an
 * EmergencyReport document: the incident fields come straight from the
 * request body. The event/crowd context is still real (read-only) so the
 * recommendation reads as grounded in the same data the rest of the demo
 * shows, but nothing about the scenario itself touches the database.
 */
export const getDemoEmergencyAiRecommendation = async (
  scenario: DemoEmergencyScenario
): Promise<EmergencyAiRecommendation> => {
  const event = await assertEventExists(scenario.eventId);
  const crowd = await getEventCrowdSummary(scenario.eventId);
  const slaMinutes = EMERGENCY.SEVERITY_SLA_MINUTES[scenario.severity];
  const attendance = crowd.zones.reduce((sum, zone) => sum + zone.currentCount, 0);

  return askGeminiEmergencyPlan({
    incidentType: scenario.type,
    status: "reported",
    reportedSeverity: SEVERITY_TO_RISK_LEVEL[scenario.severity],
    location: scenario.location ?? "Unknown",
    description: scenario.description ?? "No description provided",
    minutesElapsed: 0,
    slaMinutes,
    isSlaBreached: false,
    eventName: event.name,
    attendance,
    crowdPercentage: crowd.averageCapacity,
    weather: "Unavailable",
  });
};
