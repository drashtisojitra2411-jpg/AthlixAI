import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";
import { SEAT_BUDGET_TIERS } from "../config/constants";

export type TicketCategory = (typeof SEAT_BUDGET_TIERS)[number];
export type BookingStatus = "confirmed";

export interface IBooking extends Document {
  user: Types.ObjectId;
  event: Types.ObjectId;
  ticketCategory: TicketCategory;
  quantity: number;
  pricePerSeat: number;
  totalAmount: number;
  status: BookingStatus;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
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
    ticketCategory: {
      type: String,
      enum: [...SEAT_BUDGET_TIERS],
      required: [true, "Ticket category is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    pricePerSeat: {
      type: Number,
      required: [true, "Price per seat is required"],
      min: [0, "Price per seat cannot be negative"],
    },
    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
    },
    status: {
      type: String,
      enum: ["confirmed"],
      default: "confirmed",
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });
bookingSchema.index({ event: 1 });

export const Booking: Model<IBooking> =
  (mongoose.models.Booking as Model<IBooking>) ||
  mongoose.model<IBooking>("Booking", bookingSchema);
