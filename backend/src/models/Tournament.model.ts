import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type TournamentStatus = "Scheduled" | "Ongoing" | "Completed";
export type MatchStatus = "upcoming" | "active" | "completed";

export interface ITournamentMatch {
  time: string;
  teamA: string;
  teamB: string;
  venue: string;
  status: MatchStatus;
  score?: string;
}

export interface ITournament extends Document {
  event: Types.ObjectId;
  name: string;
  teams: string[];
  matches: ITournamentMatch[];
  status: TournamentStatus;
  createdAt: Date;
  updatedAt: Date;
}

const tournamentMatchSchema = new Schema<ITournamentMatch>(
  {
    time: {
      type: String,
      required: [true, "Match time is required"],
    },
    teamA: {
      type: String,
      required: [true, "Team A is required"],
      trim: true,
    },
    teamB: {
      type: String,
      required: [true, "Team B is required"],
      trim: true,
    },
    venue: {
      type: String,
      required: [true, "Match venue is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },
    score: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

const tournamentSchema = new Schema<ITournament>(
  {
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event is required"],
    },
    name: {
      type: String,
      required: [true, "Tournament name is required"],
      trim: true,
    },
    teams: {
      type: [String],
      default: [],
    },
    matches: {
      type: [tournamentMatchSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ["Scheduled", "Ongoing", "Completed"],
      default: "Scheduled",
    },
  },
  { timestamps: true }
);

tournamentSchema.index({ event: 1 });
tournamentSchema.index({ status: 1 });
tournamentSchema.index({ "matches.time": 1 });

export const Tournament: Model<ITournament> =
  (mongoose.models.Tournament as Model<ITournament>) ||
  mongoose.model<ITournament>("Tournament", tournamentSchema);
