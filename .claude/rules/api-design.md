# API Design Rules

## REST Conventions
- Resource URLs are plural nouns: `/courts`, `/venues`, `/sessions`
- Nested resources only one level deep: `/venues/:id/courts` — not `/venues/:id/courts/:courtId/sessions`
- Use HTTP verbs correctly: GET (read), POST (create), PUT (full replace), PATCH (partial update), DELETE
- Return 200 for successful reads, 201 for successful creates, 204 for deletes with no body
- Never return 200 with an error payload — use proper 4xx / 5xx codes

## Request & Response Shape
- Always return a consistent envelope:
  ```json
  { "data": {}, "meta": {}, "error": null }
  ```
- Paginated lists include `meta.total`, `meta.page`, `meta.pageSize`
- Dates in ISO 8601 UTC: `"2024-06-01T09:00:00Z"`
- IDs as strings (UUID or ULID), never sequential integers in public APIs

## Versioning
- Path-based versioning: `/api/v1/...`
- Never break a published contract — add fields, don't remove or rename

## Crawler / Scraper API (Internal)
- Crawl jobs are triggered via a `POST /crawl-jobs` endpoint or queue message
- Job status is polled via `GET /crawl-jobs/:id`
- Crawl results are persisted before the job is marked `completed`
- Rate-limit headers must be respected: `Retry-After`, `X-RateLimit-*`

## Validation
- Validate all inputs at the interface layer using a schema (Zod, Joi, class-validator)
- Reject unknown fields (`stripUnknown: false` — fail loudly on unexpected input)
- Return structured validation errors:
  ```json
  { "error": { "code": "VALIDATION_ERROR", "fields": { "url": "must be a valid URL" } } }
  ```

## Security
- No sensitive data (tokens, passwords, proxy credentials) in URLs or logs
- Authenticate internal job endpoints with a shared secret header `X-Internal-Token`
- Sanitize scraped HTML before storing or serving
