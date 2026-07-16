import bcrypt from "bcrypt";
import mongoose, { Schema, type Document, type Model } from "mongoose";
import { env } from "../config/env";

export type UserRole = "Admin" | "Organizer" | "Visitor";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["Admin", "Organizer", "Visitor"],
      default: "Visitor",
    },
    avatar: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(env.bcryptSaltRounds);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (
  this: IUser,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const sanitized = ret as unknown as Record<string, unknown>;
    delete sanitized.password;
    delete sanitized.__v;
    return sanitized;
  },
});

export const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", userSchema);
