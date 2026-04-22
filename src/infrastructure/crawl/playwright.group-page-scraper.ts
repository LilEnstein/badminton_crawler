import type { RawPostCandidate, GroupPageScraper } from "@/application/crawl/ports";
import { LoginWallError, DomChangedError } from "@/domain/crawl";

const LOGIN_PATHS = ["/login", "/checkpoint", "/recover"];
const GROUP_SETTLE_MS = 8_000;
const POST_SETTLE_MS = 4_000;
const NAV_TIMEOUT_MS = 60_000;
const MIN_DELAY_MS = 2_000;
const MAX_DELAY_MS = 6_000;
const MAX_POSTS_PER_RUN = 10;
const MIN_POST_TEXT_LENGTH = 50;

function randomDelay(): Promise<void> {
  const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return new Promise((r) => setTimeout(r, ms));
}

export class PlaywrightGroupPageScraper implements GroupPageScraper {
  async scrape(groupId: string, cookie: string): Promise<RawPostCandidate[]> {
    const { chromium } = await import("playwright").catch(() => {
      throw new DomChangedError("playwright package not installed — run: npm install playwright");
    });

    // chromium-headless-shell crashes on some Windows installs (0xC0000142);
    // msedge is always present on Windows and is the reliable fallback.
    const channel = process.platform === "win32" ? "msedge" : undefined;
    const browser = await chromium.launch({ headless: true, channel });
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

    await page.goto(groupUrl, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS }).catch(() => undefined);
    await page.waitForTimeout(GROUP_SETTLE_MS);

    if (isLoginWall(page.url()) || (await hasLoginForm(page))) {
      await context.close();
      throw new LoginWallError();
    }

    const groupHtml = await page.content();
    const postIds = extractPostIdsFromHtml(groupHtml);

    if (postIds.length === 0) {
      await context.close();
      return [];
    }

    const candidates: RawPostCandidate[] = [];

    for (const fbPostId of postIds.slice(0, MAX_POSTS_PER_RUN)) {
      await randomDelay();
      try {
        const candidate = await scrapePostPage(page, groupId, fbPostId);
        if (candidate) candidates.push(candidate);
      } catch (err) {
        if (err instanceof LoginWallError) {
          await context.close();
          throw err;
        }
        // Skip individual post failures — don't abort the run
      }
    }

    await context.close();
    return candidates;
  }
}

async function scrapePostPage(
  page: import("playwright").Page,
  groupId: string,
  fbPostId: string
): Promise<RawPostCandidate | null> {
  const postUrl = `https://www.facebook.com/groups/${groupId}/posts/${fbPostId}/`;
  await page.goto(postUrl, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS }).catch(() => undefined);
  await page.waitForTimeout(POST_SETTLE_MS);

  if (isLoginWall(page.url()) || (await hasLoginForm(page))) {
    throw new LoginWallError();
  }

  const html = await page.content();
  const text = extractPostTextFromHtml(html) ?? (await extractPostTextFromDom(page));
  if (!text || text.length < MIN_POST_TEXT_LENGTH) return null;

  const authorName = await extractAuthorName(page);
  const postedAt = await extractPostedAt(page, fbPostId);

  return { fbPostId, authorName, text, postedAt };
}

// Facebook embeds post message in JSON blobs as {"message":{"text":"..."}}
// This is more reliable than DOM traversal since it's server-side rendered.
function extractPostTextFromHtml(html: string): string | null {
  const re = /"message":\{"text":"((?:[^"\\]|\\.)*)"/g;
  let best: string | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    try {
      const unescaped = JSON.parse(`"${m[1]}"`);
      if (typeof unescaped === "string" && unescaped.length > (best?.length ?? 0)) {
        best = unescaped;
      }
    } catch {
      // skip malformed match
    }
  }
  return best && best.length >= MIN_POST_TEXT_LENGTH ? best : null;
}

// Fallback: collect the longest unique [dir="auto"] text blocks that look like post content
async function extractPostTextFromDom(page: import("playwright").Page): Promise<string | null> {
  const elements = await page.locator('[dir="auto"]').all();
  const seen = new Set<string>();
  let longest = "";
  for (const el of elements) {
    const t = (await el.innerText().catch(() => "")).trim();
    if (t.length >= MIN_POST_TEXT_LENGTH && !seen.has(t) && !isUiNoise(t)) {
      seen.add(t);
      if (t.length > longest.length) longest = t;
    }
  }
  return longest || null;
}

const UI_NOISE_PATTERNS = [/^Privacy\s*[·•]/, /^Facebook$/, /^(Like|Comment|Share|Follow)$/, /^See (more|all|translation)$/i];

function isUiNoise(text: string): boolean {
  return UI_NOISE_PATTERNS.some((p) => p.test(text));
}

function extractPostIdsFromHtml(html: string): string[] {
  const seen = new Set<string>();
  for (const re of [/"story_fbid":"(\d+)"/g, /"top_level_post_id":"(\d+)"/g]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      if (m[1].length >= 10) seen.add(m[1]);
    }
  }
  // href-based fallback
  {
    const re = /\/posts\/(\d+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      if (m[1].length >= 10) seen.add(m[1]);
    }
  }
  return [...seen];
}

async function extractAuthorName(page: import("playwright").Page): Promise<string> {
  for (const sel of ["[role=\"article\"] h2 a", "[role=\"article\"] strong a", "[role=\"article\"] h3 a"]) {
    const name = await page.locator(sel).first().textContent().catch(() => null);
    if (name?.trim()) return name.trim();
  }
  return "Unknown";
}

async function extractPostedAt(page: import("playwright").Page, fbPostId: string): Promise<Date> {
  const timeLink = page.locator(`a[href*="/posts/${fbPostId}"]`).first();
  const label = await timeLink.getAttribute("aria-label").catch(() => null);
  if (label) {
    const d = new Date(label);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

function isLoginWall(url: string): boolean {
  return LOGIN_PATHS.some((p) => url.includes(p));
}

async function hasLoginForm(page: import("playwright").Page): Promise<boolean> {
  return page
    .locator('input[name="email"], input[name="pass"], form[action*="/login"]')
    .count()
    .then((n) => n > 0);
}

const VALID_SAME_SITE = new Set(["Strict", "Lax", "None"]);

function parseCookieJson(
  raw: string
): Array<{ name: string; value: string; domain: string; path: string; sameSite?: "Strict" | "Lax" | "None" }> {
  try {
    const parsed = JSON.parse(raw) as Array<{
      name: string;
      value: string;
      domain?: string;
      path?: string;
      sameSite?: string;
    }>;
    return parsed.map((c) => {
      const norm: { name: string; value: string; domain: string; path: string; sameSite?: "Strict" | "Lax" | "None" } = {
        name: c.name,
        value: c.value,
        domain: c.domain ?? ".facebook.com",
        path: c.path ?? "/"
      };
      if (c.sameSite && VALID_SAME_SITE.has(c.sameSite)) {
        norm.sameSite = c.sameSite as "Strict" | "Lax" | "None";
      }
      return norm;
    });
  } catch {
    throw new DomChangedError("Cookie is not valid JSON array");
  }
}
