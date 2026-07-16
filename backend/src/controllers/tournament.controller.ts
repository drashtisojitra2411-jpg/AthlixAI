import type { Request, Response } from "express";
import * as tournamentService from "../services/tournament.service";
import { sendSuccess } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { parseIndexParam, parsePagination } from "./utils/requestParsing";

export const createTournament = asyncHandler(
  async (req: Request, res: Response) => {
    const tournament = await tournamentService.createTournament(req.body);
    sendSuccess(res, 201, "Tournament created successfully", { tournament });
  }
);

export const getTournamentById = asyncHandler(
  async (req: Request, res: Response) => {
    const tournament = await tournamentService.getTournamentById(
      req.params.id
    );
    sendSuccess(res, 200, "Tournament fetched successfully", { tournament });
  }
);

export const listTournamentsByEvent = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await tournamentService.listTournamentsByEvent(
      req.params.eventId,
      parsePagination(req)
    );
    sendSuccess(res, 200, "Tournaments fetched successfully", result);
  }
);

export const updateTournament = asyncHandler(
  async (req: Request, res: Response) => {
    const tournament = await tournamentService.updateTournament(
      req.params.id,
      req.body
    );
    sendSuccess(res, 200, "Tournament updated successfully", { tournament });
  }
);

export const addTeam = asyncHandler(async (req: Request, res: Response) => {
  const tournament = await tournamentService.addTeam(
    req.params.id,
    req.body.teamName
  );
  sendSuccess(res, 200, "Team added successfully", { tournament });
});

export const removeTeam = asyncHandler(
  async (req: Request, res: Response) => {
    const tournament = await tournamentService.removeTeam(
      req.params.id,
      req.body.teamName
    );
    sendSuccess(res, 200, "Team removed successfully", { tournament });
  }
);

export const addMatch = asyncHandler(async (req: Request, res: Response) => {
  const tournament = await tournamentService.addMatch(req.params.id, req.body);
  sendSuccess(res, 201, "Match added successfully", { tournament });
});

export const updateMatch = asyncHandler(
  async (req: Request, res: Response) => {
    const matchIndex = parseIndexParam(req.params.matchIndex, "Match index");
    const tournament = await tournamentService.updateMatch(
      req.params.id,
      matchIndex,
      req.body
    );
    sendSuccess(res, 200, "Match updated successfully", { tournament });
  }
);

export const removeMatch = asyncHandler(
  async (req: Request, res: Response) => {
    const matchIndex = parseIndexParam(req.params.matchIndex, "Match index");
    const tournament = await tournamentService.removeMatch(
      req.params.id,
      matchIndex
    );
    sendSuccess(res, 200, "Match removed successfully", { tournament });
  }
);

export const getTournamentSummary = asyncHandler(
  async (req: Request, res: Response) => {
    const summary = await tournamentService.getTournamentSummary(
      req.params.id
    );
    sendSuccess(res, 200, "Tournament summary fetched successfully", {
      summary,
    });
  }
);

export const deleteTournament = asyncHandler(
  async (req: Request, res: Response) => {
    await tournamentService.deleteTournament(req.params.id);
    sendSuccess(res, 200, "Tournament deleted successfully");
  }
);
