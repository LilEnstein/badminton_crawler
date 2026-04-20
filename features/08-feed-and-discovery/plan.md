# Plan — 08 Feed & Discovery

## Step 1 — API surface
- `GET /api/v1/sessions` — already built in Feature 06
- `GET /api/v1/sessions/:id` — new endpoint, returns session + match score breakdown for the caller's profile

## Step 2 — Application
- `get-session-detail.use-case.ts`
  - Loads session, loads caller profile, calls `MatchScoreCalculator`
  - Returns DTO with all fields + breakdown
  - Throws `SessionNotFoundError` → 404

## Step 3 — Web UI (Phase 1)
- Stack: Next.js + Tailwind (already implied by App-spec §10)
- Pages: `/feed`, `/feed/[id]`
- Components: `SessionCard`, `ScoreBar`, `ScoreBreakdown`, `FilterChips`, `EmptyState`, `NeedsReviewBanner`
- Client fetches via the API envelope; a single `useSessions` hook wraps pagination + filters

## Step 4 — Mobile (Phase 2)
- React Native (Expo) with the same API
- Replace web components with RN equivalents; reuse the DTO types
- Add `MapView` with pins; compute distance client-side from device location

## Step 5 — Tests
- Use-case unit tests
- Playwright (or Cypress) smoke for `/feed` and `/feed/[id]`
- Lighthouse CI check on a11y ≥ 90

## Done when
- A user can log in, land on `/feed`, and open any session to see full detail + breakdown + working FB link
