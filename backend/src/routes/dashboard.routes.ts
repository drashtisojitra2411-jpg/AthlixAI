import { Router } from "express";
import {
  getEventOperationalSummary,
  getPlatformOverview,
  getVisitorEventSummary,
} from "../controllers/dashboard.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.use(protect);

router.get("/platform", authorize("Admin", "Organizer"), getPlatformOverview);
router.get("/event/:eventId", authorize("Admin", "Organizer"), getEventOperationalSummary);
router.get(
  "/event/:eventId/visitor-summary",
  authorize("Visitor", "Admin", "Organizer"),
  getVisitorEventSummary
);

export default router;
