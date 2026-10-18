# Server Actions and RBAC

`@veap/auth` provides ready-to-use Next.js Server Actions for login, registration, and session management alongside a database-backed Role-Based Access Control (RBAC) system.

## Server Actions (`signIn`, `signUp`, `signOut`)

`@veap/auth` (and `@veap/auth/actions`) exports Next.js Server Actions returning typed `Result<T>` payloads. Because `@veap/auth` communicates with cookies via `@veap/kernel`'s `COOKIE_STORE` port, session cookies are read and written automatically in Next.js:

```ts
// app/actions/auth.ts
"use server";

import { getCurrentSession, signIn, signOut, signUp } from "@veap/auth";
import { initializeSystem } from "@/lib/veap";

export async function loginAction(email: string, password: string) {
  await initializeSystem();

  const result = await signIn({ email, password });
  if (!result.success) {
    return result;
  }

  // Handle two-factor authentication (2FA) challenge if enabled on the account
  if (result.data.status === "CHALLENGE_REQUIRED") {
    return result;
  }

  return result;
}

export async function registerAction(
  username: string,
  email: string,
  password: string,
) {
  await initializeSystem();
  return await signUp({ username, email, password });
}

export async function logoutAction() {
  await initializeSystem();
  return await signOut();
}

export async function fetchSessionAction() {
  await initializeSystem();
  return await getCurrentSession();
}
```

When `signIn` or `signUp` succeeds, the returned `AuthResponse` (`result.data`)
contains:

- `status: "SUCCESS"`
- `user`: Authenticated `FullUser` object with augmented roles and permissions.
- `session`: Active database `Session` record.
- `token?: string`: Raw session token string.

Web browsers store the session token in an HTTP-only cookie automatically. For
mobile applications and external API clients, extract `result.data.token` and
store it securely on the device, then pass it in the `Authorization` header
(`Authorization: Bearer <token>`) on subsequent requests.

## Role-Based Access Control (RBAC)

`@veap/auth/models` provides `User`, `Role`, and `Permission` Active Record models linked by many-to-many pivot tables (`user_roles` and `role_permissions`). You can also use the RBAC Server Actions (`assignRoleToUser`, `assignPermissionToRole`, `createRole`, `createPermission`) from `@veap/auth`:

```ts
import { Permission, Role, User } from "@veap/auth/models";
import { hashPassword } from "@veap/auth/server";

// Create a role and permission
const editorRole = await Role.create({
  name: "editor",
  description: "Can create and publish articles",
});

const publishPerm = await Permission.create({
  name: "articles:publish",
  description: "Publish articles",
});

await editorRole.permissions().attach(publishPerm.id);

// Create a user and attach the role
const user = await User.create({
  username: "ada",
  email: "ada@example.com",
  password: await hashPassword("StrongPassword!123"),
  recovery_code: Buffer.from("recovery-secret-bytes"),
});

await user.roles().attach(editorRole.id);
```

## Shared Zod validation schemas (`@veap/auth/validation`)

Import client-safe Zod schemas from `@veap/auth/validation` (or `@veap/auth`) to validate forms on both the client and server without pulling database dependencies into client bundles:

- `loginSchema` (`email`, `password`, `remember?`)
- `registerSchema` (`username`, `email`, `password`, `terms`)
- `forgotPasswordSchema` (`email`)
- `resetPasswordSchema` (`password`, `confirm`)
- `verifyEmailSchema` (`code`)
- `totpSetupSchema`, `totpVerifySchema`, and `backupCodeSchema`
