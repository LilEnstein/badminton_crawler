# Plan — 04 Facebook Bot Crawler

## Step 1 — Domain
- `src/domain/crawl/raw-post.entity.ts` — invariants: non-empty `fbPostId`, `text`, `postedAt`
- `src/domain/crawl/facebook-bot.entity.ts` — invariants on status transitions
- `src/domain/crawl/errors.ts` — `LoginWallError`, `BotBannedError`, `DomChangedError`

## Step 2 — Application
- `crawl-group.use-case.ts` — accepts `groupId`, returns `{ newPosts, skipped }`
- `rotate-bot.use-case.ts` — swap active bot when current fails
- Ports:
  - `FacebookSessionProvider` — returns decrypted cookie for an active bot
  - `GroupPageScraper` — `scrape(groupId, cookie): Promise<RawPostCandidate[]>`
  - `RawPostRepository` — dedup + persist
  - `ParseJobQueue` — enqueue for Feature 05
  - `CrawlAlerter` — operator alert

## Step 3 — Infrastructure
- `playwright.group-page-scraper.ts`
  - Headless Chromium, realistic UA + viewport
  - Text-based locators (e.g. `role=article`, `text=/giao lưu|tìm/`) — no class selectors
  - Random delay 2–8 s between posts
  - Detects login wall by URL `/login` or presence of login form
- `aes-gcm.facebook-session-provider.ts` — decrypt cookie from env
- `postgres.raw-post.repository.ts` — `fbPostId` unique index
- `bull.parse-job-queue.ts`

## Step 4 — Interface / Scheduling
- `src/interfaces/jobs/crawl-groups.job.ts` — cron `*/15 * * * *`
- Alert adapter: log + optional webhook in Phase 2

## Step 5 — Tests
- Fixtures: `test/fixtures/fb-group-page-*.html` (3–5 real snapshots, scrubbed)
- Unit: selector resolver handles each fixture
- Integration: login-wall fixture → crawler stops + alerts
- No live Facebook calls in CI

## Step 6 — Operational
- Runbook in `docs/runbooks/crawl-bot.md` (Phase 2) — how to refresh a cookie
- Never log cookies or post text at `info` level; scrub in error logs

## Done when
- Cron runs in a local dev env, pulls ≥ 1 new post from a real group, enqueues a parse job, persists the raw post — and fixtures-based CI is green.
