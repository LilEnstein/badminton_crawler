# Feature 03 — Skill Level System

**Source:** App-spec §2, §2.1, §2.2
**Phase:** 1 (foundational — used by 02, 05, 07)

## Goal
A single source of truth for the 10-level skill scale and the Vietnamese keyword → level mapping. Every part of the app (profile, parser, match score) reuses this.

## User stories
- As a developer, I can import `Level` and know it's validated 1–10.
- As the AI parser, I can map `"TB+"` → `[5, 6]` without hardcoding the table.

## Scope

### In scope
- `Level` value object (1–10) with human-readable name
- The 10-row level table (App-spec §2) as static data
- Keyword → level-range mapping (App-spec §2.2)
- Utility: `keywordsToLevelRange(text): { min, max } | null`
- Utility: `overlaps(rangeA, rangeB): boolean` for match scoring

### Out of scope
- User-specific overrides (Phase 3+)
- Per-region level calibration (Phase 3+)

## Acceptance criteria
- [ ] Constructing `Level` outside 1–10 throws `InvalidLevelError`
- [ ] `keywordsToLevelRange("newbie ok")` → `{ min: 1, max: 2 }`
- [ ] `keywordsToLevelRange("TB+, có chút trình")` → `{ min: 5, max: 6 }`
- [ ] `keywordsToLevelRange("không đề cập")` → `null`
- [ ] Table + mapping are exported as read-only constants, not mutable singletons

## Data
- `LEVELS: readonly LevelDescriptor[]` — 10 rows with `level`, `name`, `techniqueBrief`
- `KEYWORD_MAP: readonly { patterns: string[], min: Level, max: Level }[]`

## Dependencies
- None — pure domain module.

## Risks
- Keyword drift (new slang) → mapping lives in one file so it's easy to extend; parser logs unmatched posts for review
