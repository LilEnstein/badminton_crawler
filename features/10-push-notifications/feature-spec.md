# Feature 10 — Push Notifications

**Source:** App-spec §3.1 Should Have, §5.2, §6.1
**Phase:** 2 (not in Phase 1)

## Goal
When a newly parsed session matches a user's filters with a high enough score, push a notification ("3 sân mới khớp hôm nay") so they open the app.

## User stories
- As a user, I get a daily digest when ≥ 1 high-scoring session is available.
- As a user, I can set quiet hours.
- As a user, I can opt out entirely.

## Scope

### In scope
- FCM registration: device token stored per user, rotated on refresh
- Trigger: after Feature 05 persists a new `Session`, evaluate which users match it with score ≥ threshold (default 70)
- Batching: one digest push per user per configurable window (default: once every 2 h, not during quiet hours)
- Preferences: `enabled`, `quietHoursStart`, `quietHoursEnd`, `minScore`
- Deep link into the session detail screen

### Out of scope
- Email or SMS channels
- In-app inbox (Phase 3+)
- Per-group notification preferences (Phase 3+)

## Acceptance criteria
- [ ] `POST /api/v1/notifications/devices` registers an FCM token
- [ ] `DELETE /api/v1/notifications/devices/:token` removes one
- [ ] `GET/PATCH /api/v1/notifications/preferences` manages user prefs
- [ ] A new `Session` event triggers match evaluation; users with ≥ 1 unsent match receive a single digest push per window
- [ ] Quiet hours respected in the user's local timezone
- [ ] Deep link opens `/feed/[id]` when a single match, `/feed` when multiple
- [ ] Opted-out users never receive pushes

## Data
- `NotificationDevice { id, userId, fcmToken (unique), platform, createdAt, lastSeenAt }`
- `NotificationPreference { userId, enabled, quietHoursStart, quietHoursEnd, minScore }`
- `NotificationLog { id, userId, sessionIds[], sentAt, deliveryStatus }`

## Dependencies
- Features 01, 02, 05, 07

## Risks
- Noisy pushes → digest batching + `minScore` default of 70 + quiet hours
- Invalid tokens → on FCM `NOT_REGISTERED`, delete the device row
