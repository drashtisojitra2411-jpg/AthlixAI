import { Router } from "express";
import { runPrediction } from "../controllers/predictive.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { runPredictionSchema } from "../validations/predictive.validation";

const router = Router();

router.use(protect, authorize("Admin", "Organizer"));

router.post("/run", validate(runPredictionSchema), runPrediction);

export default router;
