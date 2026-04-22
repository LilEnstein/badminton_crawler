import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { RawPostNotFoundError } from "@/domain/crawl";
import { RawPost } from "@/domain/crawl/raw-post.entity";

import type {
  ParseFailureRepository,
  ParserOutput,
  PostParser,
  RawPostReadRepository,
  SessionRepository
} from "./ports";
import { ParsePostUseCase } from "./parse-post.use-case";

const FIXED_NOW = new Date("2024-06-01T10:00:00Z");
const clock = { now: () => FIXED_NOW };
let idCounter = 0;
const ids = { generate: () => `id-${++idCounter}` };

function loadFixture(name: string): string {
  return readFileSync(join(process.cwd(), "test/fixtures/posts", name), "utf8").trim();
}

function makeRawPost(text: string): RawPost {
  return RawPost.create({
    id: "raw-1",
    fbPostId: "fp-1",
    groupId: "g-1",
    authorName: "A",
    text,
    postedAt: FIXED_NOW,
    fetchedAt: FIXED_NOW,
    parseStatus: "pending"
  });
}

function makeRawPostRepo(post: RawPost | null): RawPostReadRepository {
  return {
    findById: vi.fn().mockResolvedValue(post),
    save: vi.fn().mockResolvedValue(undefined)
  };
}

function makeSessionRepo(): SessionRepository {
  return {
    save: vi.fn().mockResolvedValue(undefined),
    findByRawPostId: vi.fn().mockResolvedValue(null)
  };
}

function makeFailureRepo(): ParseFailureRepository {
  return { save: vi.fn().mockResolvedValue(undefined) };
}

function makeParser(output: Partial<ParserOutput> = {}): PostParser {
  const defaults: ParserOutput = {
    type: "looking_for_players",
    location: { district: "Tân Bình", city: "Hồ Chí Minh", address: null },
    datetime: { date: null, timeStart: "19:00", timeEnd: "21:00", isRecurring: false },
    skillLevel: { min: 5, max: 6 },
    budget: { amount: 50000, currency: "VND", per: "session", negotiable: false },
    gender: "any",
    playersNeeded: 2,
    totalPlayers: null,
    shuttleType: null,
    contact: "0912345678",
    status: "open",
    confidence: 0.9
  };
  return { name: "stub", parse: vi.fn().mockResolvedValue({ ...defaults, ...output }) };
}

describe("ParsePostUseCase", () => {
  it("throws RawPostNotFoundError when post not found", async () => {
    const uc = new ParsePostUseCase({
      rawPostRepo: makeRawPostRepo(null),
      parser: makeParser(),
      sessionRepo: makeSessionRepo(),
      parseFailureRepo: makeFailureRepo(),
      ids,
      clock
    });
    await expect(uc.execute("missing")).rejects.toThrow(RawPostNotFoundError);
  });

  it("persists session and marks post parsed on success", async () => {
    const post = makeRawPost(loadFixture("looking-for-players.txt"));
    const rawPostRepo = makeRawPostRepo(post);
    const sessionRepo = makeSessionRepo();

    const uc = new ParsePostUseCase({
      rawPostRepo,
      parser: makeParser({ confidence: 0.9 }),
      sessionRepo,
      parseFailureRepo: makeFailureRepo(),
      ids,
      clock
    });

    const result = await uc.execute("raw-1");
    expect(result.confidence).toBe(0.9);
    expect(result.needsReview).toBe(false);
    expect(result.sessionId).toBeTruthy();
    expect(sessionRepo.save).toHaveBeenCalledOnce();
    expect(rawPostRepo.save).toHaveBeenCalledOnce();
  });

  it("sets needsReview=true when confidence < 0.6", async () => {
    const post = makeRawPost(loadFixture("missing-level.txt"));
    const uc = new ParsePostUseCase({
      rawPostRepo: makeRawPostRepo(post),
      parser: makeParser({ confidence: 0.4, skillLevel: { min: null, max: null } }),
      sessionRepo: makeSessionRepo(),
      parseFailureRepo: makeFailureRepo(),
      ids,
      clock
    });

    const result = await uc.execute("raw-1");
    expect(result.needsReview).toBe(true);
  });

  it("saves ParseFailure and marks post failed on parser error", async () => {
    const post = makeRawPost("garbled text");
    const rawPostRepo = makeRawPostRepo(post);
    const parseFailureRepo = makeFailureRepo();
    const failingParser: PostParser = {
      name: "stub",
      parse: vi.fn().mockRejectedValue(new Error("provider down"))
    };

    const uc = new ParsePostUseCase({
      rawPostRepo,
      parser: failingParser,
      sessionRepo: makeSessionRepo(),
      parseFailureRepo,
      ids,
      clock
    });

    const result = await uc.execute("raw-1");
    expect(result.sessionId).toBeNull();
    expect(parseFailureRepo.save).toHaveBeenCalledOnce();
    expect(rawPostRepo.save).toHaveBeenCalledOnce();
  });

  it("handles negotiable budget fixture correctly", async () => {
    const post = makeRawPost(loadFixture("negotiable-budget.txt"));
    const sessionRepo = makeSessionRepo();

    const uc = new ParsePostUseCase({
      rawPostRepo: makeRawPostRepo(post),
      parser: makeParser({
        budget: { amount: null, currency: "VND", per: null, negotiable: true },
        confidence: 0.75
      }),
      sessionRepo,
      parseFailureRepo: makeFailureRepo(),
      ids,
      clock
    });

    const result = await uc.execute("raw-1");
    expect(result.needsReview).toBe(false);
    expect(sessionRepo.save).toHaveBeenCalledOnce();
    const saved = (sessionRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(saved.budget.negotiable).toBe(true);
  });

  it("handles closed status fixture", async () => {
    const post = makeRawPost(loadFixture("closed-status.txt"));
    const sessionRepo = makeSessionRepo();

    const uc = new ParsePostUseCase({
      rawPostRepo: makeRawPostRepo(post),
      parser: makeParser({ status: "closed", confidence: 0.85 }),
      sessionRepo,
      parseFailureRepo: makeFailureRepo(),
      ids,
      clock
    });

    await uc.execute("raw-1");
    const saved = (sessionRepo.save as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(saved.status).toBe("closed");
  });
});
