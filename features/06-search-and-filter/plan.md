# Plan — 06 Search & Filter

## Step 1 — Domain
- `src/domain/session/session-filter.value-object.ts` — all fields optional, invariants on ranges
- Errors: `InvalidFilterError`

## Step 2 — Application
- `search-sessions.use-case.ts`
  - Merge explicit filters with profile defaults (for authed users)
  - Delegate to `SessionRepository.search(filter, pagination, sort)`
- Ports: `SessionRepository.search`, `MatchScoreCalculator` (from Feature 07)

## Step 3 — Infrastructure
- `postgres.session.repository.ts` — parameterized SQL, no string interpolation
- Migration adds the indexes listed in feature-spec
- Integration test asserts `EXPLAIN` uses expected indexes

## Step 4 — Interface
- `GET /api/v1/sessions`
- Zod schema for query params; reject unknown keys
- Envelope response; `meta.total/page/pageSize` populated

## Step 5 — Tests
- Unit: filter merge logic (explicit > profile default)
- Integration: seed 10k sessions, hit each filter combination, assert counts + p95 latency
- No `.skip`/`.only` in committed tests

## Done when
- All acceptance criteria pass
- A user with a profile hits `/api/v1/sessions` with no params and gets sessions sorted by their match score
