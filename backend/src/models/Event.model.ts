import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type EventStatus = "Upcoming" | "Live" | "Completed" | "Cancelled";

export interface IEvent extends Document {
  name: string;
  description?: string;
  venue: string;
  location?: string;
  stadium?: Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  organizer: Types.ObjectId;
  capacity: number;
  attendance: number;
  weather?: string;
  totalSeats: number;
  seatsBooked: number;
  seatsAvailable: number;
  occupancyPercentage: number;
  averageTicketPrice: number;
  ticketRevenue: number;
  expectedRevenue: number;
  parkingCapacity: number;
  parkingOccupied: number;
  foodOrders: number;
  merchandiseSales: number;
  entryGatesOpen: number;
  securityPersonnel: number;
  medicalPersonnel: number;
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
    stadium: {
      type: Schema.Types.ObjectId,
      ref: "Stadium",
      default: null,
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
      enum: ["Upcoming", "Live", "Completed", "Cancelled"],
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
    attendance: {
      type: Number,
      default: 0,
      min: [0, "Attendance cannot be negative"],
    },
    weather: {
      type: String,
      trim: true,
    },
    totalSeats: {
      type: Number,
      default: 0,
      min: [0, "Total seats cannot be negative"],
    },
    seatsBooked: {
      type: Number,
      default: 0,
      min: [0, "Seats booked cannot be negative"],
    },
    seatsAvailable: {
      type: Number,
      default: 0,
      min: [0, "Seats available cannot be negative"],
    },
    occupancyPercentage: {
      type: Number,
      default: 0,
      min: [0, "Occupancy percentage cannot be negative"],
    },
    averageTicketPrice: {
      type: Number,
      default: 0,
      min: [0, "Average ticket price cannot be negative"],
    },
    ticketRevenue: {
      type: Number,
      default: 0,
      min: [0, "Ticket revenue cannot be negative"],
    },
    expectedRevenue: {
      type: Number,
      default: 0,
      min: [0, "Expected revenue cannot be negative"],
    },
    parkingCapacity: {
      type: Number,
      default: 0,
      min: [0, "Parking capacity cannot be negative"],
    },
    parkingOccupied: {
      type: Number,
      default: 0,
      min: [0, "Parking occupied cannot be negative"],
    },
    foodOrders: {
      type: Number,
      default: 0,
      min: [0, "Food orders cannot be negative"],
    },
    merchandiseSales: {
      type: Number,
      default: 0,
      min: [0, "Merchandise sales cannot be negative"],
    },
    entryGatesOpen: {
      type: Number,
      default: 0,
      min: [0, "Entry gates open cannot be negative"],
    },
    securityPersonnel: {
      type: Number,
      default: 0,
      min: [0, "Security personnel cannot be negative"],
    },
    medicalPersonnel: {
      type: Number,
      default: 0,
      min: [0, "Medical personnel cannot be negative"],
    },
    coverImage: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// seatsAvailable, occupancyPercentage, and ticketRevenue are derived —
// recomputed here on every validate pass so they can never drift from
// totalSeats/seatsBooked/averageTicketPrice regardless of which code path
// (create, service update, etc.) touched those inputs.
eventSchema.pre("validate", function (next) {
  this.seatsAvailable = Math.max(this.totalSeats - this.seatsBooked, 0);
  this.occupancyPercentage =
    this.totalSeats > 0
      ? Math.round((this.seatsBooked / this.totalSeats) * 10000) / 100
      : 0;
  this.ticketRevenue = this.seatsBooked * this.averageTicketPrice;
  next();
});

eventSchema.index({ organizer: 1 });
eventSchema.index({ status: 1, startDate: 1 });

export const Event: Model<IEvent> =
  (mongoose.models.Event as Model<IEvent>) ||
  mongoose.model<IEvent>("Event", eventSchema);
