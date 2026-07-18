import type { Request, Response } from "express";
import * as copilotService from "../services/copilot.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import type { AskCopilotBody, AskVisitorCopilotBody } from "../validations/copilot.validation";

export const askCopilot = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, prompt, weather } = req.body as AskCopilotBody;

  const outcome = await copilotService.askCopilot(req.user!.id, eventId, prompt, weather);

  sendSuccess(res, 200, "Copilot response generated successfully", outcome);
});

export const askVisitorCopilot = asyncHandler(async (req: Request, res: Response) => {
  const { eventId, prompt } = req.body as AskVisitorCopilotBody;

  const outcome = await copilotService.askVisitorCopilot(eventId, prompt);

  sendSuccess(res, 200, "Assistant response generated successfully", outcome);
});
