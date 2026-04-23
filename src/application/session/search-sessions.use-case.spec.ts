import { describe, expect, it, vi } from "vitest";

import type { MatchScoreCalculator } from "@/application/match/ports";
import type { MatchScore } from "@/domain/match/match-score.value-object";
import { Session } from "@/domain/session/session.entity";
import type { SessionFilter } from "@/domain/session/session-filter.value-object";
import type { UserProfile } from "@/domain/profile/user-profile.entity";

import type { SearchableSessionRepository, SessionUserProfileRepository } from "./ports";
import { SearchSessionsUseCase } from "./search-sessions.use-case";

const NOW = new Date("2024-06-01T10:00:00Z");

function makeFilter(overrides: Partial<SessionFilter> = {}): SessionFilter {
  return { status: "open", includeNeedsReview: false, page: 1, pageSize: 20, ...overrides };
}

function makeSession(id: string, date: string | null = "2024-06-01"): Session {
  return Session.create({
    id,
    rawPostId: `raw-${id}`,
    location: { district: "Quận 1", city: "HCM", address: null },
    datetime: { date, timeStart: "08:00", timeEnd: null, isRecurring: false },
    skillLevel: { min: 4, max: 6 },
    budget: { amount: 80_000, currency: "VND", per: null, negotiable: false },
    gender: "any",
    playersNeeded: 2,
    totalPlayers: null,
    shuttleType: "feather",
    contact: null,
    status: "open",
    type: "looking_for_players",
    confidence: 0.9,
    needsReview: false,
    parsedAt: new Date("2024-06-01T00:00:00Z")
  });
}

function makeScore(total: number): MatchScore {
  return { total, breakdown: { level: null, area: null, budget: null, time: null, shuttle: null } };
}

function makeSessionRepo(sessions: Session[]): SearchableSessionRepository {
  return {
    search: vi.fn().mockResolvedValue(sessions),
    findById: vi.fn()
  };
}

function makeProfileRepo(profile: UserProfile | null): SessionUserProfileRepository {
  return { findByUserId: vi.fn().mockResolvedValue(profile) };
}

function makeCalc(scoreMap: Record<string, number>): MatchScoreCalculator {
  return {
    calculate: vi.fn((_profile, session) => makeScore(scoreMap[session.id] ?? 50))
  };
}

describe("SearchSessionsUseCase", () => {
  it("returns paginated sessions without scores when unauthenticated", async () => {
    const sessions = [makeSession("s1"), makeSession("s2")];
    const uc = new SearchSessionsUseCase({
      sessionRepo: makeSessionRepo(sessions),
      profileRepo: makeProfileRepo(null),
      scoreCalc: makeCalc({})
    });

    const result = await uc.execute({ filter: makeFilter(), now: NOW });

    expect(result.total).toBe(2);
    expect(result.items).toHaveLength(2);
    expect(result.items[0]!.matchScore).toBeNull();
  });

  it("returns sessions sorted by match score desc when authenticated", async () => {
    const sessions = [makeSession("s1"), makeSession("s2"), makeSession("s3")];
    const uc = new SearchSessionsUseCase({
      sessionRepo: makeSessionRepo(sessions),
      profileRepo: makeProfileRepo({} as UserProfile),
      scoreCalc: makeCalc({ s1: 40, s2: 90, s3: 70 })
    });

    const result = await uc.execute({ filter: makeFilter(), userId: "user1", now: NOW });

    expect(result.items.map((i) => i.session.id)).toEqual(["s2", "s3", "s1"]);
  });

  it("falls back to date asc sort when no profile", async () => {
    const sessions = [makeSession("s1", "2024-06-03"), makeSession("s2", "2024-06-01"), makeSession("s3", "2024-06-02")];
    const uc = new SearchSessionsUseCase({
      sessionRepo: makeSessionRepo(sessions),
      profileRepo: makeProfileRepo(null),
      scoreCalc: makeCalc({})
    });

    const result = await uc.execute({ filter: makeFilter(), now: NOW });

    expect(result.items.map((i) => i.session.id)).toEqual(["s2", "s3", "s1"]);
  });

  it("paginates correctly", async () => {
    const sessions = Array.from({ length: 5 }, (_, i) => makeSession(`s${i + 1}`));
    const uc = new SearchSessionsUseCase({
      sessionRepo: makeSessionRepo(sessions),
      profileRepo: makeProfileRepo(null),
      scoreCalc: makeCalc({})
    });

    const result = await uc.execute({ filter: makeFilter({ page: 2, pageSize: 2 }), now: NOW });

    expect(result.total).toBe(5);
    expect(result.items).toHaveLength(2);
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(2);
  });

  it("returns empty when repository returns no matches", async () => {
    const uc = new SearchSessionsUseCase({
      sessionRepo: makeSessionRepo([]),
      profileRepo: makeProfileRepo(null),
      scoreCalc: makeCalc({})
    });

    const result = await uc.execute({ filter: makeFilter(), now: NOW });

    expect(result.total).toBe(0);
    expect(result.items).toHaveLength(0);
  });

  it("does not load profile when userId is absent", async () => {
    const profileRepo = makeProfileRepo(null);
    const uc = new SearchSessionsUseCase({
      sessionRepo: makeSessionRepo([]),
      profileRepo,
      scoreCalc: makeCalc({})
    });

    await uc.execute({ filter: makeFilter(), now: NOW });

    expect(profileRepo.findByUserId).not.toHaveBeenCalled();
  });
});
