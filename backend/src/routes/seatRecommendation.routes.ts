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

router.get("/user/:userId", listSeatRecommendationsByUser);
router.get("/event/:eventId", listSeatRecommendationsByEvent);
router.get("/event/:eventId/top", getTopRecommendationsForEvent);

router.get("/:id", getSeatRecommendationById);

router.delete(
  "/:id",
  authorize("Admin", "Organizer"),
  deleteSeatRecommendation
);

export default router;
