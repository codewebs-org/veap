# Verification, cryptography, and 2FA hooks

`@veap/auth` includes AES-GCM encryption and `bcrypt` password hashing helpers, email verification and password reset workflows, and extensible hooks for Multi-Factor Authentication (2FA) and session augmentation.

## Cryptography and `ENCRYPTION_KEY`

`@veap/auth/server` uses AES-GCM to encrypt sensitive user secrets (such as TOTP keys and recovery codes) and `bcrypt` to hash passwords. On startup, `@veap/auth` validates that `process.env.ENCRYPTION_KEY` is set to a base64-encoded 16, 24, or 32-byte key.

Generate a valid 16-byte (128-bit) key for your `.env` file using OpenSSL:

```bash
openssl rand -base64 16
```

You can also use the cryptographic helpers from `@veap/auth/server` directly in your services:

```ts
import {
  decryptToString,
  encryptString,
  hashPassword,
  verifyPasswordHash,
} from "@veap/auth/server";

const passwordHash = await hashPassword("MySecretPassword123!");
const isValid = await verifyPasswordHash(passwordHash, "MySecretPassword123!");

const ciphertextBytes = encryptString("totp-secret-seed");
const plaintext = decryptToString(ciphertextBytes);
```

## Email verification and password reset flows

`@veap/auth` ships server facades and database tables (`email_verification_requests` and `password_reset_sessions`) for verifying user email addresses and handling forgot-password flows. Delivery is handled through the `IAuthNotificationService` port, which dispatches via `@veap/mail` when configured:

```ts
import {
  createEmailVerificationRequest,
  createPasswordResetSession,
  sendResetPassword,
  sendVerifyEmail,
  setEmailVerificationRequestCookie,
  setPasswordResetSessionTokenCookie,
  verifyResetCode,
} from "@veap/auth";
import { generateSessionToken } from "@veap/auth/server";

// 1. Start email verification for a user
const verificationReq = await createEmailVerificationRequest(
  user.id,
  user.email,
);
await sendVerifyEmail(verificationReq.email, verificationReq.code);
await setEmailVerificationRequestCookie(verificationReq);

// 2. Start a password reset session
const resetToken = generateSessionToken();
const resetSession = await createPasswordResetSession(
  resetToken,
  user.id,
  user.email,
);
await sendResetPassword(resetSession.email, resetSession.code);
await setPasswordResetSessionTokenCookie(resetToken, resetSession.expiresAt);

// 3. Verify the 6-digit reset code submitted by the user
const check = await verifyResetCode(resetSession.id, submittedCode);
```

### Customizing notifications (`AUTH_NOTIFICATION_SERVICE`)

To route authentication emails or SMS codes through a custom provider, implement `IAuthNotificationService` and bind it to `AUTH_NOTIFICATION_SERVICE`:

```ts
import {
  AUTH_NOTIFICATION_SERVICE,
  type IAuthNotificationService,
} from "@veap/auth";
import { ServiceProvider } from "@veap/kernel";

export class CustomAuthNotifier implements IAuthNotificationService {
  async sendVerificationEmail(email: string, code: string): Promise<void> {
    // Deliver verification code via custom API or SMS
  }

  async sendPasswordReset(email: string, code: string): Promise<void> {
    // Deliver password reset code via custom API
  }

  async sendRecoveryCode(email: string, code: string): Promise<void> {
    // Deliver recovery code via custom API
  }
}

export class CustomNotificationProvider extends ServiceProvider {
  register(): void {
    this.container.register({
      token: AUTH_NOTIFICATION_SERVICE,
      useClass: CustomAuthNotifier,
      singleton: true,
    });
  }
}
```

## Identity augmentation and 2FA challenge hooks

Plugins and application modules can enrich the authenticated `user` and `session` objects or intercept login to require Multi-Factor Authentication (2FA) challenges using extensible registry hooks:

### 1. Enriching user and session data (`registerIdentityAugmenter` and `registerSessionAugmenter`)

Register an identity augmenter in a `ServiceProvider.boot()` method to attach custom properties (such as billing tier, active organization, or team permissions) to the `FullUser` object returned by `getCurrentSession()`:

```ts
import { registerIdentityAugmenter, registerSessionAugmenter } from "@veap/auth";

// Append extra profile data to the authenticated user
registerIdentityAugmenter("organization-data", async (user) => {
  // Query custom organization table
  return {
    organizationId: "org_123",
    plan: "pro",
  };
});

// Append custom flags to the active session
registerSessionAugmenter("device-info", async (session) => {
  return {
    isTrustedDevice: true,
  };
});
```

### 2. Intercepting authentication (`registerAuthValidator`)

Run custom validation during `signIn()`. If a validator returns `CHALLENGE_REQUIRED`, `signIn` halts before issuing a session cookie, enabling your UI to present a 2FA prompt:

```ts
import { registerAuthValidator } from "@veap/auth";

registerAuthValidator("totp-check", async (userId) => {
  const user = await User.find(userId);
  if (user?.totp_key) {
    return {
      status: "CHALLENGE_REQUIRED",
      challengeType: "totp",
      userId,
    };
  }
  return { status: "SUCCESS" };
});
```

Once the user provides a valid 6-digit TOTP code, call `finalizeLogin(userId, { twoFactorVerified: true })` from your 2FA verification action to create the authenticated session cookie.

### 3. Enforcing route security gates (`registerSecurityRequirement`)

Enforce prerequisite conditions (such as mandatory onboarding or email verification) before granting access to protected routes:

```ts
import { registerSecurityRequirement } from "@veap/auth";

registerSecurityRequirement("verified-email-required", async (session, user, path) => {
  if (path?.startsWith("/dashboard") && !user.emailVerifiedAt) {
    return {
      satisfied: false,
      redirect: "/verify-email",
    };
  }
  return { satisfied: true };
});
```
