import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateOccupancyRate } from "./parking.service";

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
