import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getEventById,
  listEvents,
  listMyEvents,
  updateEvent,
} from "../controllers/event.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { createEventSchema, updateEventSchema } from "../validations/event.validation";

const router = Router();

router.use(protect);

router.post(
  "/",
  authorize("Admin", "Organizer"),
  validate(createEventSchema),
  createEvent
);

router.get("/mine", listMyEvents);
router.get("/", authorize("Admin"), listEvents);

router.get("/:id", getEventById);

router.patch(
  "/:id",
  authorize("Admin", "Organizer"),
  validate(updateEventSchema),
  updateEvent
);

router.delete("/:id", authorize("Admin", "Organizer"), deleteEvent);

export default router;
