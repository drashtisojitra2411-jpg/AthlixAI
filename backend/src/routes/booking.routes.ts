import { Router } from "express";
import {
  createBooking,
  getBookingById,
  getBookingPricing,
  listMyBookings,
} from "../controllers/booking.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { createBookingSchema } from "../validations/booking.validation";

const router = Router();

router.use(protect);

router.get("/pricing", authorize("Visitor", "Admin", "Organizer"), getBookingPricing);
router.get("/mine", authorize("Visitor", "Admin", "Organizer"), listMyBookings);
router.post(
  "/",
  authorize("Visitor", "Admin", "Organizer"),
  validate(createBookingSchema),
  createBooking
);
router.get("/:id", authorize("Visitor", "Admin", "Organizer"), getBookingById);

export default router;
