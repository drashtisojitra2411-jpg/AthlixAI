import type { Request } from "express";
import type { PaginationOptions } from "../../services/utils/pagination";
import { ApiError } from "../../utils/ApiError";

export const parsePagination = (req: Request): PaginationOptions => ({
  page: req.query.page ? Number(req.query.page) : undefined,
  limit: req.query.limit ? Number(req.query.limit) : undefined,
});

export const parseQueryString = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;

export const parseIndexParam = (value: string, label = "Index"): number => {
  const index = Number(value);
  if (!Number.isInteger(index) || index < 0) {
    throw new ApiError(400, `${label} must be a non-negative integer`);
  }
  return index;
};
