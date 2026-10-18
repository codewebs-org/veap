# Next.js integration

Veap complements Next.js rather than replacing it. Next.js owns the HTTP server, React Server Components (RSC), client hydration, and build pipeline (`next dev`, `next build`, `next start`), while Veap provides the backend service container, ORM, authentication, and plugin system around your requests.

## Responsibilities: Next.js vs. Veap

The table below summarizes how responsibilities are divided between Next.js and Veap in a full-stack application:

| Concern | Native Next.js | Next.js with Veap |
| --- | --- | --- |
| **Application lifecycle** | No shared IoC container or ordered boot step | `@veap/kernel` registers and boots `ServiceProvider` classes once per server process |
| **Routing** | File-system routes in `app/` | File-system routes in `app/` plus dynamic plugin route trees mounted via `app/[...catchAll]/page.tsx` |
| **Request state** | Direct `cookies()` and `headers()` calls | `COOKIE_STORE` (`NextCookieStore`) and `REQUEST_CONTEXT` (`NextRequestContext`) provided by `@veap/kernel/next` (`NextTransportServiceProvider`) |
| **Database & transactions** | Bring your own client and manual transaction passing | `@veap/database` Active Record models and `AsyncLocalStorage`-backed `transaction()` blocks |
| **Authentication & RBAC** | Custom middleware and session logic | `@veap/auth` Server Actions (`signIn`, `signUp`, `signOut`), `getCurrentSession()`, and role/permission guards |
| **Error handling** | Unstructured exceptions across actions | `AppError`, `Result<T>`, `ok()`, and `handleActionError()` with Next.js redirect preservation |

## Automatic startup with `instrumentation.ts`

Next.js executes the `register()` hook in `instrumentation.ts` once when the server process starts. Calling `initializeSystem()` inside `instrumentation.ts` ensures your IoC container is booted before requests arrive:

```ts
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { initializeSystem } = await import("./lib/veap");
  await initializeSystem();
}
```

Checking `process.env.NEXT_RUNTIME !== "nodejs"` prevents Edge runtime workers from importing Node-only packages (such as `@veap/database` or `better-sqlite3`).

### Build-time safety (`next build`)

During `next build`, Next.js imports page modules to collect static metadata. `@veap/kernel` automatically detects the Next.js production build phase (`NEXT_PHASE === "phase-production-build"`) and skips `app.bootstrap()` so your build never requires a live database connection. You can also force this behavior explicitly by setting `SKIP_VEAP_INIT=true` in your build environment.

## Using Veap in Server Components

In React Server Components, you can query Active Record models, read translations, or inspect the current user session directly on the server:

```tsx
// app/dashboard/page.tsx
import { getCurrentSession } from "@veap/auth";
import { getTranslation } from "@veap/intl/server";
import { redirect } from "next/navigation";
import { initializeSystem } from "@/lib/veap";

export default async function DashboardPage() {
  await initializeSystem();

  const { user } = await getCurrentSession();
  if (!user) {
    redirect("/signin");
  }

  const { t } = await getTranslation("common");

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold">
        {t("dashboard.welcome", { username: user.username })}
      </h1>
    </main>
  );
}
```

## Using Veap in Server Actions

Wrap Next.js Server Actions with `ok()`, `AppError`, and `handleActionError()` from `@veap/kernel` to return strongly typed `Result<T>` objects to your client forms:

```ts
// app/actions/profile.ts
"use server";

import { getCurrentSession } from "@veap/auth";
import { AppError, handleActionError, ok, type Result } from "@veap/kernel";
import { SettingsService } from "@veap/settings";
import { app } from "@veap/kernel";
import { initializeSystem } from "@/lib/veap";

export async function updateSiteTitleAction(
  newTitle: string,
): Promise<Result<{ title: string }>> {
  try {
    await initializeSystem();

    const { user } = await getCurrentSession();
    if (!user) {
      throw AppError.Unauthorized("You must be signed in.");
    }

    if (!newTitle.trim()) {
      throw AppError.Validation("Site title cannot be empty.");
    }

    const settings = await app(SettingsService);
    await settings.set("site.title", newTitle.trim());

    return ok({ title: newTitle.trim() });
  } catch (error) {
    return handleActionError(error, "Settings:UpdateSiteTitle");
  }
}
```

<!-- prettier-ignore -->
> [!TIP]
> `handleActionError()` automatically inspects the caught error for Next.js `NEXT_REDIRECT` and `NEXT_NOT_FOUND` digests and rethrows them untouched, so calling `redirect()` or `notFound()` inside a `try` block works as expected.

## Using Veap in Route Handlers

Call `initializeSystem()` at the start of your `app/api/*/route.ts` handlers before resolving services or querying models:

