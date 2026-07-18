import { z } from "zod";
import { objectIdSchema } from "./common.validation";

export const createEventSchema = z
  .object({
    name: z.string().trim().min(1, "Event name is required").max(150),
    description: z.string().trim().max(2000).optional(),
    venue: z.string().trim().min(1, "Venue is required").max(150),
    location: z.string().trim().max(200).optional(),
    stadium: objectIdSchema.optional(),
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    capacity: z.number().int().min(0, "Capacity cannot be negative"),
    attendance: z.number().int().min(0, "Attendance cannot be negative").optional(),
    weather: z.string().trim().max(100).optional(),
    totalSeats: z.number().int().min(0, "Total seats cannot be negative").optional(),
    seatsBooked: z.number().int().min(0, "Seats booked cannot be negative").optional(),
    averageTicketPrice: z.number().min(0, "Average ticket price cannot be negative").optional(),
    expectedRevenue: z.number().min(0, "Expected revenue cannot be negative").optional(),
    parkingCapacity: z.number().int().min(0, "Parking capacity cannot be negative").optional(),
    parkingOccupied: z.number().int().min(0, "Parking occupied cannot be negative").optional(),
    foodOrders: z.number().int().min(0, "Food orders cannot be negative").optional(),
    merchandiseSales: z.number().min(0, "Merchandise sales cannot be negative").optional(),
    entryGatesOpen: z.number().int().min(0, "Entry gates open cannot be negative").optional(),
    securityPersonnel: z.number().int().min(0, "Security personnel cannot be negative").optional(),
    medicalPersonnel: z.number().int().min(0, "Medical personnel cannot be negative").optional(),
    coverImage: z.string().trim().url("Cover image must be a valid URL").optional(),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine(
    (data) =>
      data.totalSeats === undefined ||
      data.seatsBooked === undefined ||
      data.seatsBooked <= data.totalSeats,
    { message: "Seats booked cannot exceed total seats", path: ["seatsBooked"] }
  )
  .refine(
    (data) =>
      data.parkingCapacity === undefined ||
      data.parkingOccupied === undefined ||
      data.parkingOccupied <= data.parkingCapacity,
    { message: "Parking occupied cannot exceed parking capacity", path: ["parkingOccupied"] }
  );

export const updateEventSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    description: z.string().trim().max(2000).optional(),
    venue: z.string().trim().min(1).max(150).optional(),
    location: z.string().trim().max(200).optional(),
    stadium: objectIdSchema.optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    status: z.enum(["Upcoming", "Live", "Completed", "Cancelled"]).optional(),
    capacity: z.number().int().min(0).optional(),
    attendance: z.number().int().min(0, "Attendance cannot be negative").optional(),
    weather: z.string().trim().max(100).optional(),
    totalSeats: z.number().int().min(0, "Total seats cannot be negative").optional(),
    seatsBooked: z.number().int().min(0, "Seats booked cannot be negative").optional(),
    averageTicketPrice: z.number().min(0, "Average ticket price cannot be negative").optional(),
    expectedRevenue: z.number().min(0, "Expected revenue cannot be negative").optional(),
    parkingCapacity: z.number().int().min(0, "Parking capacity cannot be negative").optional(),
    parkingOccupied: z.number().int().min(0, "Parking occupied cannot be negative").optional(),
    foodOrders: z.number().int().min(0, "Food orders cannot be negative").optional(),
    merchandiseSales: z.number().min(0, "Merchandise sales cannot be negative").optional(),
    entryGatesOpen: z.number().int().min(0, "Entry gates open cannot be negative").optional(),
    securityPersonnel: z.number().int().min(0, "Security personnel cannot be negative").optional(),
    medicalPersonnel: z.number().int().min(0, "Medical personnel cannot be negative").optional(),
    coverImage: z.string().trim().url("Cover image must be a valid URL").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  })
  .refine(
    (data) =>
      !data.startDate || !data.endDate || data.endDate > data.startDate,
    { message: "End date must be after start date", path: ["endDate"] }
  )
  .refine(
    (data) =>
      data.totalSeats === undefined ||
      data.seatsBooked === undefined ||
      data.seatsBooked <= data.totalSeats,
    { message: "Seats booked cannot exceed total seats", path: ["seatsBooked"] }
  )
  .refine(
    (data) =>
      data.parkingCapacity === undefined ||
      data.parkingOccupied === undefined ||
      data.parkingOccupied <= data.parkingCapacity,
    { message: "Parking occupied cannot exceed parking capacity", path: ["parkingOccupied"] }
  );

export type CreateEventBody = z.infer<typeof createEventSchema>;
export type UpdateEventBody = z.infer<typeof updateEventSchema>;
