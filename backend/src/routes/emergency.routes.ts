import { Router } from "express";
import {
  deleteEmergencyReport,
  getDemoEmergencyAiRecommendation,
  getEmergencyAiRecommendation,
  getEmergencyReportById,
  getEventEmergencySummary,
  getVisitorSafeAnnouncements,
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

// Any authenticated role (including Visitor) can report an incident — the
// controller always attributes it to the caller (see reportEmergency).
router.post("/", validate(reportEmergencySchema), reportEmergency);

// Visitor-safe: a friendly feed with description/severity dropped (see
// emergency.service.ts). Registered ahead of the raw, ops-only routes below
// only for readability — no path-collision risk since it's nested under
// "/event/:eventId/*", same as the other detail routes.
router.get(
  "/event/:eventId/announcements",
  authorize("Visitor", "Admin", "Organizer"),
  getVisitorSafeAnnouncements
);

router.get("/event/:eventId", authorize("Admin", "Organizer"), listEmergencyReportsByEvent);
router.get("/event/:eventId/active", authorize("Admin", "Organizer"), listActiveEmergencies);
router.get("/event/:eventId/summary", authorize("Admin", "Organizer"), getEventEmergencySummary);

// Registered before "/:id" so "demo" is never captured as an :id param.
router.post(
  "/demo/ai-recommendation",
  authorize("Admin", "Organizer"),
  validate(demoEmergencyAiRecommendationSchema),
  getDemoEmergencyAiRecommendation
);

router.get("/:id", authorize("Admin", "Organizer"), getEmergencyReportById);

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
