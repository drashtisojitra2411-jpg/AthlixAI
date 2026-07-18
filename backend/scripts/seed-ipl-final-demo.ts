import mongoose from "mongoose";
import dns from "dns";
import { env } from "../src/config/env";
import { Event } from "../src/models/Event.model";
import { User } from "../src/models/User.model";
import { CrowdPrediction } from "../src/models/CrowdPrediction.model";
import { ParkingPrediction } from "../src/models/ParkingPrediction.model";
import { Tournament } from "../src/models/Tournament.model";
import { SeatRecommendation } from "../src/models/SeatRecommendation.model";
import { EmergencyReport } from "../src/models/EmergencyReport.model";
import { ChatHistory } from "../src/models/ChatHistory.model";
import {
  calculateCapacityPercent,
  deriveCrowdStatus,
  deriveRiskLevel,
} from "../src/services/crowdPrediction.service";
import {
  calculateOccupancyRate,
  deriveParkingStatus,
  deriveTrafficLevel,
} from "../src/services/parking.service";
import { deriveTournamentStatus } from "../src/services/tournament.service";
import {
  computeSeatRecommendation,
  type GenerateSeatRecommendationInput,
} from "../src/services/seatRecommendation.service";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const EVENT_NAME = "IPL 2026 Final";

/**
 * Populates the IPL 2026 Final demo event with a fully internally-consistent
 * data set across every existing operational model, so the dashboard, its
 * charts, and the AI copilot all read real numbers instead of empty states.
 * All derived values (seatsAvailable, occupancyPercentage, ticketRevenue,
 * crowd/parking status+risk, tournament status, seat fit scores) are computed
 * by the same functions the live app uses — nothing here is a hardcoded
 * dashboard value, only the raw inputs are authored.
 */

const ZONES = [
  { zone: "North Stand (Lower Bowl)", maxCount: 18000, currentCount: 17800 },
  { zone: "South Stand (Lower Bowl)", maxCount: 18000, currentCount: 17100 },
  { zone: "East Stand", maxCount: 15000, currentCount: 14100 },
  { zone: "West Stand", maxCount: 15000, currentCount: 13950 },
  { zone: "Grand Pavilion", maxCount: 12000, currentCount: 11760 },
  { zone: "Corporate Boxes", maxCount: 8000, currentCount: 6800 },
  { zone: "Skyline Terrace", maxCount: 9000, currentCount: 8730 },
  { zone: "General Bowl", maxCount: 5000, currentCount: 5000 },
];

const PARKING_LOTS = [
  { lot: "Lot A — Gate 1", totalSpaces: 2200, occupiedSpaces: 2050, walkingMinutes: 8, gate: "Gate 1" },
  { lot: "Lot B — Gate 4", totalSpaces: 2000, occupiedSpaces: 1850, walkingMinutes: 10, gate: "Gate 4" },
  { lot: "Lot C — VIP", totalSpaces: 800, occupiedSpaces: 700, walkingMinutes: 3, gate: "VIP Gate" },
  { lot: "Lot D — Gate 7", totalSpaces: 1800, occupiedSpaces: 1610, walkingMinutes: 12, gate: "Gate 7" },
  { lot: "Lot E — Gate 9 (Overflow)", totalSpaces: 1200, occupiedSpaces: 1000, walkingMinutes: 15, gate: "Gate 9" },
];

const TOURNAMENT_MATCHES = [
  {
    time: "Jul 14, 2026 · 7:30 PM",
    teamA: "Mumbai Indians",
    teamB: "Gujarat Titans",
    venue: "Narendra Modi Stadium",
    status: "completed" as const,
    score: "Mumbai Indians won by 6 wickets",
  },
  {
    time: "Jul 15, 2026 · 7:30 PM",
    teamA: "Chennai Super Kings",
    teamB: "Rajasthan Royals",
    venue: "Narendra Modi Stadium",
    status: "completed" as const,
    score: "Chennai Super Kings won by 22 runs",
  },
  {
    time: "Jul 17, 2026 · 7:30 PM",
    teamA: "Gujarat Titans",
    teamB: "Chennai Super Kings",
    venue: "Narendra Modi Stadium",
    status: "completed" as const,
    score: "Chennai Super Kings won by 4 wickets",
  },
  {
    time: "Jul 18, 2026 · 7:30 PM",
    teamA: "Mumbai Indians",
    teamB: "Chennai Super Kings",
    venue: "Narendra Modi Stadium",
    status: "active" as const,
  },
];

