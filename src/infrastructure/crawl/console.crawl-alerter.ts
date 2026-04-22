import type { CrawlAlerter } from "@/application/crawl/ports";

export class ConsoleCrawlAlerter implements CrawlAlerter {
  async alert(message: string): Promise<void> {
    // Phase 2: replace with webhook / PagerDuty
    console.error(`[CRAWL ALERT] ${message}`);
  }
}
