import type { Request, Response } from "express";
import * as bookingService from "../services/booking.service";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import type { CreateBookingBody } from "../validations/booking.validation";
import { parsePagination } from "./utils/requestParsing";

export const createBooking = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Not authorized");
  }
  const { event, ticketCategory, quantity } = req.body as CreateBookingBody;

  const booking = await bookingService.createBooking({
    user: req.user.id,
    event,
    ticketCategory,
    quantity,
  });

  sendSuccess(res, 201, "Booking confirmed successfully", { booking });
});

export const listMyBookings = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Not authorized");
  }
  const result = await bookingService.listMyBookings(req.user.id, parsePagination(req));
  sendSuccess(res, 200, "Your bookings fetched successfully", result);
});

export const getBookingById = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Not authorized");
  }
  const booking = await bookingService.getBookingById(req.params.id, req.user.id, req.user.role);
  sendSuccess(res, 200, "Booking fetched successfully", { booking });
});

export const getBookingPricing = asyncHandler(async (_req: Request, res: Response) => {
  const pricing = bookingService.getBookingPricing();
  sendSuccess(res, 200, "Booking pricing fetched successfully", { pricing });
});
