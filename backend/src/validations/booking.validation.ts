import { z } from "zod";
import { BOOKING, SEAT_BUDGET_TIERS } from "../config/constants";
import { objectIdSchema } from "./common.validation";

export const createBookingSchema = z.object({
  event: objectIdSchema,
  ticketCategory: z.enum(SEAT_BUDGET_TIERS),
  quantity: z
    .number()
    .int()
    .min(BOOKING.MIN_QUANTITY, `Quantity must be at least ${BOOKING.MIN_QUANTITY}`)
    .max(BOOKING.MAX_QUANTITY, `Quantity cannot exceed ${BOOKING.MAX_QUANTITY} per booking`),
});

export type CreateBookingBody = z.infer<typeof createBookingSchema>;
