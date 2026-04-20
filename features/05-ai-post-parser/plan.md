# Plan — 05 AI Post Parser

## Step 1 — Domain
- `src/domain/session/session.entity.ts` — invariants mirroring App-spec §7.1
- `src/domain/session/parse-failure.entity.ts`
- Errors: `InvalidParserOutputError`, `ProviderUnavailableError`

## Step 2 — Application
- `parse-post.use-case.ts`
  - Load `RawPost`
  - Call `PostParser.parse(text)`
  - Validate with Zod
  - Compute `needs_review` flag
  - Persist `Session` or `ParseFailure`
- Ports: `PostParser`, `RawPostRepository`, `SessionRepository`, `ParseFailureRepository`

## Step 3 — Infrastructure (providers)
- `gemini.post-parser.ts` (Phase 1 default)
- `claude.post-parser.ts` (Phase 2)
- Shared: `prompts/parse-post.vi.md` — embeds level keyword map from Feature 03
- Shared: `schemas/parser-output.zod.ts` — strict schema, `stripUnknown: false`

## Step 4 — Interface
- Internal route `POST /crawl-jobs/parse` behind `X-Internal-Token`
- Bull worker consumes the parse queue produced by Feature 04

## Step 5 — Tests
- Fixture posts under `test/fixtures/posts/*.txt`, one per App-spec §7.3 special case
- Provider stub that returns canned JSON → unit tests the use case deterministically
- Real-provider integration tests are **opt-in** (`PARSER_LIVE=1`), never in CI

## Step 6 — Observability
- Log per-post: `{ rawPostId, provider, tokensIn, tokensOut, durationMs, confidence, needsReview }`
- Count unmatched skill keywords for Phase-2 prompt tuning

## Done when
- All §7.3 fixtures parse correctly against the stubbed provider
- A real Gemini call on a sample post yields `confidence > 0.6` for at least 80% of 20 curated posts
