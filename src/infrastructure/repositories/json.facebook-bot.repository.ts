import { FacebookBot } from "@/domain/crawl/facebook-bot.entity";
import type { BotStatus } from "@/domain/crawl/facebook-bot.entity";
import type { FacebookBotRepository } from "@/application/crawl/ports";
import type { BadmintonStore, FacebookBotRecord } from "../db/json-store";

function toEntity(r: FacebookBotRecord): FacebookBot {
  return FacebookBot.create({
    id: r.id,
    label: r.label,
    cookieEncrypted: r.cookieEncrypted,
    status: r.status as BotStatus,
    lastUsedAt: r.lastUsedAt ? new Date(r.lastUsedAt) : null
  });
}

function toRecord(bot: FacebookBot): FacebookBotRecord {
  return {
    id: bot.id,
    label: bot.label,
    cookieEncrypted: bot.cookieEncrypted,
    status: bot.status,
    lastUsedAt: bot.lastUsedAt?.toISOString() ?? null
  };
}

export class JsonFacebookBotRepository implements FacebookBotRepository {
  constructor(private store: BadmintonStore) {}

  async findActive(): Promise<FacebookBot | null> {
    const bots = await this.store.facebookBots();
    const record = bots.find((b) => b.status === "active") ?? null;
    return record ? toEntity(record) : null;
  }

  async findById(id: string): Promise<FacebookBot | null> {
    const bots = await this.store.facebookBots();
    const record = bots.find((b) => b.id === id) ?? null;
    return record ? toEntity(record) : null;
  }

  async save(bot: FacebookBot): Promise<void> {
    await this.store.mutate((s) => {
      const idx = s.facebookBots.findIndex((b) => b.id === bot.id);
      if (idx >= 0) {
        s.facebookBots[idx] = toRecord(bot);
      } else {
        s.facebookBots.push(toRecord(bot));
      }
    });
  }
}
