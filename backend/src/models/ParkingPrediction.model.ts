import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type ParkingStatus = "full" | "warning" | "available";
export type TrafficLevel = "Low" | "Moderate" | "High";

export interface IParkingPrediction extends Document {
  event: Types.ObjectId;
  lot: string;
  totalSpaces: number;
  occupiedSpaces: number;
  status: ParkingStatus;
  walkingMinutes: number;
  gate: string;
  trafficLevel: TrafficLevel;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const parkingPredictionSchema = new Schema<IParkingPrediction>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    lot: {
      type: String,
      required: [true, "Lot is required"],
      trim: true,
    },
    totalSpaces: {
      type: Number,
      required: [true, "Total spaces is required"],
      min: 0,
    },
    occupiedSpaces: {
      type: Number,
      required: [true, "Occupied spaces is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["full", "warning", "available"],
      default: "available",
    },
    walkingMinutes: {
      type: Number,
      required: [true, "Walking minutes is required"],
      min: 0,
    },
    gate: {
      type: String,
      required: [true, "Gate is required"],
      trim: true,
    },
    trafficLevel: {
      type: String,
      enum: ["Low", "Moderate", "High"],
      default: "Low",
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

parkingPredictionSchema.index({ event: 1, lot: 1 });
parkingPredictionSchema.index({ event: 1, recordedAt: -1 });
parkingPredictionSchema.index({ status: 1 });

export const ParkingPrediction: Model<IParkingPrediction> =
  (mongoose.models.ParkingPrediction as Model<IParkingPrediction>) ||
  mongoose.model<IParkingPrediction>(
    "ParkingPrediction",
    parkingPredictionSchema
  );
