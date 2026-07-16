import { Router } from "express";
import { getMe, login, register } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", protect, getMe);

export default router;
