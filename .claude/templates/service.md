# Template: New Service / Crawler

Use this when adding a crawler or parser for a new data source.

## Checklist

### 1. Source Analysis
- [ ] Document the target URL pattern
- [ ] Identify rate-limit policy (requests/s, daily cap)
- [ ] Save one example HTML page as a fixture in `tests/fixtures/<source-name>/`

### 2. Crawler Class
- [ ] Create `src/infrastructure/crawlers/<source-name>.crawler.ts`
- [ ] Implement the `ICrawler` port interface
- [ ] Configure: timeout, max retries, backoff strategy, user-agent
- [ ] Respect `robots.txt` — check before shipping

### 3. Parser Class
- [ ] Create `src/infrastructure/parsers/<source-name>.parser.ts`
- [ ] Input: raw HTML string. Output: domain DTO or `null`.
- [ ] Handle missing/malformed fields gracefully (return `null`, log warning)
- [ ] Write parser tests against saved fixtures

### 4. Scheduler Registration
- [ ] Register the new crawler in the scheduler config
- [ ] Set crawl frequency appropriate to data freshness requirements
- [ ] Add deduplication check: skip URL if crawled within TTL

### 5. Monitoring
- [ ] Emit structured log events: `crawl.started`, `crawl.completed`, `crawl.failed`
- [ ] Track `pages_crawled`, `items_found`, `errors` per run

## Crawler Skeleton
```typescript
export class ExampleCrawler implements ICrawler {
  constructor(private readonly http: IHttpClient, private readonly logger: ILogger) {}

  async crawl(url: string): Promise<CrawlResult> {
    const response = await this.http.get(url);
    const parsed = new ExampleParser().parse(response.body);
    if (!parsed) {
      this.logger.warn('parse_failed', { url });
      return { items: [], url, status: 'parse_failed' };
    }
    return { items: [parsed], url, status: 'ok' };
  }
}
```
