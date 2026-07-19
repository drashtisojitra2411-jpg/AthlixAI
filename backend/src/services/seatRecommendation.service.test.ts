import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeSeatRecommendation, type GenerateSeatRecommendationInput } from "./seatRecommendation.service";

function input(overrides: Partial<GenerateSeatRecommendationInput> = {}): GenerateSeatRecommendationInput {
  return {
    user: "u1",
    event: "e1",
    budget: "value",
    groupSize: 2,
    ...overrides,
  };
}

describe("computeSeatRecommendation", () => {
  it("prices a plain value-tier seat at the base rate with no surcharges", () => {
    const result = computeSeatRecommendation(input({ budget: "value", groupSize: 2 }));
    assert.equal(result.pricePerSeat, 40);
    assert.equal(result.distanceToAction, "Panoramic");
  });

  it("adds the VIP surcharge and forces a Trackside VIP Suite recommendation", () => {
    const result = computeSeatRecommendation(input({ budget: "premium", vip: true }));
    assert.equal(result.pricePerSeat, 90 + 60);
    assert.equal(result.recommendedSection, "VIP Suite");
    assert.equal(result.distanceToAction, "Trackside");
  });

  it("adds the covered-seating surcharge and reports Balanced distance when not VIP", () => {
    const result = computeSeatRecommendation(input({ budget: "value", coveredSeating: true }));
    assert.equal(result.pricePerSeat, 40 + 15);
    assert.equal(result.distanceToAction, "Balanced");
  });

  it("applies the group discount once groupSize reaches the threshold (4)", () => {
    const below = computeSeatRecommendation(input({ budget: "elite", groupSize: 3 }));
    const atThreshold = computeSeatRecommendation(input({ budget: "elite", groupSize: 4 }));
    assert.equal(below.pricePerSeat, 180);
    assert.equal(atThreshold.pricePerSeat, 180 - 5);
  });

  it("stacks VIP and covered-seating surcharges together", () => {
    const result = computeSeatRecommendation(input({ budget: "value", vip: true, coveredSeating: true }));
    assert.equal(result.pricePerSeat, 40 + 60 + 15);
  });

  it("reaches exactly the documented maximum fit score (100) when every bonus applies", () => {
    const result = computeSeatRecommendation(
      input({ budget: "elite", groupSize: 4, accessibility: true, vip: true, coveredSeating: true })
    );
    assert.equal(result.fitScore, 100);
  });

  it("gives a smaller group-size fit bonus once groupSize exceeds 6", () => {
    const smallGroup = computeSeatRecommendation(input({ budget: "value", groupSize: 6 }));
    const largeGroup = computeSeatRecommendation(input({ budget: "value", groupSize: 7 }));
    assert.ok(smallGroup.fitScore > largeGroup.fitScore);
  });

  it("includes an accessibility note in the reason only when accessibility is requested", () => {
    const withAccessibility = computeSeatRecommendation(input({ accessibility: true }));
    const without = computeSeatRecommendation(input({ accessibility: false }));
    assert.match(withAccessibility.reason, /Accessible seating prioritized/);
    assert.doesNotMatch(without.reason, /Accessible seating prioritized/);
  });
});
