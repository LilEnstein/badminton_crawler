import type { MatchScoreCalculator } from "@/application/match/ports";
import type { MatchScore } from "@/domain/match/match-score.value-object";
import { SessionNotFoundError } from "@/domain/session/errors";
import type { Session } from "@/domain/session/session.entity";

import type { RawPostFinder, SearchableSessionRepository, SessionUserProfileRepository } from "./ports";

export interface SessionDetailDto {
  id: string;
  rawPostId: string;
  location: Session["location"];
  datetime: Session["datetime"];
  skillLevel: Session["skillLevel"];
  budget: Session["budget"];
  gender: Session["gender"];
  playersNeeded: number | null;
  totalPlayers: number | null;
  shuttleType: Session["shuttleType"];
  contact: string | null;
  status: Session["status"];
  type: Session["type"];
  confidence: number;
  needsReview: boolean;
  parsedAt: string;
  fbPostUrl: string | null;
  authorProfileUrl: string | null;
  matchScore: MatchScore | null;
}

export interface GetSessionDetailInput {
  sessionId: string;
  userId?: string;
}

interface Deps {
  sessionRepo: SearchableSessionRepository;
  profileRepo: SessionUserProfileRepository;
  rawPostFinder: RawPostFinder;
  scoreCalc: MatchScoreCalculator;
}

export class GetSessionDetailUseCase {
  constructor(private deps: Deps) {}

  async execute(input: GetSessionDetailInput): Promise<SessionDetailDto> {
    const { sessionRepo, profileRepo, rawPostFinder, scoreCalc } = this.deps;
    const { sessionId, userId } = input;

    const [session, profile] = await Promise.all([
      sessionRepo.findById(sessionId),
      userId ? profileRepo.findByUserId(userId) : Promise.resolve(null)
    ]);

    if (!session) throw new SessionNotFoundError(sessionId);

    const [rawPost] = await Promise.all([rawPostFinder.findById(session.rawPostId)]);

    const fbPostUrl = rawPost
      ? `https://www.facebook.com/groups/${rawPost.groupId}/posts/${rawPost.fbPostId}/`
      : null;

    const matchScore = profile ? scoreCalc.calculate(profile, session) : null;

    return {
      ...session.toPublic(),
      fbPostUrl,
      authorProfileUrl: rawPost?.authorProfileUrl ?? null,
      matchScore
    };
  }
}
