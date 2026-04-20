# Feature 02 — User Onboarding & Profile

**Source:** App-spec §1.3, §2.1, §5.1, §6.1
**Phase:** 1

## Goal
After sign-in, collect the badminton profile needed to score and filter sessions for the user.

## User stories
- As a new user, I can fill my profile in one flow so the app can rank sessions for me.
- As a returning user, I can edit any profile field later.

## Scope

### In scope
Profile fields (App-spec §5.1):
- Display name
- Skill level (1–10, see Feature 03)
- Primary area: city + district (multi-select)
- Preferred time slots: Morning / Noon / Afternoon / Evening
- Budget per session (VND, integer)
- Shuttle type: plastic / feather / any
- Gender preference: male / female / mixed / any
- Skill tolerance: ±1 or ±2 levels

### Out of scope
- Avatar upload (Phase 2)
- Social profile / friends (Phase 3+)

## Acceptance criteria
- [ ] `POST /api/v1/profiles` creates the profile in one request
- [ ] `PATCH /api/v1/profiles/me` updates any subset of fields
- [ ] `GET /api/v1/profiles/me` returns the current profile
- [ ] Level must be 1–10; tolerance ∈ {1, 2}
- [ ] District must exist in the districts reference table
- [ ] Budget must be ≥ 0 and in 10,000 VND steps
- [ ] A user without a profile cannot query the feed (Feature 08 enforces this)

## Data
- `UserProfile` entity: `userId`, `displayName`, `level`, `levelTolerance`, `city`, `districts[]`, `timeSlots[]`, `budgetVnd`, `shuttleType`, `genderPreference`, `updatedAt`
- Districts come from a seed table — not free text.

## Dependencies
- Feature 01 (authenticated user)
- Feature 03 (skill level value object)

## Risks
- Users picking the wrong level → show the App-spec §2 table inline during onboarding
