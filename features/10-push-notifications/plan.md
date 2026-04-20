# Plan — 10 Push Notifications

## Step 1 — Domain
- `src/domain/notification/notification-device.entity.ts`
- `src/domain/notification/notification-preference.entity.ts` — invariants: time-of-day format, `minScore` 0–100
- `src/domain/notification/digest.value-object.ts` — a pending digest for a user

## Step 2 — Application
- `register-device.use-case.ts`
- `remove-device.use-case.ts`
- `update-preferences.use-case.ts`
- `evaluate-new-session.use-case.ts`
  - Input: `sessionId`
  - For each user whose profile + prefs match, append to their pending digest
- `dispatch-digests.job.ts` — scheduled every 15 min; sends any user with pending matches outside quiet hours
- Ports: `NotificationDeviceRepository`, `NotificationPreferenceRepository`, `DigestRepository`, `PushSender`, `UserProfileRepository`, `SessionRepository`, `MatchScoreCalculator`

## Step 3 — Infrastructure
- `fcm.push-sender.ts` — handle `NOT_REGISTERED` → delete device
- Postgres repositories for device / preference / digest / log
- Bull job for `evaluate-new-session` (triggered by Feature 05 on `SessionParsed` event)
- Bull cron for `dispatch-digests`

## Step 4 — Interface
- Routes under `/api/v1/notifications/*`
- Auth middleware required on every endpoint

## Step 5 — Tests
- Use-case unit tests with stubbed ports
- Integration: simulate a new session → appropriate users get one digest; quiet-hours users don't
- Fake FCM sender in tests; never call live FCM in CI

## Done when
- A Phase-2 user with a device registered receives a digest push for a matching session within 15 min, respecting quiet hours
