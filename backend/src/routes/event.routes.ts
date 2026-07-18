import { Router } from "express";
import {
  createEvent,
  deleteEvent,
  getBrowseEventById,
  getEventById,
  listBrowseEvents,
  listEvents,
  listLiveEvents,
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
// Visitor-safe browse endpoints — return a hand-built DTO (see
// event.service.ts), never the raw document these other routes return, so
// they're registered separately rather than reusing /:id or /live below.
// Must come before the generic "/:id" route or Express would swallow them.
router.get("/browse", authorize("Visitor", "Admin", "Organizer"), listBrowseEvents);
router.get("/browse/:id", authorize("Visitor", "Admin", "Organizer"), getBrowseEventById);
router.get("/live", authorize("Admin", "Organizer"), listLiveEvents);
router.get("/", authorize("Admin"), listEvents);

router.get("/:id", authorize("Admin", "Organizer"), getEventById);

router.patch(
  "/:id",
  authorize("Admin", "Organizer"),
  validate(updateEventSchema),
  updateEvent
);

router.delete("/:id", authorize("Admin", "Organizer"), deleteEvent);

export default router;
