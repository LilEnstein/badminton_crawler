import { BotNotFoundError } from "@/domain/crawl";

import type { CrawlAlerter, FacebookBotRepository } from "./ports";

interface Deps {
  botRepo: FacebookBotRepository;
  alerter: CrawlAlerter;
}

export class RotateBotUseCase {
  constructor(private deps: Deps) {}

  async execute(botId: string): Promise<void> {
    const bot = await this.deps.botRepo.findById(botId);
    if (!bot) throw new BotNotFoundError();

    bot.markNeedsRefresh();
    await this.deps.botRepo.save(bot);

    await this.deps.alerter.alert(
      `Bot ${bot.label} (${botId}) marked needs_refresh — manual cookie rotation required`
    );
  }
}
