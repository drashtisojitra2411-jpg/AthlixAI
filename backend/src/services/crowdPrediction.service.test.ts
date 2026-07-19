import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ApiError } from "../utils/ApiError";
import {
  calculateCapacityPercent,
  deriveCrowdStatus,
  deriveRiskLevel,
} from "./crowdPrediction.service";

describe("calculateCapacityPercent", () => {
  it("computes a rounded percentage", () => {
    assert.equal(calculateCapacityPercent(150, 200), 75);
  });

  it("clamps at 100 when currentCount would exceed maxCount", () => {
    assert.equal(calculateCapacityPercent(300, 200), 100);
  });

  it("throws an ApiError when maxCount is zero or negative", () => {
    assert.throws(() => calculateCapacityPercent(10, 0), ApiError);
    assert.throws(() => calculateCapacityPercent(10, -5), ApiError);
  });

  it("throws an ApiError when currentCount is negative", () => {
    assert.throws(() => calculateCapacityPercent(-1, 100), ApiError);
  });
});

describe("deriveCrowdStatus", () => {
  it("is normal below the warning threshold (70%)", () => {
    assert.equal(deriveCrowdStatus(69), "normal");
  });

  it("is warning at or above 70% but below the critical threshold", () => {
    assert.equal(deriveCrowdStatus(70), "warning");
    assert.equal(deriveCrowdStatus(89), "warning");
  });

  it("is critical at or above 90%", () => {
    assert.equal(deriveCrowdStatus(90), "critical");
    assert.equal(deriveCrowdStatus(100), "critical");
  });
});

describe("deriveRiskLevel", () => {
  it("is Low at or below 50% capacity", () => {
    assert.equal(deriveRiskLevel(50), "Low");
  });

  it("is Moderate between 51% and 80% capacity", () => {
    assert.equal(deriveRiskLevel(51), "Moderate");
    assert.equal(deriveRiskLevel(80), "Moderate");
  });

  it("is High above 80% capacity", () => {
    assert.equal(deriveRiskLevel(81), "High");
    assert.equal(deriveRiskLevel(100), "High");
  });
});
