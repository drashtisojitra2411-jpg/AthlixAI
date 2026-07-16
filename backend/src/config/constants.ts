export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

export const CROWD_PREDICTION = {
  WARNING_CAPACITY_THRESHOLD: 70,
  CRITICAL_CAPACITY_THRESHOLD: 90,
  RISK_LOW_MAX_CAPACITY: 50,
  RISK_MODERATE_MAX_CAPACITY: 80,
};

export const PARKING = {
  WARNING_OCCUPANCY_THRESHOLD: 80,
  FULL_OCCUPANCY_THRESHOLD: 98,
  TRAFFIC_LOW_MAX_OCCUPANCY: 40,
  TRAFFIC_MODERATE_MAX_OCCUPANCY: 75,
};

export const SEAT_RECOMMENDATION = {
  BASE_PRICE_PER_SEAT: {
    value: 40,
    premium: 90,
    elite: 180,
  },
  VIP_SURCHARGE: 60,
  COVERED_SEATING_SURCHARGE: 15,
  GROUP_DISCOUNT_THRESHOLD: 4,
  GROUP_DISCOUNT_PER_SEAT: 5,
  SECTION_BY_BUDGET: {
    value: "General Bowl",
    premium: "Club Level",
    elite: "Owner's Suite",
  },
  DISTANCE_BY_BUDGET: {
    value: "Panoramic",
    premium: "Balanced",
    elite: "Trackside",
  },
  FIT_SCORE_WEIGHTS: {
    baseScore: 40,
    budgetMatch: 20,
    groupSizeFit: 15,
    accessibilityMatch: 10,
    vipMatch: 10,
    coveredSeatingMatch: 5,
  },
  MAX_FIT_SCORE: 100,
};

export const EMERGENCY = {
  SEVERITY_SLA_MINUTES: {
    critical: 5,
    high: 15,
    medium: 30,
    low: 60,
  },
  ACTIVE_STATUSES: ["reported", "dispatched", "in-progress"] as const,
};

export const TOURNAMENT = {
  DEFAULT_MATCH_STATUS: "upcoming",
};

export const DASHBOARD = {
  RECENT_EMERGENCY_LIMIT: 5,
  RECENT_CHAT_LIMIT: 10,
  TOP_SEAT_RECOMMENDATION_LIMIT: 5,
};
