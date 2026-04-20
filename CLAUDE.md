# CLAUDE.md — Working Contract for BadmintonFinder

This file is the **contract** between the user (owner of this project) and Claude (the AI pair-programmer). Everything below is binding on every session unless the user explicitly overrides it for a single turn.

---

## 1. Project in one paragraph

**BadmintonFinder** aggregates Vietnamese badminton sessions posted to Facebook groups. A server-side Facebook **bot** scrapes posts with Playwright (the Groups API was removed in April 2024), an AI parser turns free-text Vietnamese posts into structured `Session` records, and users — authenticated via email/Google, **never** Facebook — filter and rank those sessions by skill level, district, budget, and time. See [App-spec.md](App-spec.md) for full product scope.

---

## 2. Source of truth (precedence order)

1. `.claude/rules/*.md` — non-negotiable engineering rules
2. `App-spec.md` — product scope and requirements
3. `features/XX-name/feature-spec.md` — per-feature scope
4. `features/XX-name/plan.md` — per-feature implementation plan
5. `.claude/templates/*.md` — scaffolding patterns
6. Conventions inferred from existing code

**On conflict, the higher item wins.** If a plan contradicts a rule, the rule is correct and the plan needs fixing.

---

## 3. Feature index

| # | Feature | Phase | Depends on |
|---|---|---|---|
| 01 | [Authentication](features/01-authentication/feature-spec.md) | 1 | — |
| 02 | [User Onboarding & Profile](features/02-user-onboarding/feature-spec.md) | 1 | 01, 03 |
| 03 | [Skill Level System](features/03-skill-level-system/feature-spec.md) | 1 | — |
| 04 | [Facebook Bot Crawler](features/04-facebook-bot-crawler/feature-spec.md) | 1 | 09 |
| 05 | [AI Post Parser](features/05-ai-post-parser/feature-spec.md) | 1 | 03, 04 |
| 06 | [Search & Filter](features/06-search-and-filter/feature-spec.md) | 1 | 02, 03, 05, 07 |
| 07 | [Match Scoring](features/07-match-scoring/feature-spec.md) | 1 | 02, 03, 05 |
| 08 | [Feed & Discovery](features/08-feed-and-discovery/feature-spec.md) | 1 → 2 | 02, 03, 05, 06, 07 |
| 09 | [Group Management](features/09-group-management/feature-spec.md) | 1 | 04 |
| 10 | [Push Notifications](features/10-push-notifications/feature-spec.md) | 2 | 01, 02, 05, 07 |

---

## 4. The contract

### 4.1 What Claude commits to

**Read before write.**
1. Read [App-spec.md](App-spec.md) and the relevant `features/XX/feature-spec.md` before changing feature code.
2. Read the feature's `plan.md` before writing a new module inside it.

**Follow the rules.**
3. [`.claude/rules/architecture.md`](.claude/rules/architecture.md) — Clean Architecture layers; dependencies only point inward; no business logic in routes or CLI.
4. [`.claude/rules/code-style.md`](.claude/rules/code-style.md) — 100 chars/line, 30 lines/function, 300 lines/file, strict TS, typed errors, no dead code.
5. [`.claude/rules/naming.md`](.claude/rules/naming.md) — no `Manager`/`Handler`/`Helper`/`Utils` noise words; kebab-case files; role suffixes (`.crawler.ts`, `.parser.ts`, `.repository.ts`, `.service.ts`, `.spec.ts`).
6. [`.claude/rules/testing.md`](.claude/rules/testing.md) — AAA structure, behaviour-driven names, real fixtures over mocks, no `.skip`/`.only` on merge, fix flakes don't retry them.
7. [`.claude/rules/api-design.md`](.claude/rules/api-design.md) — `/api/v1/<plural>`, `{ data, meta, error }` envelope, ISO UTC dates, ULID ids, Zod input validation, internal routes gated by `X-Internal-Token`.

**Use the scaffolding.**
8. When creating a new feature, walk the checklist in [`.claude/templates/feature.md`](.claude/templates/feature.md).
9. When creating a new service or component, start from the matching template.

**Invoke skills when they fit.**
10. Auth, crypto, scraper → consult [`.claude/skills/security-agent.md`](.claude/skills/security-agent.md) before merge.
11. Non-trivial refactor → [`.claude/skills/refactor-agent.md`](.claude/skills/refactor-agent.md).
12. Hot path / parser / DB query → [`.claude/skills/performance-agent.md`](.claude/skills/performance-agent.md).
13. Before calling anything done → run it past [`.claude/skills/code-reviewer.md`](.claude/skills/code-reviewer.md).
14. Writing new code → pair with [`.claude/skills/test-agent.md`](.claude/skills/test-agent.md).

**Ask first, then act.**
15. Ask before: running a migration, pushing to remote, deleting data or branches, modifying CI, force-pushing, or calling a paid API in a new way.
16. Never commit secrets (bot cookies, API keys, Google OAuth client secrets). Use env vars. If a secret slips in, stop and flag it.
17. Never skip hooks (`--no-verify`) or bypass signing unless explicitly asked.

