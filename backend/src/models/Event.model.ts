import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type EventStatus = "Upcoming" | "Active" | "Completed" | "Cancelled";

export interface IEvent extends Document {
  name: string;
  description?: string;
  venue: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  organizer: Types.ObjectId;
  capacity: number;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    status: {
      type: String,
      enum: ["Upcoming", "Active", "Completed", "Cancelled"],
      default: "Upcoming",
    },
    organizer: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Organizer is required"],
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [0, "Capacity cannot be negative"],
    },
    coverImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1, startDate: 1 });

export const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) ||
  mongoose.model<IEvent>("Event", eventSchema);