```ts
// app/api/health/route.ts
import { NextResponse } from "next/server";
import { initializeSystem } from "@/lib/veap";

export async function GET() {
  await initializeSystem();
  return NextResponse.json({ status: "ok" });
}
```

## Respecting server and client boundaries

Because Veap includes both Node.js backend services and React client hooks, always import from the subpath matching your component environment:

| Package | Server-only imports (RSC, Server Actions, Route Handlers) | Client Component imports (`"use client"`) |
| --- | --- | --- |
| `@veap/kernel` | `@veap/kernel`, `@veap/kernel/server`, `@veap/kernel/cli` | Types and error helpers (`type Result`) |
| `@veap/database` | `@veap/database`, `@veap/database/migrations` (never import in client components) | None |
| `@veap/auth` | `@veap/auth`, `@veap/auth/server`, `@veap/auth/actions`, `@veap/auth/models` | `@veap/auth/client` (`AuthProvider`, `useUser`, `useAuthRoutes`) |
| `@veap/intl` | `@veap/intl/server` (`getTranslation`, `getCurrentLocale`, `I18nProvider`) | `@veap/intl/client` (`useTranslation`, `I18nProvider`) |
| `@veap/plugins` | `@veap/plugins`, `@veap/plugins/server`, `@veap/plugins/router`, `@veap/plugins/models` | `@veap/plugins/client` (`ExtensionPointClient`, `WidgetAreaClient`, `useConfirmAction`) |
| `@veap/ui` | `@veap/ui` (presentational components, `cn`) | `@veap/ui`, `@veap/ui/providers` (`ThemeProvider`) |

<!-- prettier-ignore -->
> [!WARNING]
> Never import `lib/veap.ts`, `@veap/database`, or `@veap/auth/models` inside a file marked with `"use client"`. Client components must interact with backend services through Next.js Server Actions or API Route Handlers.

## Running Veap in other frameworks

While Veap is built primarily for Next.js, its hexagonal port architecture lets you run the container, ORM, authentication, localization, mail, settings, and storage packages in any other framework or HTTP server (such as **Hono**, **Express**, **Fastify**, or standalone Node.js/Bun services).

`KernelServiceProvider` defaults to in-memory fallback adapters (`MemoryCookieStore` and `MemoryRequestContext`), while Next.js applications register `NextTransportServiceProvider` from `@veap/kernel/next`. In other frameworks, you can override those two ports by binding your own custom implementations of `ICookieStore` and `IHttpRequestContext`:

```ts
// src/lib/veap.ts (Custom HTTP framework example)
import { AuthServiceProvider } from "@veap/auth";
import { DatabaseServiceProvider } from "@veap/database";
import {
  Application,
  COOKIE_STORE,
  type CookieOptions,
  type ICookieStore,
  type IHttpRequestContext,
  REQUEST_CONTEXT,
  ServiceProvider,
} from "@veap/kernel";

class CustomCookieStore implements ICookieStore {
  async get(name: string): Promise<string | null> {
    // Read cookie from your framework's active request context
    return null;
  }

  async set(name: string, value: string, options?: CookieOptions): Promise<void> {
    // Append Set-Cookie header to your framework's active response context
  }

  async delete(name: string): Promise<void> {
    // Expire cookie in your framework's active response context
  }
}

class CustomRequestContext implements IHttpRequestContext {
  async getHeader(name: string): Promise<string | null> {
    // Read header from your framework's active request context
    return null;
  }

  redirect(url: string): never {
    // Trigger your framework's HTTP redirect exception
    throw new Error(`Redirect to ${url}`);
  }
}

class CustomTransportServiceProvider extends ServiceProvider {
  register(): void {
    this.container.register({
      token: COOKIE_STORE,
      useClass: CustomCookieStore,
      singleton: true,
    });

    this.container.register({
      token: REQUEST_CONTEXT,
      useClass: CustomRequestContext,
      singleton: true,
    });
  }
}

export const app = Application.configure()
  .use(CustomTransportServiceProvider)
  .use(DatabaseServiceProvider)
  .use(AuthServiceProvider)
  .create();
```

For unit and integration tests, `@veap/kernel` also provides in-memory implementations (`MemoryCookieStore` and `MemoryRequestContext`). For stateless REST APIs (such as a standalone Hono or Express service using `@veap/database`), you can initialize the database or container directly without calling cookie or redirect adapters.


## Next steps

Explore how files, configuration, and plugins are laid out in a Veap project:

- [Project structure and configuration](./project-structure.md) — understand `veap.config.ts`, `lib/plugins.gen.ts`, catch-all plugin routes, and `veap eject`.
