import { Router } from "express";
import {
  deleteEmergencyReport,
  getDemoEmergencyAiRecommendation,
  getEmergencyAiRecommendation,
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
  demoEmergencyAiRecommendationSchema,
  reportEmergencySchema,
  updateEmergencyStatusSchema,
} from "../validations/emergency.validation";

const router = Router();

router.use(protect);

router.post("/", validate(reportEmergencySchema), reportEmergency);

router.get("/event/:eventId", listEmergencyReportsByEvent);
router.get("/event/:eventId/active", listActiveEmergencies);
router.get("/event/:eventId/summary", getEventEmergencySummary);

// Registered before "/:id" so "demo" is never captured as an :id param.
router.post(
  "/demo/ai-recommendation",
  authorize("Admin", "Organizer"),
  validate(demoEmergencyAiRecommendationSchema),
  getDemoEmergencyAiRecommendation
);

router.get("/:id", getEmergencyReportById);

router.post(
  "/:id/ai-recommendation",
  authorize("Admin", "Organizer"),
  getEmergencyAiRecommendation
);

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
