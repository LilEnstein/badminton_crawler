import { BotNotFoundError, LoginWallError, RawPost } from "@/domain/crawl";

import type {
  CrawlAlerter,
  FacebookBotRepository,
  FacebookSessionProvider,
  GroupPageScraper,
  ParseJobQueue,
  RawPostRepository
} from "./ports";

interface Deps {
  sessionProvider: FacebookSessionProvider;
  scraper: GroupPageScraper;
  rawPostRepo: RawPostRepository;
  botRepo: FacebookBotRepository;
  parseQueue: ParseJobQueue;
  alerter: CrawlAlerter;
  ids: { generate(): string };
  clock: { now(): Date };
}

interface CrawlGroupResult {
  newPosts: number;
  skipped: number;
}

export class CrawlGroupUseCase {
  constructor(private deps: Deps) {}

  async execute(groupId: string): Promise<CrawlGroupResult> {
    const session = await this.deps.sessionProvider.getActiveSession();
    if (!session) {
      await this.deps.alerter.alert("No active bot session available for crawling");
      throw new BotNotFoundError();
    }

    let candidates;
    try {
      candidates = await this.deps.scraper.scrape(groupId, session.cookie);
    } catch (err) {
      if (err instanceof LoginWallError) {
        const bot = await this.deps.botRepo.findById(session.botId);
        if (bot) {
          bot.markNeedsRefresh();
          await this.deps.botRepo.save(bot);
        }
        await this.deps.alerter.alert(
          `Bot ${session.botId} hit login wall on group ${groupId} — marked needs_refresh`
        );
        throw err;
      }
      throw err;
    }

    let newPosts = 0;
    let skipped = 0;
    const fetchedAt = this.deps.clock.now();

    for (const candidate of candidates) {
      const existing = await this.deps.rawPostRepo.findByFbPostId(candidate.fbPostId);
      if (existing) {
        skipped++;
        continue;
      }

      const post = RawPost.create({
        id: this.deps.ids.generate(),
        fbPostId: candidate.fbPostId,
        groupId,
        authorName: candidate.authorName,
        text: candidate.text,
        postedAt: candidate.postedAt,
        fetchedAt,
        parseStatus: "pending"
      });

      await this.deps.rawPostRepo.save(post);
      await this.deps.parseQueue.enqueue(post.id);
      newPosts++;
    }

    return { newPosts, skipped };
  }
}
