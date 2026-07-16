import type { Request, Response } from "express";
import type { CrowdStatus } from "../models/CrowdPrediction.model";
import * as crowdPredictionService from "../services/crowdPrediction.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { parsePagination, parseQueryString } from "./utils/requestParsing";

export const createCrowdPrediction = asyncHandler(
  async (req: Request, res: Response) => {
    const prediction = await crowdPredictionService.createCrowdPrediction(
      req.body
    );
    sendSuccess(res, 201, "Crowd prediction created successfully", {
      prediction,
    });
  }
);

export const getCrowdPredictionById = asyncHandler(
  async (req: Request, res: Response) => {
    const prediction = await crowdPredictionService.getCrowdPredictionById(
      req.params.id
    );
    sendSuccess(res, 200, "Crowd prediction fetched successfully", {
      prediction,
    });
  }
);

export const listCrowdPredictionsByEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await crowdPredictionService.listCrowdPredictionsByEvent(
      req.params.eventId,
      {
        zone: parseQueryString(req.query.zone),
        status: parseQueryString(req.query.status) as CrowdStatus | undefined,
      },
      parsePagination(req)
    );
    sendSuccess(res, 200, "Crowd predictions fetched successfully", result);
  }
);

export const getLatestZoneSnapshots = asyncHandler(
  async (req: Request, res: Response) => {
    const zones = await crowdPredictionService.getLatestZoneSnapshots(
      req.params.eventId
    );
    sendSuccess(res, 200, "Latest crowd zone snapshots fetched successfully", {
      zones,
    });
  }
);

export const getEventCrowdSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const summary = await crowdPredictionService.getEventCrowdSummary(
      req.params.eventId
    );
    sendSuccess(res, 200, "Event crowd summary fetched successfully", {
      summary,
    });
  }
);

export const updateCrowdPrediction = asyncHandler(
  async (req: Request, res: Response) => {
    const prediction = await crowdPredictionService.updateCrowdPrediction(
      req.params.id,
      req.body
    );
    sendSuccess(res, 200, "Crowd prediction updated successfully", {
      prediction,
    });
  }
);

export const deleteCrowdPrediction = asyncHandler(
  async (req: Request, res: Response) => {
    await crowdPredictionService.deleteCrowdPrediction(req.params.id);
    sendSuccess(res, 200, "Crowd prediction deleted successfully");
  }
);
