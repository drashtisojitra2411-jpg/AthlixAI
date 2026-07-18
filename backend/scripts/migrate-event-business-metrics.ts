import mongoose from "mongoose";
import dns from "dns";
import { env } from "../src/config/env";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

/**
 * One-time migration: backfills the new stadium business-metric fields
 * (seating, revenue, parking, staffing) on events created before those
 * fields existed. Uses the raw collection driver so it runs independently
 * of the current Mongoose schema/validators.
 *
 * Sensible-default formulas (used for any event without curated figures):
 *   totalSeats          = capacity (falls back to 0)
 *   seatsBooked         = attendance, capped at totalSeats (falls back to 0)
 *   averageTicketPrice  = 1500 (generic placeholder ticket price)
 *   parkingCapacity     = 20% of totalSeats
 *   parkingOccupied     = 60% of parkingCapacity
 *   foodOrders          = 30% of seatsBooked
 *   merchandiseSales    = seatsBooked * 50 (avg $50/head placeholder)
 *   entryGatesOpen      = 8
 *   securityPersonnel   = 1 per 500 seats
 *   medicalPersonnel    = 1 per 2000 seats
 *   expectedRevenue     = totalSeats * averageTicketPrice
 * seatsAvailable, occupancyPercentage, and ticketRevenue are always derived
 * from the above, mirroring the Event model's pre-validate hook.
 */

interface LegacyEventDoc {
  _id: mongoose.Types.ObjectId;
  name: string;
  capacity?: number;
  attendance?: number;
}

function buildDefaults(doc: LegacyEventDoc) {
  const totalSeats = doc.capacity ?? 0;
  const seatsBooked = Math.min(doc.attendance ?? 0, totalSeats);
  const averageTicketPrice = 1500;
  const parkingCapacity = Math.round(totalSeats * 0.2);
  const parkingOccupied = Math.round(parkingCapacity * 0.6);
  const foodOrders = Math.round(seatsBooked * 0.3);
  const merchandiseSales = seatsBooked * 50;
  const entryGatesOpen = 8;
  const securityPersonnel = Math.round(totalSeats / 500);
  const medicalPersonnel = Math.round(totalSeats / 2000);
  const expectedRevenue = totalSeats * averageTicketPrice;

  return {
    totalSeats,
    seatsBooked,
    averageTicketPrice,
    parkingCapacity,
    parkingOccupied,
    foodOrders,
    merchandiseSales,
    entryGatesOpen,
    securityPersonnel,
    medicalPersonnel,
    expectedRevenue,
  };
}

// Curated, realistic figures for the flagship demo event rather than the
// generic formula above — an IPL final sells out, so the placeholder ratios
// don't reflect it well.
const CURATED_DEMO_EVENTS: Record<string, ReturnType<typeof buildDefaults>> = {
  "IPL 2026 Final": {
    totalSeats: 100000,
    seatsBooked: 95000,
    averageTicketPrice: 2500,
    parkingCapacity: 20000,
    parkingOccupied: 15200,
    foodOrders: 42000,
    merchandiseSales: 3_800_000,
    entryGatesOpen: 14,
    securityPersonnel: 480,
    medicalPersonnel: 65,
    expectedRevenue: 250_000_000,
  },
};

function deriveComputedFields(metrics: ReturnType<typeof buildDefaults>) {
  const seatsAvailable = Math.max(metrics.totalSeats - metrics.seatsBooked, 0);
  const occupancyPercentage =
    metrics.totalSeats > 0 ? Math.round((metrics.seatsBooked / metrics.totalSeats) * 100) : 0;
  const ticketRevenue = metrics.seatsBooked * metrics.averageTicketPrice;
  return { seatsAvailable, occupancyPercentage, ticketRevenue };
}

async function migrate(): Promise<void> {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is not set. Configure it in backend/.env before running this script.");
  }

  await mongoose.connect(env.mongodbUri);
  const events = mongoose.connection.collection("events");

  let migrated = 0;

  const cursor = events.find<LegacyEventDoc>({ totalSeats: { $exists: false } });
  for await (const doc of cursor) {
    const metrics = CURATED_DEMO_EVENTS[doc.name] ?? buildDefaults(doc);
    const computed = deriveComputedFields(metrics);

    await events.updateOne(
      { _id: doc._id },
      { $set: { ...metrics, ...computed } }
    );
    migrated += 1;
  }

  console.log(`Backfilled business metrics on ${migrated} event(s).`);

  await mongoose.disconnect();
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
