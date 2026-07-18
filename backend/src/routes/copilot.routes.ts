import { Router } from "express";
import { askCopilot, askVisitorCopilot } from "../controllers/copilot.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { askCopilotSchema, askVisitorCopilotSchema } from "../validations/copilot.validation";

const router = Router();

router.use(protect);

router.post("/ask", authorize("Admin", "Organizer"), validate(askCopilotSchema), askCopilot);
router.post(
  "/visitor/ask",
  authorize("Visitor", "Admin", "Organizer"),
  validate(askVisitorCopilotSchema),
  askVisitorCopilot
);

export default router;
