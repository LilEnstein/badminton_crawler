# Plan — 02 User Onboarding & Profile

## Step 1 — Domain
- `src/domain/profile/user-profile.entity.ts` — invariants: level range, tolerance ∈ {1,2}, budget non-negative, non-empty districts
- `src/domain/profile/time-slot.value-object.ts` — enum of 4 slots
- `src/domain/profile/gender-preference.value-object.ts`
- `src/domain/profile/shuttle-type.value-object.ts`
- Domain errors: `InvalidLevelError`, `UnknownDistrictError`
- Unit tests on every invariant

## Step 2 — Application
- `create-profile.use-case.ts`
- `update-profile.use-case.ts` (partial update)
- `get-my-profile.use-case.ts`
- Ports: `UserProfileRepository`, `DistrictCatalog`

## Step 3 — Infrastructure
- Postgres repository for `UserProfile`
- `DistrictCatalog` seeded from `infrastructure/seed/districts.vn.json` (Hà Nội + TP.HCM for MVP)

## Step 4 — Interface
- `POST /api/v1/profiles` (create, 201)
- `PATCH /api/v1/profiles/me` (update, 200)
- `GET /api/v1/profiles/me` (read, 200)
- Zod schemas; reject unknown fields
- Require authenticated `userId` from JWT middleware

## Step 5 — UX copy (Phase 1 web UI)
- Embed the 10-level table from App-spec §2 on the level-picker screen
- Budget slider: 10k step, range 0 – 500k

## Done when
- All acceptance criteria pass in CI
- A fresh user can complete onboarding in one screen
