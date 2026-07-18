import { Stadium, type IStadium } from "../models/Stadium.model";
import { paginate, type PaginatedResult, type PaginationOptions } from "./utils/pagination";
import { assertExists, assertUserExists, assertValidObjectId } from "./utils/queryHelpers";

export interface CreateStadiumInput {
  createdBy: string;
  name: string;
  location: string;
  capacity: number;
  description?: string;
  image?: string;
}

export interface UpdateStadiumInput {
  name?: string;
  location?: string;
  capacity?: number;
  description?: string;
  image?: string;
}

export const createStadium = async (input: CreateStadiumInput): Promise<IStadium> => {
  await assertUserExists(input.createdBy);

  return Stadium.create({
    name: input.name,
    location: input.location,
    capacity: input.capacity,
    description: input.description,
    image: input.image,
    createdBy: input.createdBy,
  });
};

export const getStadiumById = async (id: string): Promise<IStadium> => {
  assertValidObjectId(id, "Stadium id");
  const stadium = await Stadium.findById(id);
  return assertExists(stadium, "Stadium not found");
};

export const listStadiums = async (
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<IStadium>> => {
  return paginate(Stadium, {}, pagination, { name: 1 });
};

export const updateStadium = async (
  id: string,
  updates: UpdateStadiumInput
): Promise<IStadium> => {
  const stadium = await getStadiumById(id);

  if (updates.name !== undefined) stadium.name = updates.name;
  if (updates.location !== undefined) stadium.location = updates.location;
  if (updates.capacity !== undefined) stadium.capacity = updates.capacity;
  if (updates.description !== undefined) stadium.description = updates.description;
  if (updates.image !== undefined) stadium.image = updates.image;

  await stadium.save();
  return stadium;
};

export const deleteStadium = async (id: string): Promise<void> => {
  const stadium = await getStadiumById(id);
  await stadium.deleteOne();
};