const SEAT_PROFILES: Array<Omit<GenerateSeatRecommendationInput, "user" | "event">> = [
  { budget: "elite", groupSize: 2, accessibility: false, vip: true, coveredSeating: true },
  { budget: "premium", groupSize: 4, accessibility: false, vip: false, coveredSeating: true },
  { budget: "premium", groupSize: 6, accessibility: true, vip: false, coveredSeating: false },
  { budget: "value", groupSize: 3, accessibility: false, vip: false, coveredSeating: false },
  { budget: "value", groupSize: 8, accessibility: false, vip: false, coveredSeating: false },
  { budget: "elite", groupSize: 4, accessibility: true, vip: true, coveredSeating: true },
];

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

async function seed(): Promise<void> {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is not set. Configure it in backend/.env before running this script.");
  }

  await mongoose.connect(env.mongodbUri);

  const event = await Event.findOne({ name: EVENT_NAME });
  if (!event) {
    throw new Error(`Event "${EVENT_NAME}" not found. Create it before running this script.`);
  }

  const organizer = await User.findById(event.organizer);
  if (!organizer) {
    throw new Error(`Organizer for "${EVENT_NAME}" not found.`);
  }

  // 1. Event business metrics — exact figures from the brief; seatsAvailable,
  // occupancyPercentage, and ticketRevenue are auto-computed by the model's
  // pre-validate hook on save.
  event.attendance = 95240;
  event.totalSeats = 100000;
  event.seatsBooked = 95240;
  event.averageTicketPrice = 2850;
  event.parkingCapacity = 8000;
  event.parkingOccupied = 7210;
  event.foodOrders = 18640;
  event.merchandiseSales = 5870;
  event.securityPersonnel = 420;
  event.medicalPersonnel = 62;
  event.entryGatesOpen = 76; // Narendra Modi Stadium's real gate count
  event.expectedRevenue = event.totalSeats * event.averageTicketPrice;
  await event.save();

  // 2. Crowd zones
  await CrowdPrediction.deleteMany({ event: event._id });
  for (const z of ZONES) {
    const capacity = calculateCapacityPercent(z.currentCount, z.maxCount);
    await CrowdPrediction.create({
      event: event._id,
      zone: z.zone,
      currentCount: z.currentCount,
      maxCount: z.maxCount,
      capacity,
      status: deriveCrowdStatus(capacity),
      riskLevel: deriveRiskLevel(capacity),
      predictedPeak: z.maxCount,
      recordedAt: new Date(),
    });
  }

  // 3. Parking lots
  await ParkingPrediction.deleteMany({ event: event._id });
  for (const lot of PARKING_LOTS) {
    const rate = calculateOccupancyRate(lot.occupiedSpaces, lot.totalSpaces);
    await ParkingPrediction.create({
      event: event._id,
      lot: lot.lot,
      totalSpaces: lot.totalSpaces,
      occupiedSpaces: lot.occupiedSpaces,
      status: deriveParkingStatus(rate),
      trafficLevel: deriveTrafficLevel(rate),
      walkingMinutes: lot.walkingMinutes,
      gate: lot.gate,
      recordedAt: new Date(),
    });
  }

  // 4. Tournament — road to the final
  await Tournament.deleteMany({ event: event._id });
  await Tournament.create({
    event: event._id,
    name: "IPL 2026 Playoffs",
    teams: ["Mumbai Indians", "Chennai Super Kings", "Gujarat Titans", "Rajasthan Royals"],
    matches: TOURNAMENT_MATCHES,
    status: deriveTournamentStatus(TOURNAMENT_MATCHES),
  });

  // 5. Seat recommendations — computed by the app's real fit-score/pricing logic
  await SeatRecommendation.deleteMany({ event: event._id });
  for (const profile of SEAT_PROFILES) {
    const input: GenerateSeatRecommendationInput = {
      user: organizer.id,
      event: event.id,
      ...profile,
    };
    const computation = computeSeatRecommendation(input);
    await SeatRecommendation.create({
      user: organizer._id,
      event: event._id,
      budget: profile.budget,
      groupSize: profile.groupSize,
      accessibility: profile.accessibility ?? false,
      vip: profile.vip ?? false,
      coveredSeating: profile.coveredSeating ?? false,
      ...computation,
    });
  }

  // 6. Emergency reports — resolved historical incidents (event is currently "All Clear")
  await EmergencyReport.deleteMany({ event: event._id });
  const resolvedReports = [
    {
      type: "medical" as const,
      severity: "low" as const,
      location: "Gate 4 Concourse",
      description: "Attendee felt dizzy from heat; treated on-site by medical team.",
      createdAt: hoursAgo(3),
      resolvedAt: hoursAgo(2.75),
    },
    {
      type: "lost-child" as const,
      severity: "medium" as const,
      location: "General Bowl, Section G12",
      description: "Child briefly separated from family; reunited via PA announcement.",
      createdAt: hoursAgo(2),
      resolvedAt: hoursAgo(1.8),
    },
    {
      type: "gate-blockage" as const,
      severity: "low" as const,
      location: "Gate 9 (Overflow)",
      description: "Temporary queue backup at overflow parking gate; resolved by adding staff.",
      createdAt: hoursAgo(1),
      resolvedAt: hoursAgo(0.7),
    },
  ];
  for (const report of resolvedReports) {
    await EmergencyReport.create({
      event: event._id,
      reportedBy: organizer._id,
      type: report.type,
      description: report.description,
      location: report.location,
      status: "resolved",
      severity: report.severity,
      createdAt: report.createdAt,
      resolvedAt: report.resolvedAt,
    });
  }

  // 7. Chat history — a couple of realistic ops Q&A exchanges grounded in the
  // crowd/parking figures seeded above.
  await ChatHistory.deleteMany({ event: event._id, user: organizer._id });
  await ChatHistory.create([
    {
      user: organizer._id,
      event: event._id,
      role: "user",
      message: "What's the current crowd situation across the stadium ahead of kickoff?",
      createdAt: hoursAgo(0.5),
    },
    {
      user: organizer._id,
      event: event._id,
      role: "assistant",
      message:
        "Occupancy is running high: 7 of 8 zones are in the critical range (93-100%), with North Stand leading at 99% and General Bowl officially sold out. Corporate Boxes is the only section still at warning level (85%). Recommend directing late arrivals toward Gate 9 overflow parking, which has the most remaining capacity.",
      prompt: "What's the current crowd situation across the stadium ahead of kickoff?",
      createdAt: hoursAgo(0.48),
      response: {
        recommendation: "Direct late arrivals to Gate 9 overflow parking and monitor Corporate Boxes entry.",
        summary:
          "7 of 8 zones are critical (93-100% full); General Bowl is sold out. Corporate Boxes is the only zone still at warning level.",
        confidence: 82,
        reasoning:
          "Zone occupancy is derived from live crowd snapshots across all 8 stands. North Stand and Grand Pavilion are within 2% of full capacity, so entry queues there should be watched closely as kickoff approaches.",
        suggestedActions: [],
        insights: [
          "North Stand and Grand Pavilion are within 2% of full capacity.",
          "General Bowl has officially sold out.",
        ],
        risks: ["If South Stand crosses 98%, entry queues may need a temporary hold."],
        riskLevel: "Moderate",
        actionCard: {
          riskLevel: "Moderate",
          topActions: ["Redirect arrivals to Gate 9 overflow parking", "Monitor South Stand entry rate"],
          expectedImpact: "Reduces bottleneck risk at peak entry by an estimated 15%.",
          confidence: 82,
        },
      },
    },
    {
      user: organizer._id,
      event: event._id,
      role: "user",
      message: "How's parking looking, and which lot would you recommend for fans arriving now?",
      createdAt: hoursAgo(0.3),
    },
    {
      user: organizer._id,
      event: event._id,
      role: "assistant",
      message:
        "Parking is at roughly 90% occupancy overall. Lot E (Gate 9 overflow) has the most remaining space at 200 open spots, though it's a 15-minute walk. For a shorter walk, VIP Gate parking still has about 100 spaces at just 3 minutes from the stadium.",
      prompt: "How's parking looking, and which lot would you recommend for fans arriving now?",
      createdAt: hoursAgo(0.28),
      response: {
        recommendation: "Route general arrivals to Lot E (Gate 9); route VIP/premium arrivals to the VIP Gate lot.",
        summary: "Parking is ~90% full overall; Lot E (Gate 9) has the most remaining capacity.",
        confidence: 78,
        reasoning:
          "Occupancy across all 5 lots is calculated from live space counts. No lot has crossed the 98% full threshold yet, so all lots remain open, but Lot E has the largest cushion.",
        suggestedActions: [],
        insights: ["Lot E (Gate 9) has 200 available spaces, the most of any lot."],
        risks: ["Lot C (VIP) is the smallest lot and could fill before kickoff."],
        riskLevel: "Low",
        actionCard: {
          riskLevel: "Low",
          topActions: ["Signpost Lot E for general arrivals", "Watch Lot C capacity near kickoff"],
          expectedImpact: "Balances parking load and reduces walk-in congestion at the busiest gates.",
          confidence: 78,
        },
      },
    },
  ]);

  console.log(`Seeded demo data for "${EVENT_NAME}":`);
  console.log(`  - Event business metrics updated (occupancy ${event.occupancyPercentage}%, ticket revenue ₹${event.ticketRevenue.toLocaleString()})`);
  console.log(`  - ${ZONES.length} crowd zones`);
  console.log(`  - ${PARKING_LOTS.length} parking lots`);
  console.log(`  - 1 tournament with ${TOURNAMENT_MATCHES.length} matches`);
  console.log(`  - ${SEAT_PROFILES.length} seat recommendations`);
  console.log(`  - ${resolvedReports.length} resolved emergency reports`);
  console.log(`  - 4 chat history messages`);

  await mongoose.disconnect();
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
  });
