# Feature 01 — Authentication

**Source:** App-spec §1.2, §5.1, §8.1, §9.1
**Phase:** 1 (email only) → 2 (Google OAuth)

## Goal
Let a user sign in to BadmintonFinder using email or Google OAuth. **No Facebook permission is ever requested from the user** — all Facebook access lives server-side via the bot account (Feature 04).

## User stories
- As a new user, I can register with email + password so I can start using the app.
- As a returning user, I can sign in with Google in one tap.
- As a user, I am never asked for Facebook credentials or permissions.

## Scope

### In scope
- Email + password registration and sign-in
- Google OAuth 2.0 sign-in (Phase 2)
- Session token issuance (JWT, 30-day refresh)
- Password reset via email (Phase 2)
- Logout (invalidate refresh token)

### Out of scope
- Facebook login (explicitly forbidden — see §9.1)
- Social login beyond Google (Phase 3+)
- 2FA / MFA (Phase 3+)

## Acceptance criteria
- [ ] `POST /api/v1/auth/register` creates a user with hashed password (bcrypt, cost ≥ 12)
- [ ] `POST /api/v1/auth/login` returns `{ accessToken, refreshToken, user }`
- [ ] `POST /api/v1/auth/google` accepts an ID token and returns the same shape
- [ ] `POST /api/v1/auth/refresh` rotates refresh tokens (reuse detection → revoke all)
- [ ] `POST /api/v1/auth/logout` revokes the current refresh token
- [ ] All failures return the envelope from `.claude/rules/api-design.md`
- [ ] Passwords never appear in logs, responses, or error messages

## Data
- `User` entity: `id (ULID)`, `email`, `passwordHash?`, `googleSub?`, `createdAt`, `lastLoginAt`
- `RefreshToken` entity: `id`, `userId`, `tokenHash`, `expiresAt`, `revokedAt?`

## Dependencies
- None — this is the entry point.

## Risks
- Credential stuffing → rate-limit `/login` by IP + email
- Token theft → short-lived access tokens (15 min), rotating refresh tokens
