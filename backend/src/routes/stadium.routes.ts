import { Router } from "express";
import {
  createStadium,
  deleteStadium,
  getStadiumById,
  listStadiums,
  updateStadium,
} from "../controllers/stadium.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { createStadiumSchema, updateStadiumSchema } from "../validations/stadium.validation";

const router = Router();

router.use(protect);

router.post(
  "/",
  authorize("Admin", "Organizer"),
  validate(createStadiumSchema),
  createStadium
);

router.get("/", authorize("Visitor", "Admin", "Organizer"), listStadiums);
router.get("/:id", authorize("Visitor", "Admin", "Organizer"), getStadiumById);

router.patch(
  "/:id",
  authorize("Admin", "Organizer"),
  validate(updateStadiumSchema),
  updateStadium
);

router.delete("/:id", authorize("Admin", "Organizer"), deleteStadium);

export default router;
