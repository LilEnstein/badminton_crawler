import { describe, expect, it } from "vitest";

import { UserProfile } from "@/domain/profile/user-profile.entity";
import type { GenderPreference } from "@/domain/profile/gender-preference.value-object";
import type { ShuttleType } from "@/domain/profile/shuttle-type.value-object";
import type { TimeSlot } from "@/domain/profile/time-slot.value-object";
import { Session } from "@/domain/session/session.entity";
import type { SessionShuttleType } from "@/domain/session/session.entity";
import { createLevel } from "@/domain/skill/level.value-object";

import { calculateMatchScore } from "./calculate-match-score";
import type { MatchScore } from "./match-score.value-object";
import { WEIGHTS } from "./weights";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeProfile(opts: {
  level?: number;
  levelTolerance?: 1 | 2;
  districts?: string[];
  budgetVnd?: number;
  timeSlots?: TimeSlot[];
  shuttleType?: ShuttleType;
  genderPreference?: GenderPreference;
}): UserProfile {
  return UserProfile.create({
    userId: "u1",
    displayName: "Tester",
    level: createLevel(opts.level ?? 5),
    levelTolerance: opts.levelTolerance ?? 2,
    city: "HCM",
    districts: opts.districts ?? ["Quận 1"],
    timeSlots: opts.timeSlots ?? ["morning"],
    budgetVnd: opts.budgetVnd ?? 100_000,
    shuttleType: opts.shuttleType ?? "feather",
    genderPreference: opts.genderPreference ?? "any",
    updatedAt: new Date("2024-06-01T00:00:00Z")
  });
}

function makeSession(opts: {
  levelMin?: number | null;
  levelMax?: number | null;
  district?: string | null;
  budgetAmount?: number | null;
  timeStart?: string | null;
  shuttleType?: SessionShuttleType;
}): Session {
  return Session.create({
    id: "s1",
    rawPostId: "r1",
    location: { district: opts.district ?? null, city: null, address: null },
    datetime: { date: null, timeStart: opts.timeStart ?? null, timeEnd: null, isRecurring: false },
    skillLevel: { min: opts.levelMin ?? null, max: opts.levelMax ?? null },
    budget: { amount: opts.budgetAmount ?? null, currency: "VND", per: null, negotiable: false },
    gender: null,
    playersNeeded: null,
    totalPlayers: null,
    shuttleType: opts.shuttleType ?? null,
    contact: null,
    status: "open",
    type: "looking_for_players",
    confidence: 0.9,
    needsReview: false,
    parsedAt: new Date("2024-06-01T00:00:00Z")
  });
}

function fullScore(): MatchScore {
  return {
    total: 100,
    breakdown: { level: WEIGHTS.level, area: WEIGHTS.area, budget: WEIGHTS.budget, time: WEIGHTS.time, shuttle: WEIGHTS.shuttle }
  };
}

// ---------------------------------------------------------------------------
// Level criterion
// ---------------------------------------------------------------------------

describe("calculateMatchScore — level criterion", () => {
  it("gives full level score when session range overlaps profile range", () => {
    const score = calculateMatchScore(
      makeProfile({ level: 5, levelTolerance: 2 }),
      makeSession({ levelMin: 4, levelMax: 6, district: "Quận 1", budgetAmount: 100_000, timeStart: "07:00", shuttleType: "feather" })
    );
    expect(score.breakdown.level).toBe(WEIGHTS.level);
    expect(score.total).toBe(100);
  });

  it("gives partial level score for close but non-overlapping range", () => {
    // profile [3,7], session [8,9] → dist=1, maxDist=4 → partial
    const score = calculateMatchScore(
      makeProfile({ level: 5, levelTolerance: 2 }),
      makeSession({ levelMin: 8, levelMax: 9 })
    );
    expect(score.breakdown.level).toBeGreaterThan(0);
    expect(score.breakdown.level).toBeLessThan(WEIGHTS.level);
  });

  it("gives 0 level score when distance exceeds tolerance + 2", () => {
    // profile [5,7] (level=6, tol=1), maxDist=3, session [1,1] → dist=4 > 3 → 0
    const score = calculateMatchScore(
      makeProfile({ level: 6, levelTolerance: 1 }),
      makeSession({ levelMin: 1, levelMax: 1 })
    );
    expect(score.breakdown.level).toBe(0);
  });

  it("skips level criterion when session skill level is null/null", () => {
    const score = calculateMatchScore(makeProfile({}), makeSession({ levelMin: null, levelMax: null }));
    expect(score.breakdown.level).toBeNull();
  });

  it("handles single-bound level (only max set)", () => {
    const score = calculateMatchScore(
      makeProfile({ level: 5, levelTolerance: 2 }),
      makeSession({ levelMin: null, levelMax: 5 })
    );
    expect(score.breakdown.level).toBe(WEIGHTS.level);
  });

  it("handles single-bound level (only min set)", () => {
    const score = calculateMatchScore(
      makeProfile({ level: 5, levelTolerance: 2 }),
      makeSession({ levelMin: 6, levelMax: null })
    );
    expect(score.breakdown.level).toBe(WEIGHTS.level);
  });
});

