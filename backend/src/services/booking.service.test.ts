import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getBookingPricing } from "./booking.service";
import { SEAT_RECOMMENDATION } from "../config/constants";

describe("getBookingPricing", () => {
  it("returns the shared base price per seat for every ticket category", () => {
    const pricing = getBookingPricing();
    assert.deepEqual(pricing.pricePerSeat, SEAT_RECOMMENDATION.BASE_PRICE_PER_SEAT);
  });

  it("returns the shared section-by-budget mapping used by seat recommendations", () => {
    const pricing = getBookingPricing();
    assert.deepEqual(pricing.sectionByCategory, SEAT_RECOMMENDATION.SECTION_BY_BUDGET);
  });

  it("covers every seat budget tier with a price and a section", () => {
    const pricing = getBookingPricing();
    for (const tier of ["value", "premium", "elite"] as const) {
      assert.equal(typeof pricing.pricePerSeat[tier], "number");
      assert.equal(typeof pricing.sectionByCategory[tier], "string");
    }
  });
});
