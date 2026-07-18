import { Router } from "express";
import {
  createSeatRecommendation,
  deleteSeatRecommendation,
  getSeatRecommendationById,
  getTopRecommendationsForEvent,
  listSeatRecommendationsByEvent,
  listSeatRecommendationsByUser,
} from "../controllers/seatRecommendation.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { generateSeatRecommendationSchema } from "../validations/seatRecommendation.validation";

const router = Router();

router.use(protect);

router.post(
  "/",
  validate(generateSeatRecommendationSchema),
  createSeatRecommendation
);

// GET /user/:userId lets the caller pass any userId — previously safe only
// because Visitor was unreachable; now that ordinary self-registered
// Visitors can authenticate, this must stay Admin/Organizer-only to avoid
// letting one user list another user's seat recommendations (budget tier,
// VIP/accessibility flags, price).
router.get("/user/:userId", authorize("Admin", "Organizer"), listSeatRecommendationsByUser);
router.get("/event/:eventId", authorize("Admin", "Organizer"), listSeatRecommendationsByEvent);
router.get("/event/:eventId/top", authorize("Admin", "Organizer"), getTopRecommendationsForEvent);

router.get("/:id", authorize("Admin", "Organizer"), getSeatRecommendationById);

router.delete(
  "/:id",
  authorize("Admin", "Organizer"),
  deleteSeatRecommendation
);

export default router;
