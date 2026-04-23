import { FacebookBot } from "@/domain/crawl/facebook-bot.entity";

import type { FacebookBotRepository } from "./ports";

interface Deps {
  botRepo: FacebookBotRepository;
  encrypt: (plaintext: string) => string;
  ids: { generate(): string };
}

interface Input {
  label: string;
  cookiePlaintext: string;
}

export class AddBotUseCase {
  constructor(private deps: Deps) {}

  async execute(input: Input): Promise<FacebookBot> {
    const cookieEncrypted = this.deps.encrypt(input.cookiePlaintext);
    const bot = FacebookBot.create({
      id: this.deps.ids.generate(),
      label: input.label,
      cookieEncrypted,
      status: "active",
      lastUsedAt: null
    });
    await this.deps.botRepo.save(bot);
    return bot;
  }
}
