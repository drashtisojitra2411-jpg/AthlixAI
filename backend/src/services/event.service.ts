import {
  Event,
  type EventStatus,
  type IEvent,
} from "../models/Event.model";
import { ApiError } from "../utils/ApiError";
import { paginate, type PaginatedResult, type PaginationOptions } from "./utils/pagination";
import { assertExists, assertUserExists, assertValidObjectId } from "./utils/queryHelpers";

export interface CreateEventInput {
  organizer: string;
  name: string;
  description?: string;
  venue: string;
  location?: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  coverImage?: string;
}

export interface UpdateEventInput {
  name?: string;
  description?: string;
  venue?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  status?: EventStatus;
  capacity?: number;
  coverImage?: string;
}

export interface EventFilters {
  status?: EventStatus;
  organizer?: string;
}

const assertValidDateRange = (startDate: Date, endDate: Date): void => {
  if (endDate <= startDate) {
    throw new ApiError(400, "End date must be after start date");
  }
};

export const createEvent = async (input: CreateEventInput): Promise<IEvent> => {
  await assertUserExists(input.organizer);
  assertValidDateRange(input.startDate, input.endDate);

  return Event.create({
    organizer: input.organizer,
    name: input.name,
    description: input.description,
    venue: input.venue,
    location: input.location,
    startDate: input.startDate,
    endDate: input.endDate,
    capacity: input.capacity,
    coverImage: input.coverImage,
  });
};

export const getEventById = async (id: string): Promise<IEvent> => {
  assertValidObjectId(id, "Event id");
  const event = await Event.findById(id);
  return assertExists(event, "Event not found");
};

export const listEvents = async (
  filters: EventFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<IEvent>> => {
  const filter: Record<string, unknown> = {};
  if (filters.status) {
    filter.status = filters.status;
  }
  if (filters.organizer) {
    filter.organizer = filters.organizer;
  }

  return paginate(Event, filter, pagination, { startDate: -1 });
};

export const listEventsByOrganizer = async (
  organizerId: string,
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<IEvent>> => {
  await assertUserExists(organizerId);
  return paginate(Event, { organizer: organizerId }, pagination, {
    startDate: -1,
  });
};

export const updateEvent = async (
  id: string,
  updates: UpdateEventInput
): Promise<IEvent> => {
  const event = await getEventById(id);

  const nextStartDate = updates.startDate ?? event.startDate;
  const nextEndDate = updates.endDate ?? event.endDate;
  if (updates.startDate !== undefined || updates.endDate !== undefined) {
    assertValidDateRange(nextStartDate, nextEndDate);
  }

  if (updates.name !== undefined) event.name = updates.name;
  if (updates.description !== undefined) event.description = updates.description;
  if (updates.venue !== undefined) event.venue = updates.venue;
  if (updates.location !== undefined) event.location = updates.location;
  if (updates.startDate !== undefined) event.startDate = updates.startDate;
  if (updates.endDate !== undefined) event.endDate = updates.endDate;
  if (updates.status !== undefined) event.status = updates.status;
  if (updates.capacity !== undefined) event.capacity = updates.capacity;
  if (updates.coverImage !== undefined) event.coverImage = updates.coverImage;

  await event.save();
  return event;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const event = await getEventById(id);
  await event.deleteOne();
};
