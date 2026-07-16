import { z } from "zod";
import { objectIdSchema } from "./common.validation";

export const createParkingPredictionSchema = z.object({
  event: objectIdSchema,
  lot: z.string().trim().min(1, "Lot is required").max(100),
  totalSpaces: z.number().int().positive("Total spaces must be greater than zero"),
  occupiedSpaces: z.number().int().min(0, "Occupied spaces cannot be negative"),
  walkingMinutes: z.number().int().min(0, "Walking minutes cannot be negative"),
  gate: z.string().trim().min(1, "Gate is required").max(100),
  recordedAt: z.coerce.date().optional(),
});

export const updateParkingPredictionSchema = z
  .object({
    totalSpaces: z.number().int().positive().optional(),
    occupiedSpaces: z.number().int().min(0).optional(),
    walkingMinutes: z.number().int().min(0).optional(),
    gate: z.string().trim().min(1).max(100).optional(),
    recordedAt: z.coerce.date().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateParkingPredictionBody = z.infer<typeof createParkingPredictionSchema>;
export type UpdateParkingPredictionBody = z.infer<typeof updateParkingPredictionSchema>;
