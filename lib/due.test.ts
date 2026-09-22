import { describe, expect, it } from "vitest";

import { DEFAULT_SOON_WITHIN_DAYS, resolveDue } from "./due";

describe("resolveDue", () => {
  it("counts whole calendar days between the reference date and the deadline", () => {
    expect(resolveDue("2026-09-30", "2026-09-22").daysRemaining).toBe(8);
    expect(resolveDue("2026-09-22", "2026-09-22").daysRemaining).toBe(0);
    expect(resolveDue("2026-09-20", "2026-09-22").daysRemaining).toBe(-2);
  });

  it("ignores the time of day — only the calendar day matters", () => {
    const deadline = new Date(2026, 8, 25, 0, 5);
    const asOf = new Date(2026, 8, 22, 23, 55);
    expect(resolveDue(deadline, asOf).daysRemaining).toBe(3);
  });

  it("treats the deadline day itself as soon, not overdue", () => {
    expect(resolveDue("2026-09-22", "2026-09-22").status).toBe("soon");
  });

  it("splits ahead / soon / overdue on the threshold boundary", () => {
    expect(resolveDue("2026-09-26", "2026-09-22").status).toBe("ahead");
    expect(resolveDue("2026-09-25", "2026-09-22").status).toBe("soon");
    expect(resolveDue("2026-09-21", "2026-09-22").status).toBe("overdue");
  });

  it("uses the injected threshold instead of the default", () => {
    expect(resolveDue("2026-09-29", "2026-09-22", { soonWithinDays: 7 }).status).toBe("soon");
    expect(resolveDue("2026-09-29", "2026-09-22", { soonWithinDays: 6 }).status).toBe("ahead");
    // soonWithinDays: 0 이면 기한 당일만 임박이다.
    expect(resolveDue("2026-09-22", "2026-09-22", { soonWithinDays: 0 }).status).toBe("soon");
    expect(resolveDue("2026-09-23", "2026-09-22", { soonWithinDays: 0 }).status).toBe("ahead");
  });

  it("defaults the threshold to DEFAULT_SOON_WITHIN_DAYS", () => {
    const deadline = "2026-09-25";
    expect(resolveDue(deadline, "2026-09-22").status).toBe(
      resolveDue(deadline, "2026-09-22", { soonWithinDays: DEFAULT_SOON_WITHIN_DAYS }).status,
    );
  });

  it("crosses month and year boundaries", () => {
    expect(resolveDue("2026-10-01", "2026-09-28").daysRemaining).toBe(3);
    expect(resolveDue("2027-01-02", "2026-12-31").daysRemaining).toBe(2);
    // 2028 은 윤년이다.
    expect(resolveDue("2028-03-01", "2028-02-28").daysRemaining).toBe(2);
  });

  it("rejects malformed or impossible dates instead of returning NaN", () => {
    expect(() => resolveDue("2026/09/22", "2026-09-22")).toThrow(RangeError);
    expect(() => resolveDue("2026-02-31", "2026-09-22")).toThrow(RangeError);
    expect(() => resolveDue("2026-09-22", new Date("nope"))).toThrow(RangeError);
  });

  it("rejects a threshold that is not a non-negative integer", () => {
    expect(() => resolveDue("2026-09-25", "2026-09-22", { soonWithinDays: -1 })).toThrow(RangeError);
    expect(() => resolveDue("2026-09-25", "2026-09-22", { soonWithinDays: 1.5 })).toThrow(RangeError);
  });
});
