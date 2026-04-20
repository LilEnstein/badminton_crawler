# Feature 06 — Search & Filter

**Source:** App-spec §3.1 (Must Have), §4
**Phase:** 1

## Goal
Return parsed sessions that match the user's filter set, with server-side pagination and sorting.

## User stories
- As a user, I can filter sessions by level range, district(s), budget, time slot(s), gender, shuttle type, player count, and status.
- As a user, I get page 1 within 300 ms on realistic data (≤ 10k sessions).

## Scope

### In scope
Filters from App-spec §4:
| Filter | Type |
|---|---|
| Level range | min/max, 1–10 |
| Districts | multi-select |
| Budget | min/max VND |
| Time slots | multi-select (Morning/Noon/Afternoon/Evening) |
| Gender | single (M/F/Mixed/Any) |
| Shuttle type | multi-select (plastic/feather/any) |
| Player count | min/max |
| Status | `open` / `all` |

- Default sort: match score desc (uses Feature 07); fallback to `datetime.date asc`
- Pagination: `page`, `pageSize` (default 20, max 100)
- Excludes `needs_review` sessions (confidence < 0.6)
- Excludes sessions > 24 h past their start time

### Out of scope
- Free-text search (Phase 2)
- Saved filters (Phase 2 — overlaps with Feature 10 prefs)
- Geo radius search (Phase 2 — depends on Feature 08 map)

## Acceptance criteria
- [ ] `GET /api/v1/sessions?...` returns `{ data: Session[], meta: { total, page, pageSize }, error: null }`
- [ ] Unknown query params → 400 with structured validation error
- [ ] Level range filter uses `overlaps()` from Feature 03, not strict equality
- [ ] Budget range inclusive on both ends
- [ ] Response time p95 < 300 ms with 10k sessions in DB
- [ ] Results default to sorted by match score when the user is authenticated

## Data
- Reads `Session` (Feature 05)
- Requires indexes: `(district)`, `(date, time_start)`, `(status)`, GIN on `districts`/`time_slots` arrays

## Dependencies
- Feature 02 (user profile — for default filter values + match score)
- Feature 03 (level range overlap util)
- Feature 05 (session data)
- Feature 07 (match score for sorting)

## Risks
- Slow queries on large datasets → enforce indexes above; add `EXPLAIN` check in integration tests
