import mongoose from "mongoose";
import { PARKING } from "../config/constants";
import {
  ParkingPrediction,
  type IParkingPrediction,
  type ParkingStatus,
  type TrafficLevel,
} from "../models/ParkingPrediction.model";
import { ApiError } from "../utils/ApiError";
import { paginate, type PaginatedResult, type PaginationOptions } from "./utils/pagination";
import { assertEventExists, assertExists, assertValidObjectId } from "./utils/queryHelpers";

export interface CreateParkingPredictionInput {
  event: string;
  lot: string;
  totalSpaces: number;
  occupiedSpaces: number;
  walkingMinutes: number;
  gate: string;
  recordedAt?: Date;
}

export interface UpdateParkingPredictionInput {
  totalSpaces?: number;
  occupiedSpaces?: number;
  walkingMinutes?: number;
  gate?: string;
  recordedAt?: Date;
}

export interface ParkingPredictionFilters {
  lot?: string;
  status?: ParkingStatus;
}

export interface ParkingLotSnapshot {
  lot: string;
  totalSpaces: number;
  occupiedSpaces: number;
  availableSpaces: number;
  occupancyRate: number;
  status: ParkingStatus;
  trafficLevel: TrafficLevel;
  walkingMinutes: number;
  gate: string;
  recordedAt: Date;
}

export interface EventParkingSummary {
  event: string;
  lotCount: number;
  totalSpaces: number;
  totalOccupied: number;
  totalAvailable: number;
  overallOccupancyRate: number;
  statusBreakdown: Record<ParkingStatus, number>;
  recommendedLot: ParkingLotSnapshot | null;
  lots: ParkingLotSnapshot[];
}

export const calculateOccupancyRate = (
  occupiedSpaces: number,
  totalSpaces: number
): number => {
  if (totalSpaces <= 0) {
    throw new ApiError(400, "Total spaces must be greater than zero");
  }
  if (occupiedSpaces < 0) {
    throw new ApiError(400, "Occupied spaces cannot be negative");
  }

  const rawRate = (occupiedSpaces / totalSpaces) * 100;
  return Math.min(100, Math.max(0, Math.round(rawRate)));
};

export const deriveParkingStatus = (occupancyRate: number): ParkingStatus => {
  if (occupancyRate >= PARKING.FULL_OCCUPANCY_THRESHOLD) {
    return "full";
  }
  if (occupancyRate >= PARKING.WARNING_OCCUPANCY_THRESHOLD) {
    return "warning";
  }
  return "available";
};

export const deriveTrafficLevel = (occupancyRate: number): TrafficLevel => {
  if (occupancyRate <= PARKING.TRAFFIC_LOW_MAX_OCCUPANCY) {
    return "Low";
  }
  if (occupancyRate <= PARKING.TRAFFIC_MODERATE_MAX_OCCUPANCY) {
    return "Moderate";
  }
  return "High";
};

const toLotSnapshot = (doc: IParkingPrediction): ParkingLotSnapshot => ({
  lot: doc.lot,
  totalSpaces: doc.totalSpaces,
  occupiedSpaces: doc.occupiedSpaces,
  availableSpaces: Math.max(0, doc.totalSpaces - doc.occupiedSpaces),
  occupancyRate: calculateOccupancyRate(doc.occupiedSpaces, doc.totalSpaces),
  status: doc.status,
  trafficLevel: doc.trafficLevel,
  walkingMinutes: doc.walkingMinutes,
  gate: doc.gate,
  recordedAt: doc.recordedAt,
});

export const createParkingPrediction = async (
  input: CreateParkingPredictionInput
): Promise<IParkingPrediction> => {
  await assertEventExists(input.event);

  const occupancyRate = calculateOccupancyRate(
    input.occupiedSpaces,
    input.totalSpaces
  );

  return ParkingPrediction.create({
    event: input.event,
    lot: input.lot,
    totalSpaces: input.totalSpaces,
    occupiedSpaces: input.occupiedSpaces,
    status: deriveParkingStatus(occupancyRate),
    trafficLevel: deriveTrafficLevel(occupancyRate),
    walkingMinutes: input.walkingMinutes,
    gate: input.gate,
    recordedAt: input.recordedAt ?? new Date(),
  });
};

