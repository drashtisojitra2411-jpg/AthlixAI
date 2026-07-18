import type { Request, Response } from "express";
import * as stadiumService from "../services/stadium.service";
import { sendSuccess } from "../utils/apiResponse";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { parsePagination } from "./utils/requestParsing";

export const createStadium = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, "Not authorized");
  }
  const stadium = await stadiumService.createStadium({
    ...req.body,
    createdBy: req.user.id,
  });
  sendSuccess(res, 201, "Stadium created successfully", { stadium });
});

export const listStadiums = asyncHandler(async (req: Request, res: Response) => {
  const result = await stadiumService.listStadiums(parsePagination(req));
  sendSuccess(res, 200, "Stadiums fetched successfully", result);
});

export const getStadiumById = asyncHandler(async (req: Request, res: Response) => {
  const stadium = await stadiumService.getStadiumById(req.params.id);
  sendSuccess(res, 200, "Stadium fetched successfully", { stadium });
});

export const updateStadium = asyncHandler(async (req: Request, res: Response) => {
  const stadium = await stadiumService.updateStadium(req.params.id, req.body);
  sendSuccess(res, 200, "Stadium updated successfully", { stadium });
});

export const deleteStadium = asyncHandler(async (req: Request, res: Response) => {
  await stadiumService.deleteStadium(req.params.id);
  sendSuccess(res, 200, "Stadium deleted successfully");
});
