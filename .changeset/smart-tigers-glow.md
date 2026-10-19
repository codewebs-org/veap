---
"@veap/auth": patch
---

refactor(auth): cleanup dead code, fix event typings, reorder boot migrations, and add client tests

- Deduplicate `src/server.ts` to re-export root index entrypoint
- Remove unused `AppError` import in `AuthService`
- Remove unused `session` parameter in `performFullUserAugmentation` and deduplicate `augment.ts` re-exports in `logic.ts`
- Fix event bus alignment: emit `system:auth:signup` alongside `system:auth:register`, emit `system:auth:signed-out` on logout, and declare missing 2FA and recovery code event types
- Augment `@veap/kernel`'s `SystemEventsMap` with `AuthEventPayloads` for strongly typed event subscriptions
- Run migrations before `isSystemInstalled` in `AuthServiceProvider.boot()` to prevent spurious database table errors on fresh installs
- Add configurable `sessionEndpoint` to `AuthProvider` (defaults to `/api/auth/me`) and export `handleAuthMe` route handler helper from session facade
- Add inferred types for MFA schemas (`TotpSetupInput`, `TotpVerifyInput`, `BackupCodeInput`)
- Expose `validatePasswordResetSession` and `verifyPasswordResetSessionCode` from password reset facade
- Add unit tests for `@veap/auth/client` (`AuthProvider`, `useUser`, `useAuthRoutes`), validation helpers, and `handleAuthMe`