export const getParkingPredictionById = async (
  id: string
): Promise<IParkingPrediction> => {
  assertValidObjectId(id, "Parking prediction id");
  const prediction = await ParkingPrediction.findById(id);
  return assertExists(prediction, "Parking prediction not found");
};

export const listParkingPredictionsByEvent = async (
  eventId: string,
  filters: ParkingPredictionFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<IParkingPrediction>> => {
  await assertEventExists(eventId);

  const filter: Record<string, unknown> = { event: eventId };
  if (filters.lot) {
    filter.lot = filters.lot;
  }
  if (filters.status) {
    filter.status = filters.status;
  }

  return paginate(ParkingPrediction, filter, pagination, { recordedAt: -1 });
};

export const getLatestLotSnapshots = async (
  eventId: string
): Promise<IParkingPrediction[]> => {
  await assertEventExists(eventId);

  return ParkingPrediction.aggregate<IParkingPrediction>([
    { $match: { event: new mongoose.Types.ObjectId(eventId) } },
    { $sort: { recordedAt: -1 } },
    {
      $group: {
        _id: "$lot",
        doc: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
    { $sort: { lot: 1 } },
  ]);
};

export const getEventParkingSummary = async (
  eventId: string
): Promise<EventParkingSummary> => {
  const latestLots = await getLatestLotSnapshots(eventId);

  const statusBreakdown: Record<ParkingStatus, number> = {
    available: 0,
    warning: 0,
    full: 0,
  };

  let totalSpaces = 0;
  let totalOccupied = 0;
  let recommendedLot: ParkingLotSnapshot | null = null;

  const lots = latestLots.map((doc) => {
    const snapshot = toLotSnapshot(doc);
    statusBreakdown[snapshot.status] += 1;
    totalSpaces += snapshot.totalSpaces;
    totalOccupied += snapshot.occupiedSpaces;

    if (snapshot.status !== "full") {
      const isBetterCandidate =
        !recommendedLot ||
        snapshot.availableSpaces > recommendedLot.availableSpaces ||
        (snapshot.availableSpaces === recommendedLot.availableSpaces &&
          snapshot.walkingMinutes < recommendedLot.walkingMinutes);

      if (isBetterCandidate) {
        recommendedLot = snapshot;
      }
    }

    return snapshot;
  });

  return {
    event: eventId,
    lotCount: lots.length,
    totalSpaces,
    totalOccupied,
    totalAvailable: Math.max(0, totalSpaces - totalOccupied),
    overallOccupancyRate:
      totalSpaces === 0 ? 0 : Math.round((totalOccupied / totalSpaces) * 100),
    statusBreakdown,
    recommendedLot,
    lots,
  };
};

export const updateParkingPrediction = async (
  id: string,
  updates: UpdateParkingPredictionInput
): Promise<IParkingPrediction> => {
  const prediction = await getParkingPredictionById(id);

  const nextTotalSpaces = updates.totalSpaces ?? prediction.totalSpaces;
  const nextOccupiedSpaces = updates.occupiedSpaces ?? prediction.occupiedSpaces;

  if (updates.totalSpaces !== undefined || updates.occupiedSpaces !== undefined) {
    const occupancyRate = calculateOccupancyRate(nextOccupiedSpaces, nextTotalSpaces);
    prediction.totalSpaces = nextTotalSpaces;
    prediction.occupiedSpaces = nextOccupiedSpaces;
    prediction.status = deriveParkingStatus(occupancyRate);
    prediction.trafficLevel = deriveTrafficLevel(occupancyRate);
  }

  if (updates.walkingMinutes !== undefined) {
    prediction.walkingMinutes = updates.walkingMinutes;
  }
  if (updates.gate !== undefined) {
    prediction.gate = updates.gate;
  }
  if (updates.recordedAt !== undefined) {
    prediction.recordedAt = updates.recordedAt;
  }

  await prediction.save();
  return prediction;
};

export const deleteParkingPrediction = async (id: string): Promise<void> => {
  const prediction = await getParkingPredictionById(id);
  await prediction.deleteOne();
};
