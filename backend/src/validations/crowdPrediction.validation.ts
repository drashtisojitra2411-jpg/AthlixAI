import { z } from "zod";
import { objectIdSchema } from "./common.validation";

export const createCrowdPredictionSchema = z.object({
  event: objectIdSchema,
  zone: z.string().trim().min(1, "Zone is required").max(100),
  currentCount: z.number().int().min(0, "Current count cannot be negative"),
  maxCount: z.number().int().positive("Max count must be greater than zero"),
  predictedPeak: z.number().int().min(0).optional(),
  recordedAt: z.coerce.date().optional(),
});

export const updateCrowdPredictionSchema = z
  .object({
    currentCount: z.number().int().min(0).optional(),
    maxCount: z.number().int().positive().optional(),
    predictedPeak: z.number().int().min(0).optional(),
    recordedAt: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateCrowdPredictionBody = z.infer<typeof createCrowdPredictionSchema>;
export type UpdateCrowdPredictionBody = z.infer<typeof updateCrowdPredictionSchema>;
