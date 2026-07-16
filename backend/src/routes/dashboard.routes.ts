import { Router } from "express";
import {
  getEventOperationalSummary,
  getPlatformOverview,
} from "../controllers/dashboard.controller";
import { authorize, protect } from "../middlewares/auth.middleware";

const router = Router();

router.use(protect, authorize("Admin", "Organizer"));

router.get("/platform", getPlatformOverview);
router.get("/event/:eventId", getEventOperationalSummary);

export default router;
