import mongoose from "mongoose";
import dns from "dns";
import { env } from "../src/config/env";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

/**
 * One-time migration: moves attendance/weather out of Event.description
 * (where they were stuffed as text) into their own fields, and renames the
 * legacy "Active" status value to "Live". Uses the raw collection driver so
 * documents holding the now-invalid "Active" enum value can still be read
 * and written without failing schema validation.
 */
const DESCRIPTION_PATTERN = /Attendance:\s*([\d,]+)\s*\|\s*Weather:\s*(.+)/i;

async function migrate(): Promise<void> {
  if (!env.mongodbUri) {
    throw new Error("MONGODB_URI is not set. Configure it in backend/.env before running this script.");
  }

  await mongoose.connect(env.mongodbUri);
  const events = mongoose.connection.collection("events");

  let statusMigrated = 0;
  let fieldsMigrated = 0;

  const statusResult = await events.updateMany(
    { status: "Active" },
    { $set: { status: "Live" } }
  );
  statusMigrated = statusResult.modifiedCount;

  const cursor = events.find({ description: { $regex: DESCRIPTION_PATTERN } });
  for await (const doc of cursor) {
    const match = (doc.description as string).match(DESCRIPTION_PATTERN);
    if (!match) continue;

    const attendance = Number(match[1].replace(/,/g, ""));
    const weather = match[2].trim();
    const remainingDescription = doc.description
      .replace(DESCRIPTION_PATTERN, "")
      .trim();

    const update: Record<string, unknown> = { attendance, weather };
    const unset: Record<string, unknown> = {};
    if (remainingDescription) {
      update.description = remainingDescription;
    } else {
      unset.description = "";
    }

    await events.updateOne(
      { _id: doc._id },
      {
        $set: update,
        ...(Object.keys(unset).length ? { $unset: unset } : {}),
      }
    );
    fieldsMigrated += 1;
  }

  console.log(`Migrated status "Active" -> "Live" on ${statusMigrated} event(s).`);
  console.log(`Migrated attendance/weather out of description on ${fieldsMigrated} event(s).`);

  await mongoose.disconnect();
}

migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
