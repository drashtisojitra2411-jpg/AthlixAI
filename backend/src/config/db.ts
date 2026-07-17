import mongoose from "mongoose";
import { env } from "./env";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

// Fail fast instead of silently queueing operations: without this, any
// query issued while disconnected (e.g. at startup, or after a dropped
// connection) sits in Mongoose's buffer and only surfaces as an opaque
// "buffering timed out after 10000ms" error once a request happens to hit
// it — long after the real cause (no DB connection) occurred.
mongoose.set("bufferCommands", false);

const CONNECT_TIMEOUT_MS = 10_000;

/**
 * Strips credentials from a mongodb(+srv):// URI that might appear inside
 * a driver error message, so connection failures are never logged with the
 * username/password embedded in them.
 */
function sanitizeMongoErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  return message.replace(/mongodb(\+srv)?:\/\/[^@\s]+@/gi, "mongodb$1://<redacted>@");
}

export const connectDB = async (): Promise<void> => {
  if (!env.mongodbUri) {
    throw new Error(
      "MONGODB_URI is not set. Configure it in backend/.env before starting the server."
    );
  }

  try {
    await mongoose.connect(env.mongodbUri, {
      serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
      connectTimeoutMS: CONNECT_TIMEOUT_MS,
    });
    console.log("MongoDB connected successfully");
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${sanitizeMongoErrorMessage(error)}`);
  }
};
