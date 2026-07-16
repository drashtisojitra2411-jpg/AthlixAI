import type { Request, Response } from "express";
import * as predictiveService from "../services/predictive.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { RunPredictionBody } from "../validations/predictive.validation";

export const runPrediction = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, controls, standRegions } = req.body as RunPredictionBody;

  const outcome = await predictiveService.runPrediction(eventId, controls, standRegions);

  sendSuccess(res, 200, "Prediction generated successfully", outcome);
});
