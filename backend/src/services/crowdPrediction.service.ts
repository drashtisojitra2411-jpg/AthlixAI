import mongoose from "mongoose";
import { CROWD_PREDICTION } from "../config/constants";
import {
  CrowdPrediction,
  type CrowdStatus,
  type ICrowdPrediction,
  type RiskLevel,
} from "../models/CrowdPrediction.model";
import { ApiError } from "../utils/ApiError";
import { paginate, type PaginatedResult, type PaginationOptions } from "./utils/pagination";
import { assertEventExists, assertExists, assertValidObjectId } from "./utils/queryHelpers";

export interface CreateCrowdPredictionInput {
  event: string;
  zone: string;
  currentCount: number;
  maxCount: number;
  predictedPeak?: number;
  recordedAt?: Date;
}

export interface UpdateCrowdPredictionInput {
  currentCount?: number;
  maxCount?: number;
  predictedPeak?: number;
  recordedAt?: Date;
}

export interface CrowdPredictionFilters {
  zone?: string;
  status?: CrowdStatus;
}

export interface CrowdZoneSnapshot {
  zone: string;
  capacity: number;
  currentCount: number;
  maxCount: number;
  status: CrowdStatus;
  riskLevel: RiskLevel;
  predictedPeak: number | null;
  recordedAt: Date;
}

export interface EventCrowdSummary {
  event: string;
  zoneCount: number;
  averageCapacity: number;
  highestRiskLevel: RiskLevel;
  statusBreakdown: Record<CrowdStatus, number>;
  criticalZones: CrowdZoneSnapshot[];
  zones: CrowdZoneSnapshot[];
}

const RISK_ORDER: RiskLevel[] = ["Low", "Moderate", "High"];

export const calculateCapacityPercent = (
  currentCount: number,
  maxCount: number
): number => {
  if (maxCount <= 0) {
    throw new ApiError(400, "Max count must be greater than zero");
  }
  if (currentCount < 0) {
    throw new ApiError(400, "Current count cannot be negative");
  }

  const rawPercent = (currentCount / maxCount) * 100;
  return Math.min(100, Math.max(0, Math.round(rawPercent)));
};

export const deriveCrowdStatus = (capacity: number): CrowdStatus => {
  if (capacity >= CROWD_PREDICTION.CRITICAL_CAPACITY_THRESHOLD) {
    return "critical";
  }
  if (capacity >= CROWD_PREDICTION.WARNING_CAPACITY_THRESHOLD) {
    return "warning";
  }
  return "normal";
};

export const deriveRiskLevel = (capacity: number): RiskLevel => {
  if (capacity <= CROWD_PREDICTION.RISK_LOW_MAX_CAPACITY) {
    return "Low";
  }
  if (capacity <= CROWD_PREDICTION.RISK_MODERATE_MAX_CAPACITY) {
    return "Moderate";
  }
  return "High";
};

const toZoneSnapshot = (doc: ICrowdPrediction): CrowdZoneSnapshot => ({
  zone: doc.zone,
  capacity: doc.capacity,
  currentCount: doc.currentCount,
  maxCount: doc.maxCount,
  status: doc.status,
  riskLevel: doc.riskLevel,
  predictedPeak: doc.predictedPeak ?? null,
  recordedAt: doc.recordedAt,
});

export const createCrowdPrediction = async (
  input: CreateCrowdPredictionInput
): Promise<ICrowdPrediction> => {
  await assertEventExists(input.event);

  const capacity = calculateCapacityPercent(input.currentCount, input.maxCount);

  return CrowdPrediction.create({
    event: input.event,
    zone: input.zone,
    currentCount: input.currentCount,
    maxCount: input.maxCount,
    capacity,
    status: deriveCrowdStatus(capacity),
    riskLevel: deriveRiskLevel(capacity),
    predictedPeak: input.predictedPeak ?? null,
    recordedAt: input.recordedAt ?? new Date(),
  });
};

export const getCrowdPredictionById = async (
  id: string
): Promise<ICrowdPrediction> => {
  assertValidObjectId(id, "Crowd prediction id");
  const prediction = await CrowdPrediction.findById(id);
  return assertExists(prediction, "Crowd prediction not found");
};

export const listCrowdPredictionsByEvent = async (
  eventId: string,
  filters: CrowdPredictionFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<ICrowdPrediction>> => {
  await assertEventExists(eventId);

  const filter: Record<string, unknown> = { event: eventId };
  if (filters.zone) {
    filter.zone = filters.zone;
  }
  if (filters.status) {
    filter.status = filters.status;
  }

  return paginate(CrowdPrediction, filter, pagination, { recordedAt: -1 });
};

export const getLatestZoneSnapshots = async (
  eventId: string
): Promise<ICrowdPrediction[]> => {
  await assertEventExists(eventId);

  return CrowdPrediction.aggregate<ICrowdPrediction>([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    { $sort: { recordedAt: -1 } },
    {
      $group: {
        _id: "$zone",
        doc: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
    { $sort: { zone: 1 } },
  ]);
};

export const getEventCrowdSummary = async (
  eventId: string
): Promise<EventCrowdSummary> => {
  const latestZones = await getLatestZoneSnapshots(eventId);

  const statusBreakdown: Record<CrowdStatus, number> = {
    normal: 0,
    warning: 0,
    critical: 0,
  };

  let capacitySum = 0;
  let highestRiskLevel: RiskLevel = "Low";

  const zones = latestZones.map((doc) => {
    const snapshot = toZoneSnapshot(doc);
    statusBreakdown[snapshot.status] += 1;
    capacitySum += snapshot.capacity;
    if (RISK_ORDER.indexOf(snapshot.riskLevel) > RISK_ORDER.indexOf(highestRiskLevel)) {
      highestRiskLevel = snapshot.riskLevel;
    }
    return snapshot;
  });

  return {
    event: eventId,
    zoneCount: zones.length,
    averageCapacity: zones.length === 0 ? 0 : Math.round(capacitySum / zones.length),
    highestRiskLevel,
    statusBreakdown,
    criticalZones: zones.filter((zone) => zone.status === "critical"),
    zones,
  };
};

export const updateCrowdPrediction = async (
  id: string,
  updates: UpdateCrowdPredictionInput
): Promise<ICrowdPrediction> => {
  const prediction = await getCrowdPredictionById(id);

  const nextCurrentCount = updates.currentCount ?? prediction.currentCount;
  const nextMaxCount = updates.maxCount ?? prediction.maxCount;

  if (updates.currentCount !== undefined || updates.maxCount !== undefined) {
    const capacity = calculateCapacityPercent(nextCurrentCount, nextMaxCount);
    prediction.currentCount = nextCurrentCount;
    prediction.maxCount = nextMaxCount;
    prediction.capacity = capacity;
    prediction.status = deriveCrowdStatus(capacity);
    prediction.riskLevel = deriveRiskLevel(capacity);
  }

  if (updates.predictedPeak !== undefined) {
    prediction.predictedPeak = updates.predictedPeak;
  }
  if (updates.recordedAt !== undefined) {
    prediction.recordedAt = updates.recordedAt;
  }

  await prediction.save();
  return prediction;
};

export const deleteCrowdPrediction = async (id: string): Promise<void> => {
  const prediction = await getCrowdPredictionById(id);
  await prediction.deleteOne();
};
