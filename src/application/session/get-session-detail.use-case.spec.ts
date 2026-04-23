import { describe, expect, it, vi } from "vitest";

import type { MatchScoreCalculator } from "@/application/match/ports";
import type { MatchScore } from "@/domain/match/match-score.value-object";
import { SessionNotFoundError } from "@/domain/session/errors";
import { Session } from "@/domain/session/session.entity";
import type { UserProfile } from "@/domain/profile/user-profile.entity";

import type { RawPostFinder, SearchableSessionRepository, SessionUserProfileRepository } from "./ports";
import { GetSessionDetailUseCase } from "./get-session-detail.use-case";

function makeSession(): Session {
  return Session.create({
    id: "sess-1",
    rawPostId: "raw-1",
    location: { district: "Quận 1", city: "HCM", address: null },
    datetime: { date: "2024-06-01", timeStart: "08:00", timeEnd: "10:00", isRecurring: false },
    skillLevel: { min: 4, max: 6 },
    budget: { amount: 80_000, currency: "VND", per: "session", negotiable: false },
    gender: "any",
    playersNeeded: 2,
    totalPlayers: 10,
    shuttleType: "feather",
    contact: "Liên hệ: 0901234567",
    status: "open",
    type: "looking_for_players",
    confidence: 0.9,
    needsReview: false,
    parsedAt: new Date("2024-06-01T00:00:00Z")
  });
}

function makeSessionRepo(session: Session | null): SearchableSessionRepository {
  return {
    search: vi.fn(),
    findById: vi.fn().mockResolvedValue(session)
  };
}

function makeProfileRepo(profile: UserProfile | null): SessionUserProfileRepository {
  return { findByUserId: vi.fn().mockResolvedValue(profile) };
}

function makeRawPostFinder(
  data: { groupId: string; fbPostId: string; authorProfileUrl: string | null } | null
): RawPostFinder {
  return { findById: vi.fn().mockResolvedValue(data) };
}

function makeScore(): MatchScore {
  return { total: 85, breakdown: { level: 30, area: 20, budget: 20, time: 10, shuttle: 10 } };
}

function makeCalc(): MatchScoreCalculator {
  return { calculate: vi.fn().mockReturnValue(makeScore()) };
}

describe("GetSessionDetailUseCase", () => {
  it("returns full DTO with fbPostUrl and match score when authenticated", async () => {
    const session = makeSession();
    const uc = new GetSessionDetailUseCase({
      sessionRepo: makeSessionRepo(session),
      profileRepo: makeProfileRepo({} as UserProfile),
      rawPostFinder: makeRawPostFinder({ groupId: "g1", fbPostId: "p1", authorProfileUrl: "https://fb.com/user" }),
      scoreCalc: makeCalc()
    });

    const dto = await uc.execute({ sessionId: "sess-1", userId: "user-1" });

    expect(dto.id).toBe("sess-1");
    expect(dto.fbPostUrl).toBe("https://www.facebook.com/groups/g1/posts/p1/");
    expect(dto.authorProfileUrl).toBe("https://fb.com/user");
    expect(dto.matchScore?.total).toBe(85);
  });

  it("returns null matchScore when unauthenticated", async () => {
    const session = makeSession();
    const uc = new GetSessionDetailUseCase({
      sessionRepo: makeSessionRepo(session),
      profileRepo: makeProfileRepo(null),
      rawPostFinder: makeRawPostFinder(null),
      scoreCalc: makeCalc()
    });

    const dto = await uc.execute({ sessionId: "sess-1" });

    expect(dto.matchScore).toBeNull();
  });

  it("returns null fbPostUrl when raw post is not found", async () => {
    const session = makeSession();
    const uc = new GetSessionDetailUseCase({
      sessionRepo: makeSessionRepo(session),
      profileRepo: makeProfileRepo(null),
      rawPostFinder: makeRawPostFinder(null),
      scoreCalc: makeCalc()
    });

    const dto = await uc.execute({ sessionId: "sess-1" });

    expect(dto.fbPostUrl).toBeNull();
    expect(dto.authorProfileUrl).toBeNull();
  });

  it("throws SessionNotFoundError when session does not exist", async () => {
    const uc = new GetSessionDetailUseCase({
      sessionRepo: makeSessionRepo(null),
      profileRepo: makeProfileRepo(null),
      rawPostFinder: makeRawPostFinder(null),
      scoreCalc: makeCalc()
    });

    await expect(uc.execute({ sessionId: "not-found" })).rejects.toThrow(SessionNotFoundError);
  });

  it("does not load profile when userId is absent", async () => {
    const profileRepo = makeProfileRepo(null);
    const uc = new GetSessionDetailUseCase({
      sessionRepo: makeSessionRepo(makeSession()),
      profileRepo,
      rawPostFinder: makeRawPostFinder(null),
      scoreCalc: makeCalc()
    });

    await uc.execute({ sessionId: "sess-1" });

    expect(profileRepo.findByUserId).not.toHaveBeenCalled();
  });
});
