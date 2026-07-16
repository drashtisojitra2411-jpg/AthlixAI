import {
  Tournament,
  type ITournament,
  type ITournamentMatch,
  type MatchStatus,
  type TournamentStatus,
} from "../models/Tournament.model";
import { ApiError } from "../utils/ApiError";
import { paginate, type PaginatedResult, type PaginationOptions } from "./utils/pagination";
import { assertEventExists, assertExists, assertValidObjectId } from "./utils/queryHelpers";

export interface CreateTournamentInput {
  event: string;
  name: string;
  teams?: string[];
}

export interface UpdateTournamentInput {
  name?: string;
  teams?: string[];
}

export interface AddMatchInput {
  time: string;
  teamA: string;
  teamB: string;
  venue: string;
}

export interface UpdateMatchInput {
  time?: string;
  teamA?: string;
  teamB?: string;
  venue?: string;
  status?: MatchStatus;
  score?: string;
}

export interface TournamentSummary {
  tournament: string;
  name: string;
  status: TournamentStatus;
  teamCount: number;
  totalMatches: number;
  completedMatches: number;
  upcomingMatches: ITournamentMatch[];
  liveMatches: ITournamentMatch[];
}

export const deriveTournamentStatus = (
  matches: ITournamentMatch[]
): TournamentStatus => {
  if (matches.length === 0) {
    return "Scheduled";
  }
  if (matches.some((match) => match.status === "active")) {
    return "Ongoing";
  }
  if (matches.every((match) => match.status === "completed")) {
    return "Completed";
  }
  return matches.some((match) => match.status === "completed")
    ? "Ongoing"
    : "Scheduled";
};

export const createTournament = async (
  input: CreateTournamentInput
): Promise<ITournament> => {
  await assertEventExists(input.event);

  return Tournament.create({
    event: input.event,
    name: input.name,
    teams: input.teams ?? [],
    matches: [],
    status: "Scheduled",
  });
};

export const getTournamentById = async (id: string): Promise<ITournament> => {
  assertValidObjectId(id, "Tournament id");
  const tournament = await Tournament.findById(id);
  return assertExists(tournament, "Tournament not found");
};

export const listTournamentsByEvent = async (
  eventId: string,
  pagination: PaginationOptions = {}
): Promise<PaginatedResult<ITournament>> => {
  await assertEventExists(eventId);
  return paginate(Tournament, { event: eventId }, pagination, {
    createdAt: -1,
  });
};

export const getTournamentsForEvent = async (
  eventId: string
): Promise<ITournament[]> => {
  await assertEventExists(eventId);
  return Tournament.find({ event: eventId }).sort({ createdAt: -1 });
};

export const updateTournament = async (
  id: string,
  updates: UpdateTournamentInput
): Promise<ITournament> => {
  const tournament = await getTournamentById(id);

  if (updates.name !== undefined) {
    tournament.name = updates.name;
  }
  if (updates.teams !== undefined) {
    tournament.teams = updates.teams;
  }

  await tournament.save();
  return tournament;
};

export const addTeam = async (
  tournamentId: string,
  teamName: string
): Promise<ITournament> => {
  const tournament = await getTournamentById(tournamentId);

  if (tournament.teams.includes(teamName)) {
    throw new ApiError(409, "Team is already registered in this tournament");
  }

  tournament.teams.push(teamName);
  await tournament.save();
  return tournament;
};

export const removeTeam = async (
  tournamentId: string,
  teamName: string
): Promise<ITournament> => {
  const tournament = await getTournamentById(tournamentId);
  tournament.teams = tournament.teams.filter((team) => team !== teamName);
  await tournament.save();
  return tournament;
};

export const addMatch = async (
  tournamentId: string,
  match: AddMatchInput
): Promise<ITournament> => {
  const tournament = await getTournamentById(tournamentId);

  tournament.matches.push({
    time: match.time,
    teamA: match.teamA,
    teamB: match.teamB,
    venue: match.venue,
    status: "upcoming",
  });
  tournament.status = deriveTournamentStatus(tournament.matches);

  await tournament.save();
  return tournament;
};

const assertMatchIndex = (
  tournament: ITournament,
  matchIndex: number
): ITournamentMatch => {
  const match = tournament.matches[matchIndex];
  if (!match) {
    throw new ApiError(404, "Match not found in this tournament");
  }
  return match;
};

export const updateMatch = async (
  tournamentId: string,
  matchIndex: number,
  updates: UpdateMatchInput
): Promise<ITournament> => {
  const tournament = await getTournamentById(tournamentId);
  const match = assertMatchIndex(tournament, matchIndex);

  if (updates.time !== undefined) match.time = updates.time;
  if (updates.teamA !== undefined) match.teamA = updates.teamA;
  if (updates.teamB !== undefined) match.teamB = updates.teamB;
  if (updates.venue !== undefined) match.venue = updates.venue;
  if (updates.status !== undefined) match.status = updates.status;
  if (updates.score !== undefined) match.score = updates.score;

  tournament.status = deriveTournamentStatus(tournament.matches);

  await tournament.save();
  return tournament;
};

export const removeMatch = async (
  tournamentId: string,
  matchIndex: number
): Promise<ITournament> => {
  const tournament = await getTournamentById(tournamentId);
  assertMatchIndex(tournament, matchIndex);

  tournament.matches.splice(matchIndex, 1);
  tournament.status = deriveTournamentStatus(tournament.matches);

  await tournament.save();
  return tournament;
};

export const buildTournamentSummary = (
  tournament: ITournament
): TournamentSummary => ({
  tournament: tournament.id,
  name: tournament.name,
  status: tournament.status,
  teamCount: tournament.teams.length,
  totalMatches: tournament.matches.length,
  completedMatches: tournament.matches.filter(
    (match) => match.status === "completed"
  ).length,
  upcomingMatches: tournament.matches.filter(
    (match) => match.status === "upcoming"
  ),
  liveMatches: tournament.matches.filter((match) => match.status === "active"),
});

export const getTournamentSummary = async (
  tournamentId: string
): Promise<TournamentSummary> => {
  const tournament = await getTournamentById(tournamentId);
  return buildTournamentSummary(tournament);
};

export const deleteTournament = async (id: string): Promise<void> => {
  const tournament = await getTournamentById(id);
  await tournament.deleteOne();
};
