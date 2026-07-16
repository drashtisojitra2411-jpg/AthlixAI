import { Router } from "express";
import {
  createCrowdPrediction,
  deleteCrowdPrediction,
  getCrowdPredictionById,
  getEventCrowdSummary,
  getLatestZoneSnapshots,
  listCrowdPredictionsByEvent,
  updateCrowdPrediction,
} from "../controllers/crowdPrediction.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import {
  createCrowdPredictionSchema,
  updateCrowdPredictionSchema,
} from "../validations/crowdPrediction.validation";

const router = Router();

router.use(protect);

router.post(
  "/",
  authorize("Admin", "Organizer"),
  validate(createCrowdPredictionSchema),
  createCrowdPrediction
);

router.get("/event/:eventId", listCrowdPredictionsByEvent);
router.get("/event/:eventId/latest", getLatestZoneSnapshots);
router.get("/event/:eventId/summary", getEventCrowdSummary);

router.get("/:id", getCrowdPredictionById);

router.patch(
  "/:id",
  authorize("Admin", "Organizer"),
  validate(updateCrowdPredictionSchema),
  updateCrowdPrediction
);

router.delete("/:id", authorize("Admin", "Organizer"), deleteCrowdPrediction);

export default router;
