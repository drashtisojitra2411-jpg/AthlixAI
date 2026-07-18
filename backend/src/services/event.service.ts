import { BOOKING } from "../config/constants";
import {
  Event,
  type EventStatus,
  type IEvent,
} from "../models/Event.model";
import type { IStadium } from "../models/Stadium.model";
import { ApiError } from "../utils/ApiError";
import { paginate, type PaginatedResult, type PaginationOptions } from "./utils/pagination";
import { assertExists, assertUserExists, assertValidObjectId } from "./utils/queryHelpers";

export interface CreateEventInput {
  organizer: string;
  name: string;
  description?: string;
  venue: string;
  location?: string;
  stadium?: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  attendance?: number;
  weather?: string;
  totalSeats?: number;
  seatsBooked?: number;
  averageTicketPrice?: number;
  expectedRevenue?: number;
  parkingCapacity?: number;
  parkingOccupied?: number;
  foodOrders?: number;
  merchandiseSales?: number;
  entryGatesOpen?: number;
  securityPersonnel?: number;
  medicalPersonnel?: number;
  coverImage?: string;
}

export interface UpdateEventInput {
  name?: string;
  description?: string;
  venue?: string;
  location?: string;
  stadium?: string;
  startDate?: Date;
  endDate?: Date;
  status?: EventStatus;
  capacity?: number;
  attendance?: number;
  weather?: string;
  totalSeats?: number;
  seatsBooked?: number;
  averageTicketPrice?: number;
  expectedRevenue?: number;
  parkingCapacity?: number;
  parkingOccupied?: number;
  foodOrders?: number;
  merchandiseSales?: number;
  entryGatesOpen?: number;
  securityPersonnel?: number;
  medicalPersonnel?: number;
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
    stadium: input.stadium,
    startDate: input.startDate,
    endDate: input.endDate,
    capacity: input.capacity,
    attendance: input.attendance,
    weather: input.weather,
    totalSeats: input.totalSeats,
    seatsBooked: input.seatsBooked,
    averageTicketPrice: input.averageTicketPrice,
    expectedRevenue: input.expectedRevenue,
    parkingCapacity: input.parkingCapacity,
    parkingOccupied: input.parkingOccupied,
    foodOrders: input.foodOrders,
    merchandiseSales: input.merchandiseSales,
    entryGatesOpen: input.entryGatesOpen,
    securityPersonnel: input.securityPersonnel,
    medicalPersonnel: input.medicalPersonnel,
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
  if (updates.stadium !== undefined) event.stadium = updates.stadium as unknown as IEvent["stadium"];
  if (updates.startDate !== undefined) event.startDate = updates.startDate;
  if (updates.endDate !== undefined) event.endDate = updates.endDate;
  if (updates.status !== undefined) event.status = updates.status;
  if (updates.capacity !== undefined) event.capacity = updates.capacity;
  if (updates.attendance !== undefined) event.attendance = updates.attendance;
  if (updates.weather !== undefined) event.weather = updates.weather;
  if (updates.totalSeats !== undefined) event.totalSeats = updates.totalSeats;
  if (updates.seatsBooked !== undefined) event.seatsBooked = updates.seatsBooked;
  if (updates.averageTicketPrice !== undefined) event.averageTicketPrice = updates.averageTicketPrice;
  if (updates.expectedRevenue !== undefined) event.expectedRevenue = updates.expectedRevenue;
  if (updates.parkingCapacity !== undefined) event.parkingCapacity = updates.parkingCapacity;
  if (updates.parkingOccupied !== undefined) event.parkingOccupied = updates.parkingOccupied;
  if (updates.foodOrders !== undefined) event.foodOrders = updates.foodOrders;
  if (updates.merchandiseSales !== undefined) event.merchandiseSales = updates.merchandiseSales;
  if (updates.entryGatesOpen !== undefined) event.entryGatesOpen = updates.entryGatesOpen;
  if (updates.securityPersonnel !== undefined) event.securityPersonnel = updates.securityPersonnel;
  if (updates.medicalPersonnel !== undefined) event.medicalPersonnel = updates.medicalPersonnel;
  if (updates.coverImage !== undefined) event.coverImage = updates.coverImage;

  await event.save();
  return event;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const event = await getEventById(id);
  await event.deleteOne();
};

/* ============================================================
 * Visitor event browsing — pure additions below this line.
 * Nothing above is modified. These return a hand-built DTO, never
 * the raw IEvent document, so revenue/security fields (ticketRevenue,
 * expectedRevenue, foodOrders, merchandiseSales, securityPersonnel,
 * medicalPersonnel, parkingOccupied, averageTicketPrice) can never leak
 * to a visitor-reachable response, even by future accident.
 * ============================================================ */

const BROWSABLE_STATUSES: readonly string[] = BOOKING.BOOKABLE_EVENT_STATUSES;

export interface BrowseEventFilters {
  stadiumId?: string;
  from?: Date;
  to?: Date;
}

export interface BrowsableEventSummary {
  id: string;
  name: string;
  description?: string;
  venue: string;
  location?: string;
  stadium: { id: string; name: string; location: string } | null;
  startDate: Date;
  endDate: Date;
  status: EventStatus;
  capacity: number;
  attendance: number;
  totalSeats: number;
  seatsAvailable: number;
  occupancyPercentage: number;
  coverImage?: string;
  weather?: string;
}

type PopulatedStadiumRef =
  | (Pick<IStadium, "name" | "location"> & { _id: { toString(): string } })
  | null
  | undefined;

const toBrowsableEventSummary = (event: IEvent): BrowsableEventSummary => {
  const populatedStadium = event.stadium as unknown as PopulatedStadiumRef;

  return {
    id: event.id,
    name: event.name,
    description: event.description,
    venue: event.venue,
    location: event.location,
    stadium: populatedStadium
      ? {
          id: populatedStadium._id.toString(),
          name: populatedStadium.name,
          location: populatedStadium.location,
        }
      : null,
    startDate: event.startDate,
    endDate: event.endDate,
    status: event.status,
    capacity: event.capacity,
    attendance: event.attendance,
    totalSeats: event.totalSeats,
    seatsAvailable: event.seatsAvailable,
    occupancyPercentage: event.occupancyPercentage,
    coverImage: event.coverImage,
    weather: event.weather,
  };
};

export const listBrowseEvents = async (
  filters: BrowseEventFilters = {},
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<BrowsableEventSummary>> => {
  const filter: Record<string, unknown> = { status: { $in: BROWSABLE_STATUSES } };
  if (filters.stadiumId) {
    filter.stadium = filters.stadiumId;
  }
  if (filters.from || filters.to) {
    const range: Record<string, Date> = {};
    if (filters.from) range.$gte = filters.from;
    if (filters.to) range.$lte = filters.to;
    filter.startDate = range;
  }

  const result = await paginate(Event, filter, pagination, { startDate: 1 });
  await Event.populate(result.items, { path: "stadium", select: "name location" });

  return {
    ...result,
    items: result.items.map(toBrowsableEventSummary),
  };
};

export const getBrowseEventById = async (id: string): Promise<BrowsableEventSummary> => {
  assertValidObjectId(id, "Event id");
  const event = await Event.findOne({
    _id: id,
    status: { $in: BROWSABLE_STATUSES },
  }).populate({ path: "stadium", select: "name location" });

  return toBrowsableEventSummary(assertExists(event, "Event not found"));
};
