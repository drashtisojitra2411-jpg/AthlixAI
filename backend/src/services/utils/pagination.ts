import type { FilterQuery, Model } from "mongoose";
import { PAGINATION } from "../../config/constants";

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const normalizePagination = (
  options: PaginationOptions = {}
): { page: number; limit: number; skip: number } => {
  const page =
    options.page && options.page > 0
      ? Math.floor(options.page)
      : PAGINATION.DEFAULT_PAGE;
  const limit =
    options.limit && options.limit > 0
      ? Math.min(Math.floor(options.limit), PAGINATION.MAX_LIMIT)
      : PAGINATION.DEFAULT_LIMIT;

  return { page, limit, skip: (page - 1) * limit };
};

export const paginate = async <T>(
  model: Model<T>,
  filter: FilterQuery<T>,
  options: PaginationOptions = {},
  sort: Record<string, 1 | -1> = { createdAt: -1 }
): Promise<PaginatedResult<T>> => {
  const { page, limit, skip } = normalizePagination(options);

  const [items, total] = await Promise.all([
    model.find(filter).sort(sort).skip(skip).limit(limit),
    model.countDocuments(filter),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
};
