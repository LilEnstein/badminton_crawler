import type { MatchScore } from "@/domain/match/match-score.value-object";
import type { UserProfile } from "@/domain/profile/user-profile.entity";
import type { Session } from "@/domain/session/session.entity";

export interface MatchScoreCalculator {
  calculate(profile: UserProfile, session: Session): MatchScore;
}
