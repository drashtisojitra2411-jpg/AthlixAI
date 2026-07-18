import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import { SEAT_BUDGET_TIERS } from "../config/constants";

export type SeatBudget = (typeof SEAT_BUDGET_TIERS)[number];
export type DistanceToAction = "Trackside" | "Lower Bowl" | "Balanced" | "Panoramic";

export interface ISeatRecommendation extends Document {
  user: Types.ObjectId;
  event: Types.ObjectId;
  budget: SeatBudget;
  groupSize: number;
  accessibility: boolean;
  vip: boolean;
  coveredSeating: boolean;
  recommendedSection: string;
  pricePerSeat: number;
  fitScore: number;
  distanceToAction: DistanceToAction;
  reason: string;
  createdAt: Date;
  updatedAt: Date;
}

const seatRecommendationSchema = new Schema<ISeatRecommendation>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    budget: {
      type: String,
      enum: [...SEAT_BUDGET_TIERS],
      required: [true, "Budget tier is required"],
    },
    groupSize: {
      type: Number,
      required: [true, "Group size is required"],
      min: 1,
    },
    accessibility: {
      type: Boolean,
      default: false,
    },
    vip: {
      type: Boolean,
      default: false,
    },
    coveredSeating: {
      type: Boolean,
      default: false,
    },
    recommendedSection: {
      type: String,
      required: [true, "Recommended section is required"],
      trim: true,
    },
    pricePerSeat: {
      type: Number,
      required: [true, "Price per seat is required"],
      min: 0,
    },
    fitScore: {
      type: Number,
      required: [true, "Fit score is required"],
      min: 0,
      max: 100,
    },
    distanceToAction: {
      type: String,
      enum: ["Trackside", "Lower Bowl", "Balanced", "Panoramic"],
      required: [true, "Distance to action is required"],
    },
    reason: {
      type: String,
      required: [true, "Reason is required"],
    },
  },
  { timestamps: true }
);

seatRecommendationSchema.index({ user: 1, event: 1 });
seatRecommendationSchema.index({ event: 1, fitScore: -1 });

export const SeatRecommendation: Model<ISeatRecommendation> =
  (mongoose.models.SeatRecommendation as Model<ISeatRecommendation>) ||
  mongoose.model<ISeatRecommendation>(
    "SeatRecommendation",
    seatRecommendationSchema
  );
