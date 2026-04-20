# Feature 07 — Match Scoring

**Source:** App-spec §3.1 Should Have, §6.2
**Phase:** 1 (basic) → 2 (detailed breakdown UI)

## Goal
Compute a 0–100 match score per `(userProfile, session)` pair, broken into 5 weighted criteria so the UI can explain *why*.

## User stories
- As a user, I see a total score and a breakdown bar for each session.
- As the feed, I can sort sessions by score server-side.

## Scope

### Weights (App-spec §6.2)
| Criterion | Max |
|---|---|
| Skill level | 30 |
| Area (district) | 20 |
| Budget | 20 |
| Time slot | 20 |
| Shuttle type | 10 |
| **Total** | **100** |

### Scoring rules
- **Level:** full points if session `[min,max]` overlaps profile `[level±tolerance]`; linear decay by level distance, 0 at distance > tolerance + 2
- **Area:** full points if session district ∈ profile districts; 0 otherwise (Phase 2: partial for adjacent districts)
- **Budget:** full points if session budget ≤ profile budget; linear penalty down to 0 at 1.5× profile budget
- **Time slot:** full points if session time slot ∈ profile preferred slots; 0 otherwise
- **Shuttle:** full points if match or profile is `any`; 0 otherwise
- Missing field in session → criterion skipped; remaining criteria rescaled to /100 so the total is comparable

## Acceptance criteria
- [ ] Pure function `calculateMatchScore(profile, session): MatchScore` with `{ total, breakdown }`
- [ ] No I/O in the domain layer; use case just loads data and calls the function
- [ ] Breakdown names match App-spec §6.2: `level`, `area`, `budget`, `time`, `shuttle`
- [ ] `total` is an integer 0–100
- [ ] 100% unit test coverage on the scoring function (all branches)

## Data
- Input only — reads `UserProfile` + `Session`. No new table unless Phase 2 caching is added.

## Dependencies
- Feature 02 (profile)
- Feature 03 (level range utilities)
- Feature 05 (session)

## Risks
- Users disputing scores → the breakdown *is* the explanation; expose it in the detail view (Feature 08)
