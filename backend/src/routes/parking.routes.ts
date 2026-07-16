import { Router } from "express";
import {
  createParkingPrediction,
  deleteParkingPrediction,
  getEventParkingSummary,
  getLatestLotSnapshots,
  getParkingPredictionById,
  listParkingPredictionsByEvent,
  updateParkingPrediction,
} from "../controllers/parking.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import {
  createParkingPredictionSchema,
  updateParkingPredictionSchema,
} from "../validations/parking.validation";

const router = Router();

router.use(protect);

router.post(
  "/",
  authorize("Admin", "Organizer"),
  validate(createParkingPredictionSchema),
  createParkingPrediction
);

router.get("/event/:eventId", listParkingPredictionsByEvent);
router.get("/event/:eventId/latest", getLatestLotSnapshots);
router.get("/event/:eventId/summary", getEventParkingSummary);

router.get("/:id", getParkingPredictionById);

router.patch(
  "/:id",
  authorize("Admin", "Organizer"),
  validate(updateParkingPredictionSchema),
  updateParkingPrediction
);

router.delete("/:id", authorize("Admin", "Organizer"), deleteParkingPrediction);

export default router;
