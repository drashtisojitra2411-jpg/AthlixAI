import { z } from "zod";

export const createEventSchema = z
  .object({
    name: z.string().trim().min(1, "Event name is required").max(150),
    description: z.string().trim().max(2000).optional(),
    venue: z.string().trim().min(1, "Venue is required").max(150),
    location: z.string().trim().max(200).optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    capacity: z.number().int().min(0, "Capacity cannot be negative"),
    coverImage: z.string().trim().url("Cover image must be a valid URL").optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  });

export const updateEventSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(2000).optional(),
    venue: z.string().trim().min(1).max(150).optional(),
    location: z.string().trim().max(200).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(["Upcoming", "Active", "Completed", "Cancelled"]).optional(),
    capacity: z.number().int().min(0).optional(),
    coverImage: z.string().trim().url("Cover image must be a valid URL").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate > data.startDate,
    { message: "End date must be after start date", path: ["endDate"] }
  );

export type CreateEventBody = z.infer<typeof createEventSchema>;
export type UpdateEventBody = z.infer<typeof updateEventSchema>;
