import type {
  RawPostCandidate,
  GroupPageScraper,
  ScrapeDiagnostics,
  ScrapeResult
} from "@/application/crawl/ports";
import { LoginWallError, DomChangedError } from "@/domain/crawl";

const LOGIN_URL_PATTERNS = ["/login", "/checkpoint", "/recover", "/two_step_verification"];
const LOGIN_TITLE_PATTERNS = [/log in/i, /đăng nhập/i, /facebook – log in or sign up/i];
// High-precision only: these never appear on logged-in pages.
// Excluded: a[href*="/login"] — Facebook's footer has "Log In" links on every page.
const LOGIN_FORM_SELECTOR_LIST = [
  'input[name="pass"]',
  'input[type="password"]',
  'form[action*="/login"]',
  '[data-testid="royal_login_button"]'
];
const MIN_POST_TEXT_LENGTH = 50;

const IS_SERVERLESS = !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const GROUP_SETTLE_MS  = IS_SERVERLESS ? 5_000 : 8_000;
const POST_SETTLE_MS   = IS_SERVERLESS ? 2_500 : 4_000;
const NAV_TIMEOUT_MS   = IS_SERVERLESS ? 25_000 : 60_000;
const MIN_DELAY_MS     = IS_SERVERLESS ? 500   : 2_000;
const MAX_DELAY_MS     = IS_SERVERLESS ? 1_500  : 6_000;
const MAX_POSTS_PER_RUN = IS_SERVERLESS ? 3 : 10;

const CHROMIUM_PACK_URL =
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

function randomDelay(): Promise<void> {
  const ms = MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
  return new Promise((r) => setTimeout(r, ms));
}

function emptyDiagnostics(): ScrapeDiagnostics {
  return {
    finalUrl: "",
    pageTitle: "",
    htmlLength: 0,
    postIdsFound: 0,
    hasLoginForm: false,
    isLoginWallUrl: false,
    navError: null,
    bodyPreview: ""
  };
}

export class PlaywrightGroupPageScraper implements GroupPageScraper {
  async scrape(groupId: string, cookie: string): Promise<ScrapeResult> {
    const { chromium } = await import("playwright-core").catch(() => {
      throw new DomChangedError("playwright-core package not installed — run: npm install playwright-core");
    });

    const browser = await this.launchBrowser(chromium);
    try {
      return await this.scrapeWithBrowser(browser, groupId, cookie);
    } finally {
      await browser.close();
    }
  }

  private async launchBrowser(
    chromium: import("playwright-core").BrowserType
  ): Promise<import("playwright-core").Browser> {
    if (IS_SERVERLESS) {
      const sparticuz = await import("@sparticuz/chromium-min").then((m) => m.default ?? m);
      return chromium.launch({
        args: sparticuz.args,
        executablePath: await sparticuz.executablePath(CHROMIUM_PACK_URL),
        headless: Boolean(sparticuz.headless),
      });
    }

    const channel = process.platform === "win32" ? "msedge" : undefined;
    return chromium.launch({ headless: true, channel });
  }

  private async scrapeWithBrowser(
    browser: import("playwright-core").Browser,
    groupId: string,
    cookie: string
  ): Promise<ScrapeResult> {
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

    const diagnostics = emptyDiagnostics();
    try {
      await page.goto(groupUrl, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS });
    } catch (err) {
      diagnostics.navError = err instanceof Error ? err.message : String(err);
    }
    await page.waitForTimeout(GROUP_SETTLE_MS);

    diagnostics.finalUrl = page.url();
    diagnostics.pageTitle = await page.title().catch(() => "");
    diagnostics.isLoginWallUrl = isLoginWallUrl(diagnostics.finalUrl);
    const matchedLoginSelectors = await findMatchingLoginSelectors(page);
    diagnostics.hasLoginForm = matchedLoginSelectors.length > 0;
    if (diagnostics.hasLoginForm) {
      diagnostics.loginSelectorsMatched = matchedLoginSelectors;
    }

    const groupHtml = await page.content().catch(() => "");
    diagnostics.htmlLength = groupHtml.length;
    diagnostics.bodyPreview = await extractBodyPreview(page);

    const visibleLoginMatches = (diagnostics.loginSelectorsMatched ?? []).filter((m) => m.visible > 0);
    const hasVisibleLoginForm = visibleLoginMatches.length > 0;
    if (diagnostics.isLoginWallUrl || hasVisibleLoginForm || isLoginWallTitle(diagnostics.pageTitle)) {
      await context.close();
      throw new LoginWallError(loginDetail(diagnostics));
    }

