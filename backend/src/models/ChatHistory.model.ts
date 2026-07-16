import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type ChatRole = "user" | "assistant";
export type CopilotActionVariant = "primary" | "secondary" | "ghost";
export type CopilotRiskLevel = "Low" | "Moderate" | "High" | "Critical";

export interface ICopilotAction {
  label: string;
  action: string;
  variant: CopilotActionVariant;
}

export interface ICopilotActionCard {
  riskLevel: CopilotRiskLevel;
  topActions: string[];
  expectedImpact: string;
  confidence: number;
}

export interface ICopilotResponse {
  recommendation: string;
  prediction?: string;
  summary: string;
  confidence: number;
  reasoning: string;
  suggestedActions: ICopilotAction[];
  // Additive fields for the Athlix AI Copilot command-center page (/dashboard/copilot).
  insights?: string[];
  risks?: string[];
  riskLevel?: CopilotRiskLevel;
  actionCard?: ICopilotActionCard;
}

export interface IChatHistory extends Document {
  user: Types.ObjectId;
  event?: Types.ObjectId;
  role: ChatRole;
  message: string;
  prompt?: string;
  response?: ICopilotResponse;
  createdAt: Date;
  updatedAt: Date;
}

const copilotActionSchema = new Schema<ICopilotAction>(
  {
    label: { type: String, required: true },
    action: { type: String, required: true },
    variant: {
      type: String,
      enum: ["primary", "secondary", "ghost"],
      default: "primary",
    },
  },
  { _id: false }
);

const copilotActionCardSchema = new Schema<ICopilotActionCard>(
  {
    riskLevel: {
      type: String,
      enum: ["Low", "Moderate", "High", "Critical"],
      required: true,
    },
    topActions: { type: [String], default: [] },
    expectedImpact: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
  },
  { _id: false }
);

const copilotResponseSchema = new Schema<ICopilotResponse>(
  {
    recommendation: { type: String, required: true },
    prediction: { type: String, default: null },
    summary: { type: String, required: true },
    confidence: { type: Number, required: true, min: 0, max: 100 },
    reasoning: { type: String, required: true },
    suggestedActions: {
      type: [copilotActionSchema],
      default: [],
    },
    insights: { type: [String], default: undefined },
    risks: { type: [String], default: undefined },
    riskLevel: {
      type: String,
      enum: ["Low", "Moderate", "High", "Critical"],
      default: undefined,
    },
    actionCard: { type: copilotActionCardSchema, default: undefined },
  },
  { _id: false }
);

const chatHistorySchema = new Schema<IChatHistory>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      default: null,
    },
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: [true, "Role is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    prompt: {
      type: String,
      default: null,
    },
    response: {
      type: copilotResponseSchema,
      default: null,
    },
  },
  { timestamps: true }
);

chatHistorySchema.index({ user: 1, createdAt: -1 });
chatHistorySchema.index({ user: 1, event: 1 });

export const ChatHistory: Model<IChatHistory> =
  (mongoose.models.ChatHistory as Model<IChatHistory>) ||
  mongoose.model<IChatHistory>("ChatHistory", chatHistorySchema);
