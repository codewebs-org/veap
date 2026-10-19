# Authentication (`@veap/auth`)

`@veap/auth` provides database-backed session authentication, password hashing (`bcrypt`), AES-GCM secret encryption, Role-Based Access Control (RBAC), email verification, password reset flows, and ready-to-use Next.js Server Actions.

## Registering `AuthServiceProvider`

Install `@veap/auth` alongside `@veap/kernel` and `@veap/database`, then register `AuthServiceProvider` in your `lib/veap.ts` composition root:

```ts
// lib/veap.ts
import { AuthServiceProvider } from "@veap/auth";
import { DatabaseServiceProvider } from "@veap/database";
import { Application } from "@veap/kernel";

export const app = Application.configure()
  .use(DatabaseServiceProvider)
  .use(
    (c) =>
      new AuthServiceProvider(c, {
        autoMigrate: true,
      }),
  )
  .create();
```

When `autoMigrate: true` is enabled (the default), `AuthServiceProvider.boot()` automatically runs the `@veap/auth` schema migrations (`users`, `sessions`, `roles`, `permissions`, `user_roles`, `role_permissions`, `email_verification_requests`, and `password_reset_sessions`).

## Reading the active user and session on the server

In React Server Components, Server Actions, or Route Handlers, call `getCurrentSession()` to inspect the active `user` and `session`:

```tsx
// app/dashboard/page.tsx
import { getCurrentSession } from "@veap/auth";
import { redirect } from "next/navigation";
import { initializeSystem } from "@/lib/veap";

export default async function DashboardPage() {
  await initializeSystem();
  const session = await getCurrentSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Welcome back, {session.user.name}</h1>
      <p className="text-muted-foreground">{session.user.email}</p>
    </main>
  );
}
```

`getCurrentSession()` supports both web browsers and API or mobile clients:

1. **Bearer token header**: It checks for an `Authorization: Bearer <token>`
   header in the incoming HTTP request first.
2. **Session cookie fallback**: If no Bearer header is present, it falls back
   to the HTTP-only `session` cookie managed by the kernel cookie store.
3. **Automatic augmentation**: Once the token is verified against the database,
   user roles, permissions, and session metadata are attached automatically.

## Bearer token authentication (mobile and API clients)

Mobile applications (for example built with React Native or Expo) and external
REST API clients cannot always rely on browser cookies. `@veap/auth` natively
supports Bearer token authentication so both web and mobile applications share
the same session database and access control rules.

### Obtaining the session token

When an account logs in or registers via `AuthService`, the returned
`AuthResponse` contains a `token` property with the raw session token:

```ts
// app/api/auth/login/route.ts
import { AuthService } from "@veap/auth";
import { app } from "@veap/kernel";
import { NextResponse } from "next/server";
import { initializeSystem } from "@/lib/veap";

export async function POST(req: Request) {
  await initializeSystem();
  const body = await req.json();

  const auth = await app(AuthService);
  const response = await auth.signIn({
    email: body.email,
    password: body.password,
  });

  if (response.status !== "SUCCESS") {
    return NextResponse.json(
      { error: response.message || "Invalid credentials" },
      { status: 401 },
    );
  }

  return NextResponse.json({
    token: response.token,
    user: response.user,
  });
}
```

<!-- prettier-ignore -->
> [!NOTE]
> Web applications that use Server Actions can ignore the `token` property
> because `AuthService` also sets the HTTP-only cookie automatically. Mobile and
> external API clients use this returned `token` string for subsequent requests.

### Sending the Bearer token

Store the token securely on the device (for example using `expo-secure-store` in
Expo or an encrypted device keychain), then send it in the `Authorization` header
on subsequent requests:

```ts
// mobile-client/api.ts
import * as SecureStore from "expo-secure-store";

export async function fetchProfile() {
  const token = await SecureStore.getItemAsync("session_token");

  const response = await fetch("https://api.example.com/api/profile", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  return await response.json();
}
```

In your Next.js Route Handlers, Server Components, and plugin actions,
`getCurrentSession()` reads the Bearer token automatically and authenticates
the user with full roles and permissions.

## Client context and `useUser()` hook

To read the authenticated user in Client Components (`"use client"`), wrap your layout in `<AuthProvider>` from `@veap/auth/client` and call `useUser()`:

```tsx
// app/providers.tsx
"use client";

import { AuthProvider } from "@veap/auth/client";

export function Providers({ children }: { children: React.ReactNode }) {
  // sessionEndpoint defaults to "/api/auth/me"
  return <AuthProvider>{children}</AuthProvider>;
}
```

Expose the session endpoint using `handleAuthMe` from `@veap/auth/server`:

```ts
// app/api/auth/me/route.ts
export { handleAuthMe as GET } from "@veap/auth/server";
```

Then read user state anywhere in client component trees:

```tsx
// components/user-menu.tsx
"use client";

import { useUser } from "@veap/auth/client";

export function UserMenu() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return <span>Loading session...</span>;
  }

  if (!user) {
    return <a href="/login">Sign in</a>;
  }

  return <span>Signed in as {user.name}</span>;
}
```

## Next steps

Continue exploring `@veap/auth`:

- [Server Actions and RBAC](./actions-and-rbac.md) — Authenticate users with `signIn`, `signUp`, and `signOut`, and manage `Role` and `Permission` assignments.
- [Verification, cryptography, and 2FA hooks](./verification-and-security.md) — Configure `ENCRYPTION_KEY`, run email verification and password reset flows, and register 2FA challenge validators.
