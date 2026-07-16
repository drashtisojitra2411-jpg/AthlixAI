import type { Request, Response } from "express";
import * as seatRecommendationService from "../services/seatRecommendation.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { parsePagination } from "./utils/requestParsing";

export const createSeatRecommendation = asyncHandler(
  async (req: Request, res: Response) => {
    const recommendation =
      await seatRecommendationService.createSeatRecommendation(req.body);
    sendSuccess(res, 201, "Seat recommendation created successfully", {
      recommendation,
    });
  }
);

export const getSeatRecommendationById = asyncHandler(
  async (req: Request, res: Response) => {
    const recommendation =
      await seatRecommendationService.getSeatRecommendationById(
        req.params.id
      );
    sendSuccess(res, 200, "Seat recommendation fetched successfully", {
      recommendation,
    });
  }
);

export const listSeatRecommendationsByUser = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await seatRecommendationService.listSeatRecommendationsByUser(
      req.params.userId,
      parsePagination(req)
    );
    sendSuccess(res, 200, "Seat recommendations fetched successfully", result);
  }
);

export const listSeatRecommendationsByEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const result =
      await seatRecommendationService.listSeatRecommendationsByEvent(
        req.params.eventId,
        parsePagination(req)
      );
    sendSuccess(res, 200, "Seat recommendations fetched successfully", result);
  }
);

export const getTopRecommendationsForEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const recommendations =
      await seatRecommendationService.getTopRecommendationsForEvent(
        req.params.eventId,
        limit
      );
    sendSuccess(res, 200, "Top seat recommendations fetched successfully", {
      recommendations,
    });
  }
);

export const deleteSeatRecommendation = asyncHandler(
  async (req: Request, res: Response) => {
    await seatRecommendationService.deleteSeatRecommendation(req.params.id);
    sendSuccess(res, 200, "Seat recommendation deleted successfully");
  }
);
