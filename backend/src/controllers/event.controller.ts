import type { Request, Response } from "express";
import type { EventStatus } from "../models/Event.model";
import * as eventService from "../services/event.service";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { parsePagination, parseQueryString } from "./utils/requestParsing";

export const createEvent = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Not authorized");
  }
  const event = await eventService.createEvent({
    ...req.body,
    organizer: req.user.id,
  });
  sendSuccess(res, 201, "Event created successfully", { event });
});

export const getEventById = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.getEventById(req.params.id);
  sendSuccess(res, 200, "Event fetched successfully", { event });
});

export const listEvents = asyncHandler(async (req: Request, res: Response) => {
  const result = await eventService.listEvents(
    {
      status: parseQueryString(req.query.status) as EventStatus | undefined,
      organizer: parseQueryString(req.query.organizer),
    },
    parsePagination(req)
  );
  sendSuccess(res, 200, "Events fetched successfully", result);
});

export const listMyEvents = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Not authorized");
  }
  const result = await eventService.listEventsByOrganizer(
    req.user.id,
    parsePagination(req)
  );
  sendSuccess(res, 200, "Your events fetched successfully", result);
});

export const updateEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await eventService.updateEvent(req.params.id, req.body);
  sendSuccess(res, 200, "Event updated successfully", { event });
});

export const deleteEvent = asyncHandler(async (req: Request, res: Response) => {
  await eventService.deleteEvent(req.params.id);
  sendSuccess(res, 200, "Event deleted successfully");
});
