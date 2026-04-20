# Plan — 09 Group Management

## Step 1 — Domain
- `src/domain/crawl/facebook-group.entity.ts` — invariants: `fbGroupId` non-empty, valid URL, legal status transitions
- Errors: `GroupNotFoundError`, `GroupAccessError`, `DuplicateGroupError`

## Step 2 — Application
- `add-group.use-case.ts` — calls `FacebookAccessTester` before insert
- `list-groups.use-case.ts`
- `update-group-status.use-case.ts`
- `remove-group.use-case.ts`
- Ports: `FacebookGroupRepository`, `FacebookAccessTester`

## Step 3 — Infrastructure
- `postgres.facebook-group.repository.ts` — unique index on `fbGroupId`
- `playwright.facebook-access-tester.ts` — reuses the bot session to load the group URL and detect access

## Step 4 — Interface
- Internal routes under `/api/v1/groups/*` gated by `X-Internal-Token`
- Phase 2: public per-user subscription endpoints

## Step 5 — Crawler integration
- Feature 04's `crawl-groups.job` reads `status = active` groups each cycle — no env / config list

## Step 6 — Tests
- Unit on each use case with stubbed tester + repo
- Integration: add a group → access tester fails → group saved with `status = no_access`

## Done when
- Operator can add, pause, delete groups via the API
- Feature 04 only crawls groups listed as `active`
