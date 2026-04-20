# Plan — 07 Match Scoring

## Step 1 — Domain (pure)
- `src/domain/match/match-score.value-object.ts` — `{ total: int, breakdown: { level, area, budget, time, shuttle } }`
- `src/domain/match/calculate-match-score.ts` — pure function, no deps outside `domain/`
- `src/domain/match/weights.ts` — constants mirroring App-spec §6.2

## Step 2 — Application glue
- `MatchScoreCalculator` port in `application/ports/`, implemented by a thin adapter that calls the pure function (keeps Feature 06's dependency explicit)

## Step 3 — Tests (100% coverage target)
- Level: full overlap, partial, beyond tolerance
- Area: in-list, not-in-list
- Budget: under, equal, over, ≥ 1.5× cap
- Time: hit, miss
- Shuttle: match, user=any, session=any, mismatch
- Missing fields: each criterion independently
- Rescaling: with 1–4 missing criteria, total still 0–100

## Step 4 — Integration with Feature 06
- Feature 06 calls the calculator per row or (Phase 2) uses a materialized score column

## Done when
- 100% branch coverage on the pure function
- Feature 06's integration tests assert sorted order matches calculator output