// ---------------------------------------------------------------------------
// Area criterion
// ---------------------------------------------------------------------------

describe("calculateMatchScore — area criterion", () => {
  it("gives full area score when district is in profile list", () => {
    const score = calculateMatchScore(
      makeProfile({ districts: ["Quận 1", "Quận 2"] }),
      makeSession({ district: "Quận 1" })
    );
    expect(score.breakdown.area).toBe(WEIGHTS.area);
  });

  it("gives 0 area score when district is not in profile list", () => {
    const score = calculateMatchScore(
      makeProfile({ districts: ["Quận 1"] }),
      makeSession({ district: "Quận 3" })
    );
    expect(score.breakdown.area).toBe(0);
  });

  it("skips area criterion when session district is null", () => {
    const score = calculateMatchScore(makeProfile({}), makeSession({ district: null }));
    expect(score.breakdown.area).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Budget criterion
// ---------------------------------------------------------------------------

describe("calculateMatchScore — budget criterion", () => {
  it("gives full budget score when session amount is below profile budget", () => {
    const score = calculateMatchScore(makeProfile({ budgetVnd: 100_000 }), makeSession({ budgetAmount: 80_000 }));
    expect(score.breakdown.budget).toBe(WEIGHTS.budget);
  });

  it("gives full budget score when session amount equals profile budget", () => {
    const score = calculateMatchScore(makeProfile({ budgetVnd: 100_000 }), makeSession({ budgetAmount: 100_000 }));
    expect(score.breakdown.budget).toBe(WEIGHTS.budget);
  });

  it("gives 0 budget score when session amount is exactly 1.5x profile budget", () => {
    const score = calculateMatchScore(makeProfile({ budgetVnd: 100_000 }), makeSession({ budgetAmount: 150_000 }));
    expect(score.breakdown.budget).toBe(0);
  });

  it("gives 0 budget score when session amount exceeds 1.5x", () => {
    const score = calculateMatchScore(makeProfile({ budgetVnd: 100_000 }), makeSession({ budgetAmount: 200_000 }));
    expect(score.breakdown.budget).toBe(0);
  });

  it("gives partial budget score for amount between budget and 1.5x", () => {
    // amount=125_000, cap=100_000, excess=25_000, halfCap=50_000 → 20*(1-0.5) = 10
    const score = calculateMatchScore(makeProfile({ budgetVnd: 100_000 }), makeSession({ budgetAmount: 125_000 }));
    expect(score.breakdown.budget).toBe(10);
  });

  it("gives full budget score when both profile and session are 0", () => {
    const score = calculateMatchScore(makeProfile({ budgetVnd: 0 }), makeSession({ budgetAmount: 0 }));
    expect(score.breakdown.budget).toBe(WEIGHTS.budget);
  });

  it("gives 0 budget score when profile is 0 but session has cost", () => {
    const score = calculateMatchScore(makeProfile({ budgetVnd: 0 }), makeSession({ budgetAmount: 50_000 }));
    expect(score.breakdown.budget).toBe(0);
  });

  it("skips budget criterion when session amount is null", () => {
    const score = calculateMatchScore(makeProfile({}), makeSession({ budgetAmount: null }));
    expect(score.breakdown.budget).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Time criterion
// ---------------------------------------------------------------------------

describe("calculateMatchScore — time criterion", () => {
  const cases: Array<[string, TimeSlot]> = [
    ["05:00", "morning"],
    ["09:30", "morning"],
    ["11:59", "morning"],
    ["12:00", "noon"],
    ["13:45", "noon"],
    ["14:00", "afternoon"],
    ["17:59", "afternoon"],
    ["18:00", "evening"],
    ["23:00", "evening"],
    ["03:00", "evening"]
  ];

  for (const [timeStart, slot] of cases) {
    it(`maps ${timeStart} to ${slot} slot`, () => {
      const score = calculateMatchScore(makeProfile({ timeSlots: [slot] }), makeSession({ timeStart }));
      expect(score.breakdown.time).toBe(WEIGHTS.time);
    });
  }

  it("gives 0 time score when session slot is not in profile slots", () => {
    const score = calculateMatchScore(makeProfile({ timeSlots: ["morning"] }), makeSession({ timeStart: "18:00" }));
    expect(score.breakdown.time).toBe(0);
  });

  it("skips time criterion when session timeStart is null", () => {
    const score = calculateMatchScore(makeProfile({}), makeSession({ timeStart: null }));
    expect(score.breakdown.time).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Shuttle criterion
// ---------------------------------------------------------------------------

describe("calculateMatchScore — shuttle criterion", () => {
  it("gives full shuttle score when types match exactly", () => {
    const score = calculateMatchScore(makeProfile({ shuttleType: "feather" }), makeSession({ shuttleType: "feather" }));
    expect(score.breakdown.shuttle).toBe(WEIGHTS.shuttle);
  });

  it("gives full shuttle score when session type is 'any'", () => {
    const score = calculateMatchScore(makeProfile({ shuttleType: "plastic" }), makeSession({ shuttleType: "any" }));
    expect(score.breakdown.shuttle).toBe(WEIGHTS.shuttle);
  });

  it("gives full shuttle score when profile type is 'any'", () => {
    const score = calculateMatchScore(makeProfile({ shuttleType: "any" }), makeSession({ shuttleType: "feather" }));
    expect(score.breakdown.shuttle).toBe(WEIGHTS.shuttle);
  });

  it("gives 0 shuttle score when types mismatch", () => {
    const score = calculateMatchScore(makeProfile({ shuttleType: "feather" }), makeSession({ shuttleType: "plastic" }));
    expect(score.breakdown.shuttle).toBe(0);
  });

  it("skips shuttle criterion when session shuttleType is null", () => {
    const score = calculateMatchScore(makeProfile({}), makeSession({ shuttleType: null }));
    expect(score.breakdown.shuttle).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Rescaling with missing criteria
// ---------------------------------------------------------------------------

describe("calculateMatchScore — rescaling", () => {
  it("rescales to 100 when all criteria are fully met", () => {
    const score = calculateMatchScore(
      makeProfile({ level: 5, levelTolerance: 2, districts: ["Q1"], budgetVnd: 100_000, timeSlots: ["morning"], shuttleType: "feather" }),
      makeSession({ levelMin: 5, levelMax: 5, district: "Q1", budgetAmount: 50_000, timeStart: "07:00", shuttleType: "feather" })
    );
    expect(score.total).toBe(100);
  });

  it("rescales correctly when shuttle criterion is missing", () => {
    const score = calculateMatchScore(
      makeProfile({ level: 5, levelTolerance: 2, districts: ["Q1"], budgetVnd: 100_000, timeSlots: ["morning"] }),
      makeSession({ levelMin: 5, levelMax: 5, district: "Q1", budgetAmount: 50_000, timeStart: "07:00", shuttleType: null })
    );
    expect(score.total).toBe(100);
  });

  it("rescales correctly when only shuttle is present and fully met", () => {
    const score = calculateMatchScore(makeProfile({ shuttleType: "feather" }), makeSession({ shuttleType: "feather" }));
    expect(score.total).toBe(100);
  });

  it("returns 0 total when all criteria are missing", () => {
    const score = calculateMatchScore(makeProfile({}), makeSession({}));
    expect(score.total).toBe(0);
  });

  it("total is always an integer 0–100", () => {
    const score = calculateMatchScore(makeProfile({ budgetVnd: 100_000 }), makeSession({ budgetAmount: 130_000 }));
    expect(Number.isInteger(score.total)).toBe(true);
    expect(score.total).toBeGreaterThanOrEqual(0);
    expect(score.total).toBeLessThanOrEqual(100);
  });
});

// ---------------------------------------------------------------------------
// Full perfect score
// ---------------------------------------------------------------------------

describe("calculateMatchScore — full match", () => {
  it("returns total=100 and full breakdown for a perfect match", () => {
    const score = calculateMatchScore(
      makeProfile({ level: 5, levelTolerance: 2, districts: ["Quận 1"], budgetVnd: 100_000, timeSlots: ["morning"], shuttleType: "feather" }),
      makeSession({ levelMin: 4, levelMax: 6, district: "Quận 1", budgetAmount: 80_000, timeStart: "09:00", shuttleType: "feather" })
    );
    expect(score).toEqual(fullScore());
  });
});
