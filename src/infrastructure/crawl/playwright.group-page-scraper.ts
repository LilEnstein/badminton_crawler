import type { RawPostCandidate, GroupPageScraper } from "@/application/crawl/ports";
import { LoginWallError, DomChangedError } from "@/domain/crawl";

const LOGIN_PATHS = ["/login", "/checkpoint", "/recover"];
const MIN_DELAY_MS = 2_000;
const MAX_DELAY_MS = 8_000;

function randomDelay(): Promise<void> {
  const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return new Promise((r) => setTimeout(r, ms));
}

function extractPostId(url: string): string | null {
  const m = url.match(/\/permalink\/(\d+)\/?/) ?? url.match(/[?&]story_fbid=(\d+)/);
  return m?.[1] ?? null;
}

export class PlaywrightGroupPageScraper implements GroupPageScraper {
  async scrape(groupId: string, cookie: string): Promise<RawPostCandidate[]> {
    // Dynamic import keeps Playwright out of the serverless bundle.
    // On Vercel or any environment without a browser binary this will throw;
    // the use-case caller is responsible for catching and alerting.
    const { chromium } = await import("playwright").catch(() => {
      throw new DomChangedError("playwright package not installed — run: npm install playwright");
    });

    const browser = await chromium.launch({ headless: true });
    try {
      return await this.scrapeWithBrowser(browser, groupId, cookie);
    } finally {
      await browser.close();
    }
  }

  private async scrapeWithBrowser(
    browser: import("playwright").Browser,
    groupId: string,
    cookie: string
  ): Promise<RawPostCandidate[]> {
    const context = await browser.newContext({
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 800 },
      locale: "vi-VN"
    });

    const cookies = parseCookieJson(cookie);
    await context.addCookies(cookies);

    const page = await context.newPage();
    const groupUrl = `https://www.facebook.com/groups/${groupId}`;
    await page.goto(groupUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });

    if (isLoginWall(page.url())) {
      await context.close();
      throw new LoginWallError();
    }

    const articles = await page.locator('[role="article"]').all();
    if (articles.length === 0) {
      // Not necessarily an error — group may be empty or DOM changed
      await context.close();
      return [];
    }

    const candidates: RawPostCandidate[] = [];

    for (const article of articles) {
      await randomDelay();

      try {
        const postUrl = await article.locator("a[href*='/permalink/']").first().getAttribute("href");
        if (!postUrl) continue;
        const fbPostId = extractPostId(postUrl);
        if (!fbPostId) continue;

        const text = await article.innerText();
        if (!text.trim()) continue;

        const authorEl = article.locator("h2 a, h3 a").first();
        const authorName = (await authorEl.textContent()) ?? "Unknown";

        const timeEl = article.locator("abbr[data-utime], a[aria-label]").first();
        const utime = await timeEl.getAttribute("data-utime");
        const postedAt = utime ? new Date(Number(utime) * 1000) : new Date();

        candidates.push({ fbPostId, authorName: authorName.trim(), text: text.trim(), postedAt });
      } catch {
        // Skip malformed article; don't abort the whole run
      }
    }

    await context.close();
    return candidates;
  }
}

function isLoginWall(url: string): boolean {
  return LOGIN_PATHS.some((p) => url.includes(p));
}

function parseCookieJson(raw: string): Array<{ name: string; value: string; domain: string; path: string }> {
  try {
    const parsed = JSON.parse(raw) as Array<{ name: string; value: string; domain?: string; path?: string }>;
    return parsed.map((c) => ({
      name: c.name,
      value: c.value,
      domain: c.domain ?? ".facebook.com",
      path: c.path ?? "/"
    }));
  } catch {
    throw new DomChangedError("Cookie is not valid JSON array");
  }
}
