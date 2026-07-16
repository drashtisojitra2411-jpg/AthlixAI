import { z } from "zod";

export const askCopilotSchema = z.object({
  eventId: z.string().min(1, "Event id is required"),
  prompt: z.string().trim().min(1, "Prompt is required").max(500),
  weather: z.string().trim().max(120).optional(),
});

export type AskCopilotBody = z.infer<typeof askCopilotSchema>;
