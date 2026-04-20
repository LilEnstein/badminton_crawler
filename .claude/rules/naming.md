# Naming Conventions

## General
- Use meaningful, intention-revealing names. A reader should know *what* and *why* without a comment.
- No abbreviations unless industry-standard: `url`, `api`, `html`, `id`, `dto`, `repo`.
- Avoid noise words: `Manager`, `Handler`, `Helper`, `Utils` — name what the thing *does*.

## Variables & Parameters
- `camelCase`
- Names describe the value, not the type: `courtList` not `array`, `venueId` not `string`.
- Examples: `crawlResult`, `pageUrl`, `sessionDate`, `retryCount`

## Functions & Methods
- `camelCase`, verb-first.
- Name describes the *action*, not the caller: `fetchCourtDetails` not `courtDetailsFetcher`.
- Boolean-returning functions: prefix `is` / `has` / `can` / `should`.
- Examples: `crawlVenuePage`, `parseScheduleHtml`, `isSessionAvailable`, `hasValidProxy`

## Classes & Interfaces
- `PascalCase`
- Classes: concrete nouns or role names — `CourtCrawler`, `VenueParser`, `ScheduleRepository`
- Interfaces: prefix with `I` only when a concrete class shares the same name — `ICrawler` / `Crawler`
- DTOs / value objects: suffix with `Dto`, `Entity`, `Model` as appropriate

## Constants & Enums
- Module-level constants: `UPPER_SNAKE_CASE` — `MAX_RETRY_COUNT`, `DEFAULT_TIMEOUT_MS`
- Enum members: `PascalCase` — `CrawlStatus.Pending`, `CrawlStatus.Failed`

## Files & Folders
- `kebab-case` for all file and folder names
- Suffix files by role: `*.service.ts`, `*.crawler.ts`, `*.parser.ts`, `*.repository.ts`, `*.spec.ts`
- Test file mirrors source file path: `src/crawlers/venue.crawler.ts` → `src/crawlers/venue.crawler.spec.ts`

## Boolean Variables
- Prefix with `is` / `has` / `can` / `was`
- Examples: `isActive`, `hasProxy`, `canRetry`, `wasVisited`
