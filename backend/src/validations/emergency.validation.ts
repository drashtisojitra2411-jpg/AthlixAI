import { z } from "zod";
import { objectIdSchema } from "./common.validation";

// reportedBy is intentionally not client-settable — the controller always
// sets it from the authenticated caller (req.user.id), so a report can
// never be attributed to another user.
export const reportEmergencySchema = z.object({
  event: objectIdSchema,
  type: z.enum([
    "medical",
    "fire",
    "lost-child",
    "security",
    "crowd-surge",
    "gate-blockage",
    "weather-alert",
  ]),
  description: z.string().trim().max(1000).optional(),
  location: z.string().trim().max(200).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export const updateEmergencyStatusSchema = z.object({
  status: z.enum(["reported", "dispatched", "in-progress", "resolved"]),
});

// Presentation Mode ("Emergency" demo stage) — generates an AI recommendation
// for a scenario incident that is never written to the database. The event
// is still real (read-only context), but type/severity/location/description
// describe a scripted, non-persisted incident.
export const demoEmergencyAiRecommendationSchema = z.object({
  eventId: objectIdSchema,
  type: z.enum([
    "medical",
    "fire",
    "lost-child",
    "security",
    "crowd-surge",
    "gate-blockage",
    "weather-alert",
  ]),
  severity: z.enum(["low", "medium", "high", "critical"]),
  location: z.string().trim().max(200).optional(),
  description: z.string().trim().max(1000).optional(),
});

export type ReportEmergencyBody = z.infer<typeof reportEmergencySchema>;
export type UpdateEmergencyStatusBody = z.infer<typeof updateEmergencyStatusSchema>;
export type DemoEmergencyAiRecommendationBody = z.infer<
  typeof demoEmergencyAiRecommendationSchema
>;
