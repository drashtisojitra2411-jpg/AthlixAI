import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateSlaInfo } from "./emergency.service";
import type { IEmergencyReport } from "../models/EmergencyReport.model";

function report(overrides: Partial<IEmergencyReport>): IEmergencyReport {
  return {
    severity: "medium",
    status: "reported",
    createdAt: new Date(),
    resolvedAt: null,
    ...overrides,
  } as IEmergencyReport;
}

describe("calculateSlaInfo", () => {
  it("is not breached when well within the severity SLA window", () => {
    const createdAt = new Date(Date.now() - 5 * 60 * 1000);
    const info = calculateSlaInfo(report({ severity: "medium", createdAt })); // 30 min SLA
    assert.equal(info.slaMinutes, 30);
    assert.equal(info.isBreached, false);
  });

  it("is breached when an unresolved critical incident exceeds its 5-minute SLA", () => {
    const createdAt = new Date(Date.now() - 10 * 60 * 1000);
    const info = calculateSlaInfo(report({ severity: "critical", status: "dispatched", createdAt }));
    assert.equal(info.slaMinutes, 5);
    assert.equal(info.isBreached, true);
  });

  it("never reports a resolved incident as breached, even past the SLA window", () => {
    const createdAt = new Date(Date.now() - 60 * 60 * 1000);
    const resolvedAt = new Date(Date.now() - 2 * 60 * 1000);
    const info = calculateSlaInfo(report({ severity: "critical", status: "resolved", createdAt, resolvedAt }));
    assert.equal(info.isBreached, false);
  });

  it("measures elapsed time up to resolvedAt, not the current time", () => {
    const createdAt = new Date("2026-01-01T00:00:00.000Z");
    const resolvedAt = new Date("2026-01-01T00:12:00.000Z");
    const info = calculateSlaInfo(report({ severity: "low", status: "resolved", createdAt, resolvedAt }));
    assert.equal(info.minutesElapsed, 12);
  });
});
