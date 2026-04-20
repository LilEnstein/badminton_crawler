# Plan — 01 Authentication

## Step 1 — Domain
- `src/domain/user/user.entity.ts` — invariants: email format, at least one of `passwordHash` or `googleSub`
- `src/domain/user/email.value-object.ts` — normalization + RFC validation
- `src/domain/user/refresh-token.entity.ts` — issuance, rotation, revocation invariants
- `src/domain/user/errors.ts` — `InvalidCredentialsError`, `EmailAlreadyRegisteredError`, `TokenReuseError`
- Unit tests: every invariant + every error path

## Step 2 — Application (use cases)
- `register-user.use-case.ts` — hash password, persist, emit `UserRegistered`
- `login-with-email.use-case.ts` — verify hash, issue tokens
- `login-with-google.use-case.ts` — verify Google ID token, upsert user by `googleSub`
- `rotate-refresh-token.use-case.ts` — rotate + detect reuse
- `logout.use-case.ts` — revoke refresh token
- Ports: `UserRepository`, `RefreshTokenRepository`, `PasswordHasher`, `TokenSigner`, `GoogleTokenVerifier`
- Stubbed-port unit tests for each use case

## Step 3 — Infrastructure
- `bcrypt.password-hasher.ts` (cost 12)
- `jwt.token-signer.ts` (HS256 or RS256 — env-driven)
- `google.token-verifier.ts` — official `google-auth-library`
- Postgres repositories for `User` + `RefreshToken`
- Integration tests against a test Postgres DB

## Step 4 — Interface
- `src/interfaces/http/routes/auth.routes.ts`
- Zod schemas reject unknown fields (per `api-design.md`)
- Rate limiter on `/login` + `/register` (Redis in Phase 2, in-memory in Phase 1)
- Response envelope: `{ data, meta: null, error: null }` on success

## Step 5 — Hardening
- Log auth failures at `warn` with `userId` omitted on invalid credentials
- Security-agent review before merge (see `.claude/skills/security-agent.md`)

## Done when
All acceptance criteria in `feature-spec.md` pass in CI, and `npm run test` is green locally.
