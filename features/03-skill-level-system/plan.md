# Plan — 03 Skill Level System

## Step 1 — Domain module
- `src/domain/skill/level.value-object.ts` — branded `Level` type, 1–10 validation
- `src/domain/skill/level-range.value-object.ts` — `{ min: Level, max: Level }`, invariant `min <= max`
- `src/domain/skill/level-table.ts` — frozen array mirroring App-spec §2
- `src/domain/skill/keyword-map.ts` — frozen array mirroring App-spec §2.2
- `src/domain/skill/errors.ts` — `InvalidLevelError`, `InvalidRangeError`

## Step 2 — Utilities
- `keywordsToLevelRange(text: string): LevelRange | null`
  - Normalize: lowercase, strip diacritics, collapse whitespace
  - First match wins; log unmatched text to an in-memory counter for Phase-2 analysis
- `overlaps(a: LevelRange, b: LevelRange): boolean`
- `distance(a: LevelRange, b: LevelRange): number` — used by match scoring

## Step 3 — Tests (100% of this module)
- Every level construction path (valid + invalid)
- Every keyword row from App-spec §2.2
- Diacritic / case / whitespace normalization cases
- Overlap / distance truth table

## Done when
- All tests pass
- Features 02, 05, 07 import only from `src/domain/skill/` (no copy-pasted level tables anywhere else)
