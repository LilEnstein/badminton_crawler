# Code Style

## General
- Max line length: **100 characters**.
- Max function length: **30 lines**. Extract helpers if exceeded.
- Max file length: **300 lines**. Split by responsibility if exceeded.
- No dead code. Remove commented-out blocks before committing.

## TypeScript / JavaScript
- Strict mode always on: `"strict": true` in tsconfig.
- Prefer `const` over `let`; never `var`.
- Prefer `async/await` over raw `.then()` chains.
- Destructure objects when using ≥ 2 properties: `const { url, timeout } = config`.
- Use optional chaining `?.` and nullish coalescing `??` instead of manual null checks.
- Return early to reduce nesting — guard clauses, not nested ifs.
- Typed errors: define domain-specific error classes, never `throw new Error('string')` alone.

## Python (if applicable)
- PEP 8 + Black formatting.
- Type hints on all public functions.
- Dataclasses or Pydantic models for structured data — no raw dicts across boundaries.
- Raise specific exceptions (`VenueNotFoundError`), never bare `except:`.

## Comments
- Write **no** comments unless the WHY is non-obvious (hidden constraint, workaround, invariant).
- Never describe what the code does — names do that.
- Acceptable: `# Puppeteer crashes on redirects >10; limit manually` or `// Rate-limit window is 1 req/s per IP`.

## Imports
- Group order: stdlib → third-party → internal. One blank line between groups.
- No wildcard imports (`import * as X`).
- Absolute imports for cross-module; relative only within the same module folder.

## Error Handling
- Handle errors at the boundary where you can add context or recover.
- Wrap third-party errors into domain errors before propagating up.
- Log the original error stack; never swallow exceptions silently.
