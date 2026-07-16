import type { Request, Response } from "express";
import * as copilotService from "../services/copilot.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { AskCopilotBody } from "../validations/copilot.validation";

export const askCopilot = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, prompt, weather } = req.body as AskCopilotBody;

  const outcome = await copilotService.askCopilot(req.user!.id, eventId, prompt, weather);

  sendSuccess(res, 200, "Copilot response generated successfully", outcome);
});
