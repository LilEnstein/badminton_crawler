import { describe, expect, it } from "vitest";

import { InvalidBotError } from "@/domain/crawl/errors";
import { FacebookBot } from "./facebook-bot.entity";

const BASE = {
  id: "bot-1",
  label: "Bot Alpha",
  cookieEncrypted: "encrypted-cookie-data",
  status: "active" as const,
  lastUsedAt: null
};

describe("FacebookBot", () => {
  it("creates with valid props", () => {
    const bot = FacebookBot.create(BASE);
    expect(bot.status).toBe("active");
    expect(bot.lastUsedAt).toBeNull();
  });

  it("throws InvalidBotError for empty cookieEncrypted", () => {
    expect(() => FacebookBot.create({ ...BASE, cookieEncrypted: "" })).toThrow(InvalidBotError);
  });

  it("throws InvalidBotError for empty label", () => {
    expect(() => FacebookBot.create({ ...BASE, label: "  " })).toThrow(InvalidBotError);
  });

  it("markNeedsRefresh transitions to needs_refresh", () => {
    const bot = FacebookBot.create(BASE);
    bot.markNeedsRefresh();
    expect(bot.status).toBe("needs_refresh");
  });

  it("markBanned transitions to banned", () => {
    const bot = FacebookBot.create(BASE);
    bot.markBanned();
    expect(bot.status).toBe("banned");
  });

  it("markActive transitions to active from needs_refresh", () => {
    const bot = FacebookBot.create({ ...BASE, status: "needs_refresh" });
    bot.markActive();
    expect(bot.status).toBe("active");
  });

  it("markUsed records timestamp", () => {
    const bot = FacebookBot.create(BASE);
    const ts = new Date("2024-06-01T10:00:00Z");
    bot.markUsed(ts);
    expect(bot.lastUsedAt).toEqual(ts);
  });

  it("toPublic omits cookieEncrypted", () => {
    const bot = FacebookBot.create(BASE);
    const pub = bot.toPublic() as Record<string, unknown>;
    expect(pub.cookieEncrypted).toBeUndefined();
    expect(pub.label).toBe("Bot Alpha");
  });
});
