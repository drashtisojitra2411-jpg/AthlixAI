import { z } from "zod";
import { objectIdSchema } from "./common.validation";

export const generateSeatRecommendationSchema = z.object({
  user: objectIdSchema,
  event: objectIdSchema,
  budget: z.enum(["value", "premium", "elite"]),
  groupSize: z.number().int().positive("Group size must be at least 1"),
  accessibility: z.boolean().optional(),
  vip: z.boolean().optional(),
  coveredSeating: z.boolean().optional(),
});

export type GenerateSeatRecommendationBody = z.infer<
  typeof generateSeatRecommendationSchema
>;
