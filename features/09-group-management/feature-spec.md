# Feature 09 — Group Management

**Source:** App-spec §3.1 Must Have, §6.1 "Quản lý nhóm"
**Phase:** 1 (operator-only) → 2 (per-user)

## Goal
Manage the list of Facebook groups the bot crawls. In Phase 1 this is an operator-only internal tool. In Phase 2 each user can pick which groups they want to follow.

## User stories
- As an operator, I add a new Facebook group URL and the crawler picks it up on the next cycle.
- As an operator, I pause a group when it goes private or the bot loses access.
- As a Phase-2 user, I toggle the groups that feed into my feed.

## Scope

### Phase 1 — In scope
- CRUD for `FacebookGroup { id, fbGroupId, name, url, status, addedAt }`
- Internal admin UI (or CLI) protected by `X-Internal-Token`
- Bot tests access to a newly added group before it goes `active`
- `status: active | paused | no_access`

### Phase 2 — In scope
- `UserGroupSubscription { userId, groupId, isActive }` join table
- User UI on the "Quản lý nhóm" screen
- Feed respects per-user subscriptions when filtering

### Out of scope
- Auto-discovering related groups (App-spec §3.1 Nice to Have — Phase 3+)
- Auto-joining groups from the app

## Acceptance criteria (Phase 1)
- [ ] `POST /api/v1/groups` (internal) creates a group after verifying the bot can load the URL
- [ ] `GET /api/v1/groups` lists all groups with status
- [ ] `PATCH /api/v1/groups/:id` updates status
- [ ] `DELETE /api/v1/groups/:id` removes a group; the crawler stops polling it within one cycle
- [ ] Crawler reads active groups from this table every cycle — no hard-coded list

## Data
- `FacebookGroup` entity (Phase 1)
- `UserGroupSubscription` entity (Phase 2)

## Dependencies
- Feature 04 (crawler uses the group list)
- Feature 01 (Phase 2: user auth for subscriptions)

## Risks
- Private groups the bot can't access → verification step on create; `status = no_access` with operator alert
