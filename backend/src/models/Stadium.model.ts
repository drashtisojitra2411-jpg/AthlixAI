import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export interface IStadium extends Document {
  name: string;
  location: string;
  capacity: number;
  description?: string;
  image?: string;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stadiumSchema = new Schema<IStadium>(
  {
    name: {
      type: String,
      required: [true, "Stadium name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    capacity: {
      type: Number,
      required: [true, "Capacity is required"],
      min: [0, "Capacity cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
  },
  { timestamps: true }
);

stadiumSchema.index({ name: 1 });

export const Stadium: Model<IStadium> =
  (mongoose.models.Stadium as Model<IStadium>) ||
  mongoose.model<IStadium>("Stadium", stadiumSchema);
