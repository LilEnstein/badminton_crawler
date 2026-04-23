import { calculateMatchScore } from "@/domain/match/calculate-match-score";
import type { MatchScore } from "@/domain/match/match-score.value-object";
import type { UserProfile } from "@/domain/profile/user-profile.entity";
import type { Session } from "@/domain/session/session.entity";

import type { MatchScoreCalculator } from "./ports";

export class InlineMatchScoreCalculator implements MatchScoreCalculator {
  calculate(profile: UserProfile, session: Session): MatchScore {
    return calculateMatchScore(profile, session);
  }
}