**Stay in phase.**
18. **Phase 1 (Personal):** SQLite or single-node Postgres, Gemini free tier, web UI, self-deploy. No multi-user, no FCM, no Bull cluster.
19. **Phase 2 (Multi-user):** Postgres + Redis + Bull, Claude provider for the parser, React Native, FCM push.
    Do not build Phase 2 scaffolding inside Phase 1 code unless explicitly asked.

**Ship each feature.**
20. After finishing each feature (all items in §6 Definition of Done checked), commit the work on its `feat/<nn>-<name>` branch, merge into `test` for verification, then merge into `main` and deploy to Vercel. See §5.4 for the exact flow.

### 4.2 What the user commits to

1. Keep [App-spec.md](App-spec.md) authoritative. Scope changes land there first, then cascade to feature specs.
2. Interrupt early if the approach is wrong — don't wait for a full diff.
3. Flag priority shifts explicitly ("Phase 2 now", "park this", "stop and reassess").
4. Review for *intent*, not syntax.

---

## 5. How we work together

### 5.1 Response shape
- **Exploratory question** ("what could we do about X?") → 2–3 sentences + the main tradeoff. No code yet.
- **Implementation task** → short plan → code → tests → one-line summary.
- **Bug fix** → root cause first, then fix, then regression test.
- **In-flight updates** → one sentence at each checkpoint (find / change direction / blocker). Silent otherwise.
- **End of turn** → one or two sentences: what changed, what's next.

### 5.2 Todos
Use the TodoWrite tool whenever a task has ≥ 3 steps. Mark in_progress before starting, completed immediately on finishing. Never batch completions.

### 5.3 Code comments
Default to **zero comments.** Only add one when the WHY is non-obvious — a hidden constraint, a subtle invariant, a workaround for a specific bug. No "what" comments, no planning / decision / analysis documents unless the user asks.

### 5.4 Git flow & deployment

Three long-lived branches:

| Branch | Purpose | Deploys to |
|---|---|---|
| `main` | Production. Always green, always deployable. | Vercel **Production** |
| `test` | Staging / QA. Features land here first for verification. | Vercel **Preview** (staging) |
| `feat` | Integration branch for in-flight feature work (or use short-lived `feat/<nn>-<name>` branches off it). | Vercel **Preview** (per-branch) |

**Per-feature loop:**
1. Branch off `feat` → `feat/<nn>-<name>` (e.g. `feat/01-authentication`).
2. Commit in small, focused chunks. Messages follow Conventional Commits: `feat(auth): …`, `fix(crawler): …`, `chore: …`, `docs: …`, `test: …`.
3. When §6 Definition of Done is fully checked:
   a. Merge `feat/<nn>-<name>` → `test`. Verify on the staging preview.
   b. Merge `test` → `main`. Vercel auto-deploys production.
   c. Tag the release: `v<phase>.<feature-number>` (e.g. `v1.01`).
4. Never commit directly to `main` or `test` — always via merge from the branch below it.
5. Ask before pushing to remote, force-pushing, or triggering a production deploy (per rule §4.1.15).

---

## 6. Definition of Done

A change is only done when:

- [ ] Relevant feature-spec acceptance criteria are met
- [ ] Domain tests cover business rules (see testing.md coverage table)
- [ ] Use case tests cover happy path + known failure modes
- [ ] Infrastructure tests run against fixtures, not live network
- [ ] Response envelope + validation errors match [`api-design.md`](.claude/rules/api-design.md)
- [ ] No `any` casts without a comment explaining why
- [ ] No `console.log`, `.only`, `.skip`, or commented-out code
- [ ] Linter + type-checker pass
- [ ] Secrets are in env vars, not in code
- [ ] Work committed on `feat/<nn>-<name>`, merged to `test` and verified, merged to `main`, and deployed on Vercel (see §5.4)

---

## 7. Tech stack (from App-spec §8.1)

React Native (Expo) · Next.js (Phase 1 web) · Node.js + Express · Playwright · PostgreSQL · Redis · Bull · Gemini (Phase 1) / Claude (Phase 2) · Firebase FCM · Google Maps SDK

---

## 8. Directory layout

```
badminton-finder-crawl/
├── App-spec.md                 # product source of truth
├── CLAUDE.md                   # this contract
├── features/
│   └── <nn>-<name>/
│       ├── feature-spec.md
│       └── plan.md
├── .claude/
│   ├── system.md
│   ├── rules/                  # non-negotiable
│   ├── skills/                 # specialist agents
│   └── templates/              # scaffolding
└── src/                        # code (to be created)
    ├── domain/
    ├── application/
    ├── infrastructure/
    └── interfaces/
```

---

## 9. When this contract changes

Any change to CLAUDE.md or `.claude/rules/*` must be explicit — the user proposes, we discuss, then the file is updated in a single focused commit. Silent drift is a bug.
