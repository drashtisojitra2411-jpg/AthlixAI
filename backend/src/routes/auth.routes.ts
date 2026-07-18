import { Router } from "express";
import { getMe, login, register } from "../controllers/auth.controller";
import { protect } from "../middlewares/auth.middleware";
import { rateLimit } from "../middlewares/rateLimit";
import { validate } from "../middlewares/validate";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

// Unauthenticated, credential-guessable endpoints — throttle to blunt
// brute-force/credential-stuffing attempts (previously unmitigated).
const authAttemptLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many attempts. Please try again in a few minutes.",
});

router.post("/register", authAttemptLimit, validate(registerSchema), register);
router.post("/login", authAttemptLimit, validate(loginSchema), login);
router.get("/me", protect, getMe);

export default router;
