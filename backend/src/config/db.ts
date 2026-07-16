import mongoose from "mongoose";
import { env } from "./env";

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