    const postIds = extractPostIdsFromHtml(groupHtml);
    diagnostics.postIdsFound = postIds.length;

    if (postIds.length === 0) {
      await context.close();
      return { candidates: [], diagnostics };
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
      }
    }

    await context.close();
    return { candidates, diagnostics };
  }
}

async function scrapePostPage(
  page: import("playwright-core").Page,
  groupId: string,
  fbPostId: string
): Promise<RawPostCandidate | null> {
  const postUrl = `https://www.facebook.com/groups/${groupId}/posts/${fbPostId}/`;
  await page.goto(postUrl, { waitUntil: "domcontentloaded", timeout: NAV_TIMEOUT_MS }).catch(() => undefined);
  await page.waitForTimeout(POST_SETTLE_MS);

  if (isLoginWallUrl(page.url()) || (await hasLoginForm(page))) {
    throw new LoginWallError("post-page");
  }

  const html = await page.content();
  const text = extractPostTextFromHtml(html) ?? (await extractPostTextFromDom(page));
  if (!text || text.length < MIN_POST_TEXT_LENGTH) return null;

  const { name: authorName, profileUrl: authorProfileUrl } = await extractAuthorInfo(page);
  const postedAt = await extractPostedAt(page, fbPostId);

  return { fbPostId, authorName, authorProfileUrl, text, postedAt };
}

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

async function extractPostTextFromDom(page: import("playwright-core").Page): Promise<string | null> {
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
  {
    const re = /\/posts\/(\d+)/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(html)) !== null) {
      if (m[1].length >= 10) seen.add(m[1]);
    }
  }
  return [...seen];
}

async function extractAuthorInfo(
  page: import("playwright-core").Page
): Promise<{ name: string; profileUrl: string | null }> {
  for (const sel of ["[role=\"article\"] h2 a", "[role=\"article\"] strong a", "[role=\"article\"] h3 a"]) {
    const el = page.locator(sel).first();
    const name = await el.textContent().catch(() => null);
    if (name?.trim()) {
      const href = await el.getAttribute("href").catch(() => null);
      const profileUrl = href ? `https://www.facebook.com${href.split("?")[0]}` : null;
      return { name: name.trim(), profileUrl };
    }
  }
  return { name: "Unknown", profileUrl: null };
}

async function extractPostedAt(page: import("playwright-core").Page, fbPostId: string): Promise<Date> {
  const timeLink = page.locator(`a[href*="/posts/${fbPostId}"]`).first();
  const label = await timeLink.getAttribute("aria-label").catch(() => null);
  if (label) {
    const d = new Date(label);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

function isLoginWallUrl(url: string): boolean {
  return LOGIN_URL_PATTERNS.some((p) => url.includes(p));
}

function isLoginWallTitle(title: string): boolean {
  return LOGIN_TITLE_PATTERNS.some((p) => p.test(title));
}

async function hasLoginForm(page: import("playwright-core").Page): Promise<boolean> {
  return page
    .locator(LOGIN_FORM_SELECTOR_LIST.join(", "))
    .count()
    .then((n) => n > 0)
    .catch(() => false);
}

// Returns each selector that matched and how many elements — distinguishes a
// real login wall (multiple matches) from FB's hidden re-auth form (1 match).
async function findMatchingLoginSelectors(
  page: import("playwright-core").Page
): Promise<Array<{ selector: string; count: number; visible: number }>> {
  const matches: Array<{ selector: string; count: number; visible: number }> = [];
  for (const selector of LOGIN_FORM_SELECTOR_LIST) {
    const count = await page.locator(selector).count().catch(() => 0);
    if (count === 0) continue;
    const visible = await page
      .locator(selector)
      .evaluateAll((els) => els.filter((el) => (el as HTMLElement).offsetParent !== null).length)
      .catch(() => 0);
    matches.push({ selector, count, visible });
  }
  return matches;
}

async function extractBodyPreview(page: import("playwright-core").Page): Promise<string> {
  const text = await page.locator("body").innerText().catch(() => "");
  return text.replace(/\s+/g, " ").trim().slice(0, 200);
}

function loginDetail(d: ScrapeDiagnostics): string {
  const bits: string[] = [];
  if (d.isLoginWallUrl) bits.push(`url=${d.finalUrl}`);
  if (d.loginSelectorsMatched?.length) {
    const sel = d.loginSelectorsMatched
      .map((m) => `${m.selector}=${m.visible}/${m.count}`)
      .join(" ");
    bits.push(`form=[${sel}]`);
  }
  if (d.pageTitle) bits.push(`title="${d.pageTitle}"`);
  return bits.join(" ");
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
