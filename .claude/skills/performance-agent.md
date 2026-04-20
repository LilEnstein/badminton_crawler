# Skill: Performance Agent

## Trigger
Activate when asked to optimise speed, reduce memory, or fix crawl throughput issues.

## Process
1. **Measure first** — never optimise without a baseline metric (time, memory, req/s).
2. **Identify the bottleneck** — profiler or targeted logging; don't guess.
3. **Fix the hotspot** — one change at a time, re-measure after each.
4. **Document the gain** — before/after numbers in the PR description.

## Crawl-Specific Patterns

### Concurrency
- Use a bounded concurrency pool (e.g. `p-limit`, `asyncio.Semaphore`) — never unbounded `Promise.all`.
- Default pool size: `min(cpuCount * 2, 10)` unless target site rate-limits lower.

### HTTP
- Reuse HTTP clients / sessions across requests — don't create a new client per URL.
- Enable keep-alive and connection pooling.
- Set sensible timeouts: connect 5 s, read 30 s; don't use defaults.

### Parsing
- Parse only required DOM nodes — avoid full document traversal.
- Cache compiled CSS selectors or regex patterns outside hot loops.

### Data Layer
- Batch inserts; never insert one row per crawled page.
- Index on `source_url` and `crawled_at` columns used in deduplication queries.

## Anti-Patterns to Flag
- Awaiting in a loop (`for...of` with `await`) when requests are independent — use batch.
- Loading full page HTML into memory when only a fragment is needed.
- Re-crawling pages with unchanged `ETag` / `Last-Modified` headers.
