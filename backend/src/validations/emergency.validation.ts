import { z } from "zod";
import { objectIdSchema } from "./common.validation";

export const reportEmergencySchema = z.object({
  event: objectIdSchema,
  reportedBy: objectIdSchema.optional(),
  type: z.enum(["medical", "fire", "lost-child", "security"]),
  description: z.string().trim().max(1000).optional(),
  location: z.string().trim().max(200).optional(),
  severity: z.enum(["low", "medium", "high", "critical"]).optional(),
});

export const updateEmergencyStatusSchema = z.object({
  status: z.enum(["reported", "dispatched", "in-progress", "resolved"]),
});

export type ReportEmergencyBody = z.infer<typeof reportEmergencySchema>;
export type UpdateEmergencyStatusBody = z.infer<typeof updateEmergencyStatusSchema>;
