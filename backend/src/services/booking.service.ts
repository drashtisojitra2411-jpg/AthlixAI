import mongoose from "mongoose";
import { BOOKING, SEAT_RECOMMENDATION } from "../config/constants";
import { Booking, type IBooking } from "../models/Booking.model";
import { Event } from "../models/Event.model";
import type { TicketCategory } from "../models/Booking.model";
import { ApiError } from "../utils/ApiError";
import { paginate, type PaginatedResult, type PaginationOptions } from "./utils/pagination";
import { assertExists, assertValidObjectId } from "./utils/queryHelpers";

export interface CreateBookingInput {
  user: string;
  event: string;
  ticketCategory: TicketCategory;
  quantity: number;
}

export interface BookingPricing {
  pricePerSeat: Record<TicketCategory, number>;
  sectionByCategory: Record<TicketCategory, string>;
}

const BOOKABLE_STATUSES: readonly string[] = BOOKING.BOOKABLE_EVENT_STATUSES;

/**
 * Books seats against the shared Event seat pool inside a Mongo transaction.
 * The transactional read (`.session(session)`) plus `event.save({session})`
 * — not a hand-rolled aggregation-pipeline update — is what makes this
 * race-safe: `.save()` fires Event's own pre("validate") hook, so
 * seatsAvailable/occupancyPercentage/ticketRevenue are always computed by
 * the single function that owns that formula everywhere else in the app,
 * never a second copy that can drift. Two concurrent bookings serialize via
 * MongoDB's write-conflict detection; withTransaction retries the callback
 * on a transient conflict, so the retry re-reads the updated seat count and
 * correctly rejects if it's no longer available.
 */
export const createBooking = async (input: CreateBookingInput): Promise<IBooking> => {
  assertValidObjectId(input.event, "Event id");

  const session = await mongoose.startSession();
  let created: IBooking | null = null;

  try {
    await session.withTransaction(async () => {
      const event = assertExists(
        await Event.findById(input.event).session(session),
        "Event not found"
      );

      if (!BOOKABLE_STATUSES.includes(event.status)) {
        throw new ApiError(400, "This event is not open for booking");
      }
      if (event.seatsAvailable < input.quantity) {
        throw new ApiError(409, "Not enough seats available for this event");
      }

      event.seatsBooked += input.quantity;
      await event.save({ session });

      const pricePerSeat = SEAT_RECOMMENDATION.BASE_PRICE_PER_SEAT[input.ticketCategory];
      const totalAmount = pricePerSeat * input.quantity;

      const [booking] = await Booking.create(
        [
          {
            user: input.user,
            event: input.event,
            ticketCategory: input.ticketCategory,
            quantity: input.quantity,
            pricePerSeat,
            totalAmount,
            status: "confirmed",
          },
        ],
        { session }
      );

      created = booking;
    });
  } finally {
    await session.endSession();
  }

  // withTransaction only resolves without throwing once the callback ran to
  // completion, so `created` is always set here — this appeases strict null
  // checking without weakening the guarantee above.
  return assertExists<IBooking>(created, "Booking could not be created");
};

export const listMyBookings = async (
  userId: string,
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<IBooking>> => {
  const result = await paginate(Booking, { user: userId }, pagination, { createdAt: -1 });
  await Booking.populate(result.items, {
    path: "event",
    select: "name venue location startDate endDate status coverImage",
  });
  return result;
};

export const getBookingById = async (id: string, requestingUserId: string, requestingUserRole: string): Promise<IBooking> => {
  assertValidObjectId(id, "Booking id");
  const booking = assertExists(
    await Booking.findById(id).populate({
      path: "event",
      select: "name venue location startDate endDate status coverImage",
    }),
    "Booking not found"
  );

  const isOwner = booking.user.toString() === requestingUserId;
  const isStaff = requestingUserRole === "Admin" || requestingUserRole === "Organizer";
  if (!isOwner && !isStaff) {
    throw new ApiError(403, "Forbidden: you do not have access to this booking");
  }

  return booking;
};

export const getBookingPricing = (): BookingPricing => ({
  pricePerSeat: SEAT_RECOMMENDATION.BASE_PRICE_PER_SEAT,
  sectionByCategory: SEAT_RECOMMENDATION.SECTION_BY_BUDGET,
});
