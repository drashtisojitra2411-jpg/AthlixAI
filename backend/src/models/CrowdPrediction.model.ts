import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type CrowdStatus = "normal" | "warning" | "critical";
export type RiskLevel = "Low" | "Moderate" | "High";

export interface ICrowdPrediction extends Document {
  event: Types.ObjectId;
  zone: string;
  capacity: number;
  currentCount: number;
  maxCount: number;
  status: CrowdStatus;
  predictedPeak?: number;
  riskLevel: RiskLevel;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const crowdPredictionSchema = new Schema<ICrowdPrediction>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    zone: {
      type: String,
      required: [true, "Zone is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity percentage is required"],
      min: 0,
      max: 100,
    },
    currentCount: {
      type: Number,
      required: [true, "Current count is required"],
      min: 0,
    },
    maxCount: {
      type: Number,
      required: [true, "Max count is required"],
      min: 0,
    },
    status: {
      type: String,
      enum: ["normal", "warning", "critical"],
      default: "normal",
    },
    predictedPeak: {
      type: Number,
      default: null,
    },
    riskLevel: {
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

crowdPredictionSchema.index({ event: 1, zone: 1 });
crowdPredictionSchema.index({ event: 1, recordedAt: -1 });
crowdPredictionSchema.index({ status: 1 });

export const CrowdPrediction: Model<ICrowdPrediction> =
  (mongoose.models.CrowdPrediction as Model<ICrowdPrediction>) ||
  mongoose.model<ICrowdPrediction>("CrowdPrediction", crowdPredictionSchema);
