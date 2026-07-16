import mongoose from "mongoose";
import { Event, type IEvent } from "../../models/Event.model";
import { User, type IUser } from "../../models/User.model";
import { ApiError } from "../../utils/ApiError";

export const assertValidObjectId = (id: string, label = "Id"): void => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, `${label} is not a valid identifier`);
  }
};

export const assertExists = <T>(doc: T | null, message: string): T => {
  if (!doc) {
    throw new ApiError(404, message);
  }
  return doc;
};

export const assertEventExists = async (eventId: string): Promise<IEvent> => {
  assertValidObjectId(eventId, "Event id");
  const event = await Event.findById(eventId);
  return assertExists(event, "Event not found");
};

export const assertUserExists = async (userId: string): Promise<IUser> => {
  assertValidObjectId(userId, "User id");
  const user = await User.findById(userId);
  return assertExists(user, "User not found");
};
