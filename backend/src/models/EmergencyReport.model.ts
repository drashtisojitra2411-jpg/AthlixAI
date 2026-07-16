import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type EmergencyType = "medical" | "fire" | "lost-child" | "security";
export type EmergencyStatus =
  | "reported"
  | "dispatched"
  | "in-progress"
  | "resolved";
export type EmergencySeverity = "low" | "medium" | "high" | "critical";

export interface IEmergencyReport extends Document {
  event: Types.ObjectId;
  reportedBy?: Types.ObjectId;
  type: EmergencyType;
  description?: string;
  location?: string;
  status: EmergencyStatus;
  severity: EmergencySeverity;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const emergencyReportSchema = new Schema<IEmergencyReport>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    reportedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: ["medical", "fire", "lost-child", "security"],
      required: [true, "Emergency type is required"],
    },
    description: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["reported", "dispatched", "in-progress", "resolved"],
      default: "reported",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

emergencyReportSchema.index({ event: 1, status: 1 });
emergencyReportSchema.index({ event: 1, type: 1 });
emergencyReportSchema.index({ createdAt: -1 });

export const EmergencyReport: Model<IEmergencyReport> =
  (mongoose.models.EmergencyReport as Model<IEmergencyReport>) ||
  mongoose.model<IEmergencyReport>("EmergencyReport", emergencyReportSchema);
