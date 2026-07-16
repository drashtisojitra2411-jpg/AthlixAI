import type { Request, Response } from "express";
import type { ParkingStatus } from "../models/ParkingPrediction.model";
import * as parkingService from "../services/parking.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { parsePagination, parseQueryString } from "./utils/requestParsing";

export const createParkingPrediction = asyncHandler(
  async (req: Request, res: Response) => {
    const prediction = await parkingService.createParkingPrediction(req.body);
    sendSuccess(res, 201, "Parking prediction created successfully", {
      prediction,
    });
  }
);

export const getParkingPredictionById = asyncHandler(
  async (req: Request, res: Response) => {
    const prediction = await parkingService.getParkingPredictionById(
      req.params.id
    );
    sendSuccess(res, 200, "Parking prediction fetched successfully", {
      prediction,
    });
  }
);

export const listParkingPredictionsByEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await parkingService.listParkingPredictionsByEvent(
      req.params.eventId,
      {
        lot: parseQueryString(req.query.lot),
        status: parseQueryString(req.query.status) as
          | ParkingStatus
          | undefined,
      },
      parsePagination(req)
    );
    sendSuccess(res, 200, "Parking predictions fetched successfully", result);
  }
);

export const getLatestLotSnapshots = asyncHandler(
  async (req: Request, res: Response) => {
    const lots = await parkingService.getLatestLotSnapshots(
      req.params.eventId
    );
    sendSuccess(res, 200, "Latest parking lot snapshots fetched successfully", {
      lots,
    });
  }
);

export const getEventParkingSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const summary = await parkingService.getEventParkingSummary(
      req.params.eventId
    );
    sendSuccess(res, 200, "Event parking summary fetched successfully", {
      summary,
    });
  }
);

export const updateParkingPrediction = asyncHandler(
  async (req: Request, res: Response) => {
    const prediction = await parkingService.updateParkingPrediction(
      req.params.id,
      req.body
    );
    sendSuccess(res, 200, "Parking prediction updated successfully", {
      prediction,
    });
  }
);

export const deleteParkingPrediction = asyncHandler(
  async (req: Request, res: Response) => {
    await parkingService.deleteParkingPrediction(req.params.id);
    sendSuccess(res, 200, "Parking prediction deleted successfully");
  }
);
