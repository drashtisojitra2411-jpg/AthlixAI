import { Router } from "express";
import {
  deleteEmergencyReport,
  getEmergencyReportById,
  getEventEmergencySummary,
  listActiveEmergencies,
  listEmergencyReportsByEvent,
  reportEmergency,
  updateEmergencyStatus,
} from "../controllers/emergency.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import {
  reportEmergencySchema,
  updateEmergencyStatusSchema,
} from "../validations/emergency.validation";

const router = Router();

router.use(protect);

router.post("/", validate(reportEmergencySchema), reportEmergency);

router.get("/event/:eventId", listEmergencyReportsByEvent);
router.get("/event/:eventId/active", listActiveEmergencies);
router.get("/event/:eventId/summary", getEventEmergencySummary);

router.get("/:id", getEmergencyReportById);

router.patch(
  "/:id/status",
  authorize("Admin", "Organizer"),
  validate(updateEmergencyStatusSchema),
  updateEmergencyStatus
);

router.delete(
  "/:id",
  authorize("Admin", "Organizer"),
  deleteEmergencyReport
);

export default router;
