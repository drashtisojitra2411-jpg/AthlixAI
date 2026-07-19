import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildTournamentSummary, deriveTournamentStatus } from "./tournament.service";
import type { ITournament, ITournamentMatch } from "../models/Tournament.model";

function match(overrides: Partial<ITournamentMatch> = {}): ITournamentMatch {
  return {
    time: "18:00",
    teamA: "Team A",
    teamB: "Team B",
    venue: "Center Court",
    status: "upcoming",
    score: null,
    ...overrides,
  } as ITournamentMatch;
}

describe("deriveTournamentStatus", () => {
  it("is Scheduled when there are no matches yet", () => {
    assert.equal(deriveTournamentStatus([]), "Scheduled");
  });

  it("is Ongoing when any match is active, regardless of the others", () => {
    assert.equal(
      deriveTournamentStatus([match({ status: "completed" }), match({ status: "active" })]),
      "Ongoing"
    );
  });

  it("is Completed only when every match is completed", () => {
    assert.equal(
      deriveTournamentStatus([match({ status: "completed" }), match({ status: "completed" })]),
      "Completed"
    );
  });

  it("is Ongoing (not Scheduled) once at least one match has completed, even with no active match", () => {
    assert.equal(
      deriveTournamentStatus([match({ status: "completed" }), match({ status: "upcoming" })]),
      "Ongoing"
    );
  });

  it("is Scheduled when every match is still upcoming", () => {
    assert.equal(
      deriveTournamentStatus([match({ status: "upcoming" }), match({ status: "upcoming" })]),
      "Scheduled"
    );
  });
});

describe("buildTournamentSummary", () => {
  it("counts teams, matches, and buckets matches by status", () => {
    const tournament = {
      id: "t1",
      name: "IPL Final",
      status: "Ongoing",
      teams: ["Team A", "Team B", "Team C"],
      matches: [
        match({ status: "completed" }),
        match({ status: "active" }),
        match({ status: "upcoming" }),
        match({ status: "upcoming" }),
      ],
    } as unknown as ITournament;

    const summary = buildTournamentSummary(tournament);

    assert.equal(summary.tournament, "t1");
    assert.equal(summary.teamCount, 3);
    assert.equal(summary.totalMatches, 4);
    assert.equal(summary.completedMatches, 1);
    assert.equal(summary.upcomingMatches.length, 2);
    assert.equal(summary.liveMatches.length, 1);
  });

  it("returns empty buckets for a tournament with no matches", () => {
    const tournament = {
      id: "t2",
      name: "Empty Cup",
      status: "Scheduled",
      teams: [],
      matches: [],
    } as unknown as ITournament;

    const summary = buildTournamentSummary(tournament);

    assert.equal(summary.totalMatches, 0);
    assert.equal(summary.completedMatches, 0);
    assert.deepEqual(summary.upcomingMatches, []);
    assert.deepEqual(summary.liveMatches, []);
  });
});
