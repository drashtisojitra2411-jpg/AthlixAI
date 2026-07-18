import { z } from "zod";

export const createStadiumSchema = z.object({
  name: z.string().trim().min(1, "Stadium name is required").max(150),
  location: z.string().trim().min(1, "Location is required").max(200),
  capacity: z.number().int().min(0, "Capacity cannot be negative"),
  description: z.string().trim().max(2000).optional(),
  image: z.string().trim().url("Image must be a valid URL").optional(),
});

export const updateStadiumSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    location: z.string().trim().min(1).max(200).optional(),
    capacity: z.number().int().min(0).optional(),
    description: z.string().trim().max(2000).optional(),
    image: z.string().trim().url("Image must be a valid URL").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type CreateStadiumBody = z.infer<typeof createStadiumSchema>;
export type UpdateStadiumBody = z.infer<typeof updateStadiumSchema>;
