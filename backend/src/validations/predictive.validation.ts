import { z } from "zod";

const controlsSchema = z.object({
  attendanceChangePercent: z.number().min(-50).max(100),
  weather: z.string().trim().min(1).max(60),
  matchImportance: z.enum(["Low", "Medium", "High", "Critical"]),
  openGates: z.number().int().min(0).max(4),
  parkingAvailabilityPercent: z.number().min(0).max(100),
  securityStaffCount: z.number().int().min(0).max(1000),
  medicalStaffCount: z.number().int().min(0).max(1000),
});

const standRegionSchema = z.object({
  id: z.string().trim().min(1).max(60),
  label: z.string().trim().min(1).max(80),
});

export const runPredictionSchema = z.object({
  eventId: z.string().min(1, "Event id is required"),
  controls: controlsSchema,
  standRegions: z.array(standRegionSchema).min(1).max(20),
});

export type RunPredictionBody = z.infer<typeof runPredictionSchema>;
