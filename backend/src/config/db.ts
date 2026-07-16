import mongoose from "mongoose";
import { env } from "./env";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

export const connectDB = async (): Promise<void> => {
  if (!env.mongodbUri) {
    console.warn("MONGODB_URI is not set. Skipping database connection.");
    return;
  }

  try {
    await mongoose.connect(env.mongodbUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
  }
};
