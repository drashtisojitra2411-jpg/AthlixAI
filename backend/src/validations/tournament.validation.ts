import { z } from "zod";
import { objectIdSchema } from "./common.validation";

export const createTournamentSchema = z.object({
  event: objectIdSchema,
  name: z.string().trim().min(1, "Tournament name is required").max(150),
  teams: z.array(z.string().trim().min(1)).optional(),
});

export const updateTournamentSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    teams: z.array(z.string().trim().min(1)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const teamNameSchema = z.object({
  teamName: z.string().trim().min(1, "Team name is required"),
});

export const addMatchSchema = z.object({
  time: z.string().trim().min(1, "Match time is required"),
  teamA: z.string().trim().min(1, "Team A is required"),
  teamB: z.string().trim().min(1, "Team B is required"),
  venue: z.string().trim().min(1, "Match venue is required"),
});

export const updateMatchSchema = z
  .object({
    time: z.string().trim().min(1).optional(),
    teamA: z.string().trim().min(1).optional(),
    teamB: z.string().trim().min(1).optional(),
    venue: z.string().trim().min(1).optional(),
    status: z.enum(["upcoming", "active", "completed"]).optional(),
    score: z.string().trim().min(1).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateTournamentBody = z.infer<typeof createTournamentSchema>;
export type UpdateTournamentBody = z.infer<typeof updateTournamentSchema>;
export type TeamNameBody = z.infer<typeof teamNameSchema>;
export type AddMatchBody = z.infer<typeof addMatchSchema>;
export type UpdateMatchBody = z.infer<typeof updateMatchSchema>;
