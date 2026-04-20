# Feature 04 — Facebook Bot Crawler

**Source:** App-spec §1.2, §8.3, §9.2, §11
**Phase:** 1

## Goal
Run a centralized Playwright-based crawler that uses **bot Facebook accounts** (not user accounts) to fetch new posts from a configured list of badminton groups every 15–30 minutes. Raw posts are persisted and enqueued for parsing (Feature 05).

> The Facebook Groups API was removed in April 2024. Browser automation with a bot account is the only remaining path — see App-spec §8.3.

## User stories
- As the system, I pull new posts from each configured group on a fixed cadence.
- As an operator, I can rotate the bot session when a cookie expires or gets flagged.
- As an operator, I get an alert when the crawler fails repeatedly or the DOM changes.

## Scope

### In scope
- 1–3 bot Facebook accounts with encrypted cookies stored at rest
- Playwright (headless, realistic user-agent + viewport) visits each group page
- Dedup by Facebook post ID; only *new* posts enter the parse queue
- Random 2–8 s delay between requests, min 15 min between full cycles
- Retry with backoff on transient failures; circuit-break on login-wall detection
- Text-based selectors (not class names — FB hashes them)
- Alerting hook when 3 consecutive runs fail

### Out of scope
- Writing / liking / commenting on Facebook (explicitly forbidden, §9.3)
- Scraping profiles, DMs, or non-group content
- Real-time crawl (< 15 min)

## Acceptance criteria
- [ ] A cron-scheduled job runs the crawler every 15 min (configurable)
- [ ] Crawler reads cookies from `BOT_COOKIES_ENC` env var, decrypts with AES-256-GCM
- [ ] Each new post is persisted as `RawPost { id, groupId, authorName, text, postedAt, fetchedAt }`
- [ ] Enqueues a parse job for each new `RawPost` in Bull
- [ ] If login wall is detected, crawler stops, marks the bot as `needs_refresh`, alerts the operator, and does not retry with the same cookie
- [ ] Never commits cookies, bot passwords, or encryption keys to git
- [ ] Integration test runs against saved HTML fixtures (no live FB calls in CI)

## Data
- `FacebookBot` entity: `id`, `label`, `cookieEncrypted`, `status: active|needs_refresh|banned`, `lastUsedAt`
- `RawPost` entity: `fbPostId (unique)`, `groupId`, `authorName`, `text`, `postedAt`, `fetchedAt`, `parseStatus: pending|parsed|failed`

## Dependencies
- Feature 09 (group list) — the crawler iterates that list

## Risks
| Risk | Mitigation |
|---|---|
| Bot banned | 1–2 standby accounts, slow crawl, random delay |
| DOM change breaks parser | Text-based selectors, integration test fixtures, alert on zero-posts run |
| Cookie expiry | Auto-detect login wall, mark bot `needs_refresh`, operator alert |
| Legal / TOS exposure | No writes, read-only, rate-limited — document acceptance of risk |
