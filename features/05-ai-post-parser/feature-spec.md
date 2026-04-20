# Feature 05 — AI Post Parser

**Source:** App-spec §7, §8.1, §10 Giai đoạn 1/2
**Phase:** 1 (Gemini) → 2 (Claude)

## Goal
Turn a raw Vietnamese Facebook post into a structured `Session` record (location, datetime, level range, budget, gender, shuttle type, contact, status). AI provider is pluggable behind a port so Phase 2 can swap Gemini → Claude without rewrites.

## User stories
- As the pipeline, I consume `RawPost` and emit either `Session` or `ParseFailure { reason }`.
- As an operator, I can replay failed parses after prompt changes.

## Scope

### In scope
- Prompt template embedding the level keyword map (App-spec §2.2)
- Few-shot examples of real Vietnamese post variants
- Output is JSON-only, validated by a Zod schema
- `confidence ∈ [0, 1]`; `< 0.6` → `needs_review`, not shown in top feed
- Intent detection: `type: "looking_for_players" | "court_available"`
- Special cases (App-spec §7.3): missing level, vague time, negotiable budget, closed status
- Provider abstraction: `PostParser` port with `GeminiParser` (Phase 1) + `ClaudeParser` (Phase 2)

### Out of scope
- Fine-tuning a model
- Parsing images, comments, or threads (Phase 3+)
- Translating non-Vietnamese posts

## Acceptance criteria
- [ ] `POST /crawl-jobs/parse` (internal, `X-Internal-Token`) accepts `{ rawPostId }`
- [ ] A parse job reads the raw post, calls the configured `PostParser`, validates JSON, persists a `Session`
- [ ] Fields that can't be inferred are set to `null`, never invented
- [ ] `needs_review` sessions are persisted but excluded from the public feed by default
- [ ] Schema errors or provider errors → `ParseFailure` row + job marked `failed` with reason
- [ ] Unit tests cover every App-spec §7.3 special case with fixture posts

## Data
- `Session` entity (mirrors App-spec §7.1 JSON): `id`, `rawPostId`, `location{district,city,address}`, `datetime{date,timeStart,timeEnd,isRecurring}`, `skillLevel{min,max}`, `budget{amount,currency,per,negotiable}`, `gender`, `playersNeeded`, `totalPlayers`, `shuttleType`, `contact`, `status`, `type`, `confidence`, `parsedAt`
- `ParseFailure` entity: `rawPostId`, `reason`, `providerRaw`, `failedAt`

## Dependencies
- Feature 03 (skill level keyword map)
- Feature 04 (raw post source)

## Risks
| Risk | Mitigation |
|---|---|
| Hallucinated fields | Strict Zod schema; reject non-JSON output |
| Slang / typos miss mapping | Log unmatched keywords for prompt tuning |
| Provider cost spike | Phase 1 on Gemini free tier; cap tokens per call; cache by `rawPostId` |
