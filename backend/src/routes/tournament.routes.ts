import { Router } from "express";
import {
  addMatch,
  addTeam,
  createTournament,
  deleteTournament,
  getTournamentById,
  getTournamentSummary,
  listTournamentsByEvent,
  removeMatch,
  removeTeam,
  updateMatch,
  updateTournament,
} from "../controllers/tournament.controller";
import { authorize, protect } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate";
import {
  addMatchSchema,
  createTournamentSchema,
  teamNameSchema,
  updateMatchSchema,
  updateTournamentSchema,
} from "../validations/tournament.validation";

const router = Router();

router.use(protect);

router.post(
  "/",
  authorize("Admin", "Organizer"),
  validate(createTournamentSchema),
  createTournament
);

router.get("/event/:eventId", listTournamentsByEvent);

router.get("/:id", getTournamentById);
router.get("/:id/summary", getTournamentSummary);

router.patch(
  "/:id",
  authorize("Admin", "Organizer"),
  validate(updateTournamentSchema),
  updateTournament
);

router.delete("/:id", authorize("Admin", "Organizer"), deleteTournament);

router.post(
  "/:id/teams",
  authorize("Admin", "Organizer"),
  validate(teamNameSchema),
  addTeam
);

router.delete(
  "/:id/teams",
  authorize("Admin", "Organizer"),
  validate(teamNameSchema),
  removeTeam
);

router.post(
  "/:id/matches",
  authorize("Admin", "Organizer"),
  validate(addMatchSchema),
  addMatch
);

router.patch(
  "/:id/matches/:matchIndex",
  authorize("Admin", "Organizer"),
  validate(updateMatchSchema),
  updateMatch
);

router.delete(
  "/:id/matches/:matchIndex",
  authorize("Admin", "Organizer"),
  removeMatch
);

export default router;
