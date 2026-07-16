import { SEAT_RECOMMENDATION } from "../config/constants";
import {
  SeatRecommendation,
  type DistanceToAction,
  type ISeatRecommendation,
  type SeatBudget,
} from "../models/SeatRecommendation.model";
import { paginate, type PaginatedResult, type PaginationOptions } from "./utils/pagination";
import {
  assertEventExists,
  assertExists,
  assertUserExists,
  assertValidObjectId,
} from "./utils/queryHelpers";

export interface GenerateSeatRecommendationInput {
  user: string;
  event: string;
  budget: SeatBudget;
  groupSize: number;
  accessibility?: boolean;
  vip?: boolean;
  coveredSeating?: boolean;
}

export interface SeatRecommendationComputation {
  recommendedSection: string;
  pricePerSeat: number;
  fitScore: number;
  distanceToAction: DistanceToAction;
  reason: string;
}

export const computeSeatRecommendation = (
  input: GenerateSeatRecommendationInput
): SeatRecommendationComputation => {
  const accessibility = input.accessibility ?? false;
  const vip = input.vip ?? false;
  const coveredSeating = input.coveredSeating ?? false;

  let pricePerSeat = SEAT_RECOMMENDATION.BASE_PRICE_PER_SEAT[input.budget];
  if (vip) {
    pricePerSeat += SEAT_RECOMMENDATION.VIP_SURCHARGE;
  }
  if (coveredSeating) {
    pricePerSeat += SEAT_RECOMMENDATION.COVERED_SEATING_SURCHARGE;
  }
  if (input.groupSize >= SEAT_RECOMMENDATION.GROUP_DISCOUNT_THRESHOLD) {
    pricePerSeat = Math.max(
      0,
      pricePerSeat - SEAT_RECOMMENDATION.GROUP_DISCOUNT_PER_SEAT
    );
  }

  const recommendedSection = vip
    ? "VIP Suite"
    : SEAT_RECOMMENDATION.SECTION_BY_BUDGET[input.budget];

  const distanceToAction: DistanceToAction = vip
    ? "Trackside"
    : coveredSeating
      ? "Balanced"
      : (SEAT_RECOMMENDATION.DISTANCE_BY_BUDGET[input.budget] as DistanceToAction);

  const weights = SEAT_RECOMMENDATION.FIT_SCORE_WEIGHTS;
  let fitScore = weights.baseScore + weights.budgetMatch;
  fitScore += input.groupSize <= 6 ? weights.groupSizeFit : weights.groupSizeFit / 2;
  if (accessibility) {
    fitScore += weights.accessibilityMatch;
  }
  if (vip) {
    fitScore += weights.vipMatch;
  }
  if (coveredSeating) {
    fitScore += weights.coveredSeatingMatch;
  }
  fitScore = Math.min(SEAT_RECOMMENDATION.MAX_FIT_SCORE, Math.round(fitScore));

  const reasonParts = [
    `Matched to the ${input.budget} tier for a group of ${input.groupSize}.`,
  ];
  if (accessibility) {
    reasonParts.push("Accessible seating prioritized.");
  }
  if (vip) {
    reasonParts.push("VIP trackside access included.");
  }
  if (coveredSeating) {
    reasonParts.push("Covered seating for weather protection.");
  }

  return {
    recommendedSection,
    pricePerSeat,
    fitScore,
    distanceToAction,
    reason: reasonParts.join(" "),
  };
};

export const createSeatRecommendation = async (
  input: GenerateSeatRecommendationInput
): Promise<ISeatRecommendation> => {
  await Promise.all([assertEventExists(input.event), assertUserExists(input.user)]);

  const computation = computeSeatRecommendation(input);

  return SeatRecommendation.create({
    user: input.user,
    event: input.event,
    budget: input.budget,
    groupSize: input.groupSize,
    accessibility: input.accessibility ?? false,
    vip: input.vip ?? false,
    coveredSeating: input.coveredSeating ?? false,
    ...computation,
  });
};

export const getSeatRecommendationById = async (
  id: string
): Promise<ISeatRecommendation> => {
  assertValidObjectId(id, "Seat recommendation id");
  const recommendation = await SeatRecommendation.findById(id);
  return assertExists(recommendation, "Seat recommendation not found");
};

export const listSeatRecommendationsByUser = async (
  userId: string,
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<ISeatRecommendation>> => {
  await assertUserExists(userId);
  return paginate(SeatRecommendation, { user: userId }, pagination, {
    createdAt: -1,
  });
};

export const listSeatRecommendationsByEvent = async (
  eventId: string,
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<ISeatRecommendation>> => {
  await assertEventExists(eventId);
  return paginate(SeatRecommendation, { event: eventId }, pagination, {
    fitScore: -1,
  });
};

export const getTopRecommendationsForEvent = async (
  eventId: string,
  limit = 5
): Promise<ISeatRecommendation[]> => {
  await assertEventExists(eventId);
  return SeatRecommendation.find({ event: eventId })
    .sort({ fitScore: -1 })
    .limit(limit);
};

export const deleteSeatRecommendation = async (id: string): Promise<void> => {
  const recommendation = await getSeatRecommendationById(id);
  await recommendation.deleteOne();
};
