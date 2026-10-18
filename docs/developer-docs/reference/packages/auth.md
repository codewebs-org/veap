# `@veap/auth` API reference

`@veap/auth` provides authentication, database-backed session management, password hashing (`bcrypt`), AES-GCM encryption, Role-Based Access Control (RBAC), email verification, password reset flows, and Next.js Server Actions.

## Subpath exports

`@veap/auth` provides seven entry points in `package.json`:

| Subpath | Description |
| :--- | :--- |
| `@veap/auth` | Main barrel exporting `AuthServiceProvider`, Server Actions (`signIn`, `signUp`, `signOut`, `getCurrentSession`), notification helpers (`sendVerifyEmail`, `sendResetPassword`, `sendRecoveryCode`, `send2FACode`), RBAC helpers, and validation schemas. |
| `@veap/auth/server` | Server-only cryptographic utilities (`hashPassword`, `verifyPasswordHash`, `encrypt`, `decrypt`, `encryptionKey`), `SessionService`, `UserService`, and `RbacService`. |
| `@veap/auth/client` | Client React components and hooks (`<AuthProvider>`, `useUser`, `useAuthRoutes`). |
| `@veap/auth/actions` | Next.js Server Actions (`signIn`, `signUp`, `signOut`, `getCurrentSession`, `requestPasswordReset`, `resetPassword`, `verifyEmail`, RBAC actions). |
| `@veap/auth/models` | Active Record models (`User`, `Session`, `Role`, `Permission`, `EmailVerificationRequest`, `PasswordResetSession`). |
| `@veap/auth/migrations` | Knex schema migrations (`authMigrations`) for authentication and RBAC tables. |
| `@veap/auth/validation` | Zod validation schemas (`loginSchema`, `registerSchema`, `forgotPasswordSchema`, `resetPasswordSchema`). |

## `AuthServiceProvider` options

Register `AuthServiceProvider` in `lib/veap.ts`:

```ts
.use((c) => new AuthServiceProvider(c, { autoMigrate: true }))
```

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `autoMigrate` | `boolean` | `true` | Automatically applies `@veap/auth` database migrations during `boot()`. |

## Server Actions and session functions

All mutation actions return `@veap/kernel`'s `Result<T>` discriminated union:

| Function | Signature | Description |
| :--- | :--- | :--- |
| `signIn` | `signIn(input: { email: string; password: string })` | Validates credentials, sets a session cookie, returns raw `token` in `result.data.token` on success, or returns `{ status: "CHALLENGE_REQUIRED", ... }` when a 2FA hook is active. |
| `signUp` | `signUp(input: { username: string; email: string; password: string })` | Creates a new user account, hashes the password, initiates a session, and returns raw `token` in `result.data.token`. |
| `signOut` | `signOut()` | Invalidates the active database session and deletes the session cookie. |
| `getCurrentSession` | `getCurrentSession()` | Resolves the active `session` and `user` by checking `Authorization: Bearer <token>` first, then falling back to the session cookie (`null` if unauthenticated). |

## Active Record models (`@veap/auth/models`)

`@veap/auth/models` exports the following `@veap/database` models:

| Model | Table | Key Relations & Columns |
| :--- | :--- | :--- |
| `User` | `users` | `id`, `username`, `email`, `password`, `email_verified`, `totp_key`, `recovery_code`, `roles()`, `sessions()` |
| `Session` | `sessions` | `id`, `user_id`, `expires_at`, `two_factor_verified`, `user()` |
| `Role` | `roles` | `id`, `name`, `description`, `permissions()`, `users()` |
| `Permission` | `permissions` | `id`, `name`, `description`, `roles()` |

## Authentication notifications port (`IAuthNotificationService`)

`@veap/auth` defines a delivery port for authentication messages such as verification codes, password reset tokens, and recovery codes. Applications can register a custom notification service with the `AUTH_NOTIFICATION_SERVICE` token or rely on the default implementation that dispatches emails through `@veap/mail`.

| Symbol | Kind | Signature / Type | Description |
| :--- | :--- | :--- | :--- |
| `AUTH_NOTIFICATION_SERVICE` | `Token<IAuthNotificationService>` | `Symbol.for("veap:auth:notification-service")` | IoC token for binding a custom authentication notification service. |
| `IAuthNotificationService` | Interface | `{ sendVerificationEmail, sendPasswordReset, sendRecoveryCode, send2FACode? }` | Port contract implemented by notification services. |
| `DefaultAuthNotificationService` | Class | `new DefaultAuthNotificationService(mailerResolver?, eventBusResolver?)` | Default implementation delivering emails via `@veap/mail` when bound or logging codes to the console in development. |
| `sendVerifyEmail` | Function | `sendVerifyEmail(email: string, code: string): Promise<void>` | Dispatches email verification notification through the active service. |
| `sendResetPassword` | Function | `sendResetPassword(email: string, code: string): Promise<void>` | Dispatches password reset notification through the active service. |
| `sendRecoveryCode` | Function | `sendRecoveryCode(email: string, code: string): Promise<void>` | Dispatches recovery code notification through the active service. |
| `send2FACode` | Function | `send2FACode(email: string, code: string): Promise<void>` | Dispatches 2FA challenge code through the active service if supported. |

