import { Router } from "express";
import authRoutes from "./auth.routes";
import copilotRoutes from "./copilot.routes";
import crowdPredictionRoutes from "./crowdPrediction.routes";
import dashboardRoutes from "./dashboard.routes";
import emergencyRoutes from "./emergency.routes";
import eventRoutes from "./event.routes";
import healthRoutes from "./health.routes";
import parkingRoutes from "./parking.routes";
import predictiveRoutes from "./predictive.routes";
import seatRecommendationRoutes from "./seatRecommendation.routes";
import tournamentRoutes from "./tournament.routes";

const router = Router();

router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/events", eventRoutes);
router.use("/crowd-predictions", crowdPredictionRoutes);
router.use("/parking", parkingRoutes);
router.use("/seat-recommendations", seatRecommendationRoutes);
router.use("/tournaments", tournamentRoutes);
router.use("/emergencies", emergencyRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/copilot", copilotRoutes);
router.use("/predictive", predictiveRoutes);

export default router;
