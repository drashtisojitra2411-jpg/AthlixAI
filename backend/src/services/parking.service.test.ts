import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateOccupancyRate,
  deriveParkingStatus,
  deriveTrafficLevel,
} from "./parking.service";

describe("calculateOccupancyRate", () => {
  it("computes a rounded percentage", () => {
    assert.equal(calculateOccupancyRate(50, 200), 25);
  });

  it("clamps at 100 when occupancy would exceed the total", () => {
    assert.equal(calculateOccupancyRate(210, 200), 100);
  });

  it("throws when totalSpaces is zero or negative", () => {
    assert.throws(() => calculateOccupancyRate(10, 0));
    assert.throws(() => calculateOccupancyRate(10, -5));
  });

  it("throws when occupiedSpaces is negative", () => {
    assert.throws(() => calculateOccupancyRate(-1, 100));
  });
});

describe("deriveParkingStatus", () => {
  it("is available below the warning threshold (80%)", () => {
    assert.equal(deriveParkingStatus(79), "available");
  });

  it("is warning at or above 80% but below the full threshold", () => {
    assert.equal(deriveParkingStatus(80), "warning");
    assert.equal(deriveParkingStatus(97), "warning");
  });

  it("is full at or above 98%", () => {
    assert.equal(deriveParkingStatus(98), "full");
    assert.equal(deriveParkingStatus(100), "full");
  });
});

describe("deriveTrafficLevel", () => {
  it("is Low at or below 40% occupancy", () => {
    assert.equal(deriveTrafficLevel(40), "Low");
  });

  it("is Moderate between 41% and 75% occupancy", () => {
    assert.equal(deriveTrafficLevel(41), "Moderate");
    assert.equal(deriveTrafficLevel(75), "Moderate");
  });

  it("is High above 75% occupancy", () => {
    assert.equal(deriveTrafficLevel(76), "High");
    assert.equal(deriveTrafficLevel(100), "High");
  });
});
