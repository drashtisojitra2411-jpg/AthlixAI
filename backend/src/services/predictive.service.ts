import { buildCompactContext } from "./copilot.service";
import {
  askGeminiPrediction,
  type PredictionResult,
  type PredictiveControls,
  type StandRegionRef,
} from "./gemini";

export interface RunPredictionOutcome {
  context: Awaited<ReturnType<typeof buildCompactContext>>;
  controls: PredictiveControls;
  prediction: PredictionResult;
}

export const runPrediction = async (
  eventId: string,
  controls: PredictiveControls,
  standRegions: StandRegionRef[]
): Promise<RunPredictionOutcome> => {
  const context = await buildCompactContext(eventId, controls.weather);
  const prediction = await askGeminiPrediction(context, controls, standRegions);

  return { context, controls, prediction };
};
