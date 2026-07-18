import type { Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getEventOperationalSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const summary = await dashboardService.getEventOperationalSummary(
      req.params.eventId
    );
    sendSuccess(res, 200, "Event operational summary fetched successfully", {
      summary,
    });
  }
);

export const getPlatformOverview = asyncHandler(
  async (_req: Request, res: Response) => {
    const overview = await dashboardService.getPlatformOverview();
    sendSuccess(res, 200, "Platform overview fetched successfully", {
      overview,
    });
  }
);

export const getVisitorEventSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const summary = await dashboardService.getVisitorEventSummary(
      req.params.eventId
    );
    sendSuccess(res, 200, "Event summary fetched successfully", { summary });
  }
);
