import type { UserProfile } from "@/domain/profile/user-profile.entity";
import type { Session } from "@/domain/session/session.entity";
import type { TimeSlot } from "@/domain/profile/time-slot.value-object";
import { createLevelRange } from "@/domain/skill/level-range.value-object";
import { expandRange, distance } from "@/domain/skill/level-utils";

import type { MatchScore } from "./match-score.value-object";
import { WEIGHTS } from "./weights";

function timeStartToSlot(timeStart: string | null): TimeSlot | null {
  if (!timeStart) return null;
  const hour = parseInt(timeStart.split(":")[0] ?? "0", 10);
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 14) return "noon";
  if (hour >= 14 && hour < 18) return "afternoon";
  return "evening";
}

export function calculateMatchScore(profile: UserProfile, session: Session): MatchScore {
  const profileRange = expandRange(profile.level, profile.levelTolerance);
  const maxDist = profile.levelTolerance + 2;

  // Level criterion
  let levelScore: number | null = null;
  const { min: sMin, max: sMax } = session.skillLevel;
  if (sMin !== null || sMax !== null) {
    try {
      const lo = Math.max(1, Math.min(10, sMin ?? sMax!));
      const hi = Math.max(1, Math.min(10, sMax ?? sMin!));
      const sessionRange = createLevelRange(Math.min(lo, hi), Math.max(lo, hi));
      const dist = distance(profileRange, sessionRange);
      levelScore = dist === 0
        ? WEIGHTS.level
        : Math.max(0, Math.round(WEIGHTS.level * (1 - dist / maxDist)));
    } catch {
      // AI-parsed level out of 1-10 range → skip criterion
    }
  }

  // Area criterion
  let areaScore: number | null = null;
  if (session.location.district !== null) {
    areaScore = (profile.districts as string[]).includes(session.location.district)
      ? WEIGHTS.area
      : 0;
  }

  // Budget criterion
  let budgetScore: number | null = null;
  if (session.budget.amount !== null) {
    const amount = session.budget.amount;
    const cap = profile.budgetVnd;
    if (cap === 0) {
      budgetScore = amount === 0 ? WEIGHTS.budget : 0;
    } else if (amount <= cap) {
      budgetScore = WEIGHTS.budget;
    } else if (amount >= cap * 1.5) {
      budgetScore = 0;
    } else {
      budgetScore = Math.max(0, Math.round(WEIGHTS.budget * (1 - (amount - cap) / (cap * 0.5))));
    }
  }

  // Time criterion
  let timeScore: number | null = null;
  const sessionSlot = timeStartToSlot(session.datetime.timeStart);
  if (sessionSlot !== null) {
    timeScore = (profile.timeSlots as string[]).includes(sessionSlot) ? WEIGHTS.time : 0;
  }

  // Shuttle criterion
  let shuttleScore: number | null = null;
  if (session.shuttleType !== null) {
    const matches =
      session.shuttleType === "any" ||
      profile.shuttleType === "any" ||
      session.shuttleType === profile.shuttleType;
    shuttleScore = matches ? WEIGHTS.shuttle : 0;
  }

  // Rescale: sum(earned) / sum(applicable weights) * 100
  const scores = [levelScore, areaScore, budgetScore, timeScore, shuttleScore];
  const weights = [WEIGHTS.level, WEIGHTS.area, WEIGHTS.budget, WEIGHTS.time, WEIGHTS.shuttle];

  let earned = 0;
  let possible = 0;
  for (let i = 0; i < scores.length; i++) {
    if (scores[i] !== null) {
      earned += scores[i]!;
      possible += weights[i]!;
    }
  }

  const total = possible === 0 ? 0 : Math.round((earned / possible) * 100);

  return {
    total,
    breakdown: { level: levelScore, area: areaScore, budget: budgetScore, time: timeScore, shuttle: shuttleScore }
  };
}
