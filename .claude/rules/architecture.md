# Architecture Rules

## Guiding Principles
Clean Architecture + SOLID. Dependencies point inward: Infrastructure → Application → Domain.
No layer may import from a layer outside its dependency direction.

## Layer Map
```
src/
├── domain/          # Entities, value objects, domain errors. Zero external deps.
├── application/     # Use cases, ports (interfaces). Depends only on domain.
├── infrastructure/  # Crawlers, parsers, DB adapters, HTTP clients. Implements ports.
└── interfaces/      # CLI, API routes, scheduled jobs. Orchestrates use cases.
```

## Domain Layer Rules
- Pure TypeScript / Python — no framework imports.
- Entities own their invariants; invalid state must be unrepresentable.
- No I/O, no async, no side effects.

## Application Layer Rules
- One use case = one class / function with a single public `execute()` entry point.
- Depend on port interfaces, never on concrete infrastructure.
- All external I/O is injected via constructor or function parameter.

## Infrastructure Layer Rules
- Implements ports defined in application layer.
- Handles retries, timeouts, rate-limiting, proxy rotation here — not in use cases.
- Each crawler targets one source domain; one class per source.

## SOLID Enforcement
| Principle | Rule |
|-----------|------|
| SRP | One reason to change. A crawler fetches; a parser extracts; a repository persists. |
| OCP | Extend via new crawlers/parsers, not `if source === 'X'` branches. |
| LSP | Subtypes must honour the parent contract without weakening preconditions. |
| ISP | Ports expose only the methods the use case needs — no fat interfaces. |
| DIP | Use cases depend on abstractions; infrastructure depends on use cases' ports. |

## Forbidden Patterns
- No circular imports.
- No `any` type casts without a comment explaining why.
- No business logic in HTTP route handlers or CLI commands.
- No direct `console.log` in production paths — use the injected logger.
- No hardcoded URLs, credentials, or timeouts — use config / env vars.
