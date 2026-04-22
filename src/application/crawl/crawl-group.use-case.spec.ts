import { describe, expect, it, vi } from "vitest";

import { BotNotFoundError, LoginWallError } from "@/domain/crawl";

import type {
  CrawlAlerter,
  FacebookBotRepository,
  FacebookSessionProvider,
  GroupPageScraper,
  ParseJobQueue,
  RawPostRepository
} from "./ports";
import { CrawlGroupUseCase } from "./crawl-group.use-case";

const FIXED_NOW = new Date("2024-06-01T10:00:00Z");
const clock = { now: () => FIXED_NOW };
const ids = { generate: () => "01HTEST" };

function makeRawPostRepo(overrides: Partial<RawPostRepository> = {}): RawPostRepository {
  return {
    findByFbPostId: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(null),
    findPending: vi.fn().mockResolvedValue([]),
    save: vi.fn().mockResolvedValue(undefined),
    ...overrides
  };
}

function makeBotRepo(bot: { id: string } | null = { id: "bot-1" }): FacebookBotRepository {
  const entity = bot
    ? { id: bot.id, markNeedsRefresh: vi.fn(), markBanned: vi.fn(), markActive: vi.fn(), markUsed: vi.fn() }
    : null;
  return {
    findActive: vi.fn().mockResolvedValue(null),
    findById: vi.fn().mockResolvedValue(entity),
    save: vi.fn().mockResolvedValue(undefined)
  };
}

function makeSession(botId: string | null): FacebookSessionProvider {
  return {
    getActiveSession: vi.fn().mockResolvedValue(
      botId ? { botId, cookie: "[]" } : null
    )
  };
}

function makeScraper(candidates: Array<{ fbPostId: string; authorName: string; text: string; postedAt: Date }>): GroupPageScraper {
  return { scrape: vi.fn().mockResolvedValue(candidates) };
}

function makeQueue(): ParseJobQueue {
  return { enqueue: vi.fn().mockResolvedValue(undefined) };
}

function makeAlerter(): CrawlAlerter {
  return { alert: vi.fn().mockResolvedValue(undefined) };
}

describe("CrawlGroupUseCase", () => {
  it("returns newPosts=0 skipped=0 when no candidates found", async () => {
    const uc = new CrawlGroupUseCase({
      sessionProvider: makeSession("bot-1"),
      scraper: makeScraper([]),
      rawPostRepo: makeRawPostRepo(),
      botRepo: makeBotRepo(),
      parseQueue: makeQueue(),
      alerter: makeAlerter(),
      ids,
      clock
    });

    const result = await uc.execute("group-1");
    expect(result).toEqual({ newPosts: 0, skipped: 0 });
  });

  it("saves new posts and enqueues parse jobs", async () => {
    const rawPostRepo = makeRawPostRepo();
    const queue = makeQueue();
    const candidate = {
      fbPostId: "999",
      authorName: "Trần B",
      text: "Tìm người chơi cầu",
      postedAt: FIXED_NOW
    };

    const uc = new CrawlGroupUseCase({
      sessionProvider: makeSession("bot-1"),
      scraper: makeScraper([candidate]),
      rawPostRepo,
      botRepo: makeBotRepo(),
      parseQueue: queue,
      alerter: makeAlerter(),
      ids,
      clock
    });

    const result = await uc.execute("group-1");
    expect(result.newPosts).toBe(1);
    expect(result.skipped).toBe(0);
    expect(rawPostRepo.save).toHaveBeenCalledOnce();
    expect(queue.enqueue).toHaveBeenCalledWith("01HTEST");
  });

  it("skips already-seen posts", async () => {
    const { RawPost } = await import("@/domain/crawl");
    const existing = RawPost.create({
      id: "existing",
      fbPostId: "999",
      groupId: "group-1",
      authorName: "A",
      text: "text",
      postedAt: FIXED_NOW,
      fetchedAt: FIXED_NOW,
      parseStatus: "parsed"
    });

    const rawPostRepo = makeRawPostRepo({
      findByFbPostId: vi.fn().mockResolvedValue(existing)
    });
    const queue = makeQueue();

    const uc = new CrawlGroupUseCase({
      sessionProvider: makeSession("bot-1"),
      scraper: makeScraper([{ fbPostId: "999", authorName: "A", text: "text", postedAt: FIXED_NOW }]),
      rawPostRepo,
      botRepo: makeBotRepo(),
      parseQueue: queue,
      alerter: makeAlerter(),
      ids,
      clock
    });

    const result = await uc.execute("group-1");
    expect(result.skipped).toBe(1);
    expect(result.newPosts).toBe(0);
    expect(queue.enqueue).not.toHaveBeenCalled();
  });

  it("throws BotNotFoundError and alerts when no active session", async () => {
    const alerter = makeAlerter();
    const uc = new CrawlGroupUseCase({
      sessionProvider: makeSession(null),
      scraper: makeScraper([]),
      rawPostRepo: makeRawPostRepo(),
      botRepo: makeBotRepo(),
      parseQueue: makeQueue(),
      alerter,
      ids,
      clock
    });

    await expect(uc.execute("group-1")).rejects.toThrow(BotNotFoundError);
    expect(alerter.alert).toHaveBeenCalledOnce();
  });

  it("marks bot needs_refresh and rethrows on LoginWallError", async () => {
    const botRepo = makeBotRepo({ id: "bot-1" });
    const alerter = makeAlerter();
    const scraper: GroupPageScraper = { scrape: vi.fn().mockRejectedValue(new LoginWallError()) };

    const uc = new CrawlGroupUseCase({
      sessionProvider: makeSession("bot-1"),
      scraper,
      rawPostRepo: makeRawPostRepo(),
      botRepo,
      parseQueue: makeQueue(),
      alerter,
      ids,
      clock
    });

    await expect(uc.execute("group-1")).rejects.toThrow(LoginWallError);
    expect(botRepo.save).toHaveBeenCalledOnce();
    expect(alerter.alert).toHaveBeenCalledOnce();
  });
});
