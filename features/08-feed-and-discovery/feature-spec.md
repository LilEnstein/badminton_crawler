# Feature 08 — Feed & Discovery UI

**Source:** App-spec §3.1, §5.2, §6.1, §6.2
**Phase:** 1 (web, list + detail) → 2 (mobile + map)

## Goal
Give the user a single screen to scan matching sessions and drill into any one for full detail, including a link back to the original Facebook post.

## User stories
- As a user, I open the app and immediately see today's top-matched sessions.
- As a user, I open a session to see address, map, parsed info, match score breakdown, and the FB post link.
- As a user, I tap "Open Facebook" to contact the poster directly.

## Scope

### In scope — Phase 1 (web)
- Feed list view: card per session with match score, district, time, budget, level range, status
- Default sort: match score desc
- Quick filter chips (level, district, time slot) — full filter panel reuses Feature 06
- Detail view:
  - All parsed fields (App-spec §7.1)
  - Match score + 5-criterion breakdown (Feature 07)
  - "Open on Facebook" button (opens the original post URL in a new tab)
  - `needs_review` warning banner if confidence < 0.6
- Empty state copy in Vietnamese
- Error + loading states

### Scope — Phase 2 (mobile + map)
- React Native screens
- Google Maps map view with session pins
- Distance from current location
- Quick comment into app (deferred, App-spec §3.1 Nice to Have)

### Out of scope
- In-app messaging or booking
- User reviews / ratings of sessions

## Acceptance criteria
- [ ] `GET /api/v1/sessions` (Feature 06) powers the feed
- [ ] `GET /api/v1/sessions/:id` returns one session + match score breakdown
- [ ] "Open on Facebook" link uses the stored FB permalink; opens in a new tab / system browser
- [ ] Detail view renders every non-null field from the `Session` schema
- [ ] `needs_review` sessions are visible *only* when the user opts in via a filter toggle
- [ ] Lighthouse a11y score ≥ 90 on the feed and detail pages (Phase 1 web)

## Data
- Reads from Feature 05 (`Session`) and Feature 07 (match score)

## Dependencies
- Features 02, 03, 05, 06, 07

## Risks
- Users blaming the app for wrong FB data → the detail view always shows the "Open on Facebook" link as the ultimate source of truth
