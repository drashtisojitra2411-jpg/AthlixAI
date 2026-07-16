import { Router } from "express";
import { askCopilot } from "../controllers/copilot.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { askCopilotSchema } from "../validations/copilot.validation";

const router = Router();

router.use(protect, authorize("Admin", "Organizer"));

router.post("/ask", validate(askCopilotSchema), askCopilot);

export default router;
