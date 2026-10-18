# Your first application

Every Veap project defines a server-side composition root — by convention at `lib/veap.ts` — that configures the `Application` instance, registers `ServiceProvider` classes, and exports an idempotent `initializeSystem()` bootstrap helper.

## Create the composition root (`lib/veap.ts`)

The `Application.configure()` builder from `@veap/kernel` lets you assemble service providers in a deterministic order. When `app.bootstrap()` runs, Veap automatically prepends `KernelServiceProvider`, which registers core kernel services along with the default Next.js transport adapters (`NextCookieStore` for `COOKIE_STORE` and `NextRequestContext` for `REQUEST_CONTEXT`).

In a Next.js application, your base `lib/veap.ts` requires no manual HTTP adapter boilerplate:

```ts
// lib/veap.ts
import { Application } from "@veap/kernel";

export const app = Application.configure().create();

let bootstrapPromise: Promise<void> | null = null;

/**
 * Main system bootstrap function.
 * Safe for concurrent invocations across layouts, pages, and server actions.
 */
export async function initializeSystem(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = app.bootstrap().catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}
```

### Default Next.js transport ports (`COOKIE_STORE` and `REQUEST_CONTEXT`)

Veap is built for Next.js, so `KernelServiceProvider` binds two HTTP transport ports by default:

- **`COOKIE_STORE` (`NextCookieStore`):** Dynamically reads and writes cookies via `cookies()` from `next/headers`.
- **`REQUEST_CONTEXT` (`NextRequestContext`):** Reads request headers via `headers()` from `next/headers` and triggers redirects via `redirect()` from `next/navigation`.

Because feature packages like `@veap/auth` and `@veap/intl` resolve `COOKIE_STORE` and `REQUEST_CONTEXT` from the container instead of importing `next/*` directly, Next.js works out of the box, and you can run the exact same packages in other frameworks (such as Hono or Express) or in unit tests (`MemoryCookieStore`, `MemoryRequestContext`) by overriding those two tokens in a custom `ServiceProvider`.

## Add feature providers

As your application grows, chain additional service providers onto `Application.configure()`. You can pass either a `ServiceProvider` class constructor or a factory function `(container) => new Provider(container, options)` when passing configuration options:

```ts
// lib/veap.ts
import { AuthServiceProvider } from "@veap/auth";
import {
  DatabaseServiceProvider,
  MigrationServiceProvider,
} from "@veap/database";
import { IntlServiceProvider } from "@veap/intl/server";
import { Application } from "@veap/kernel";
import { MailServiceProvider } from "@veap/mail";
import { SettingsServiceProvider } from "@veap/settings";
import { StorageServiceProvider } from "@veap/storage";

export const app = Application.configure()
  .use(DatabaseServiceProvider)
  .use(MigrationServiceProvider)
  .use((c) => new AuthServiceProvider(c, { autoMigrate: true }))
  .use((c) => new SettingsServiceProvider(c, { autoMigrate: true }))
  .use(StorageServiceProvider)
  .use(MailServiceProvider)
  .use(IntlServiceProvider)
  .create();
```

## Understand the two-phase bootstrap lifecycle

When you call `await app.bootstrap()`, the kernel executes two sequential phases across all registered providers:

1. **Registration phase (`register()`):** Calls `provider.register()` synchronously on every provider in registration order. Providers bind tokens, factories, and classes into the IoC container without performing I/O or resolving other services.
2. **Boot phase (`boot()`):** Calls `await provider.boot()` asynchronously on every provider in registration order. Because every token is already registered, `boot()` hooks can safely resolve dependencies from the container, run database migrations, and subscribe to event bus topics.

<!-- prettier-ignore -->
> [!IMPORTANT]
> Always wrap `app.bootstrap()` in a shared promise (such as `initializeSystem()`) or React's `cache()`. If bootstrap fails, reset the cached promise in `.catch()` so subsequent requests can retry initialization.

## Resolve services with `app()`

Once the application is booted, use the `app()` helper function from `@veap/kernel` to resolve services by class constructor or token:

```ts
import { app, CONFIG_SERVICE, type IConfigService } from "@veap/kernel";
import { SettingsService } from "@veap/settings";

// Resolve by class token
const settings = await app(SettingsService);
const siteName = await settings.get("site.name", "My Veap App");

// Resolve by Symbol token
const config = await app<IConfigService>(CONFIG_SERVICE);
const isDebug = config.getBoolean("DEBUG", false);
```

## Write a custom `ServiceProvider`

You can encapsulate your own domain services and startup logic (such as ensuring custom tables or seeding initial data) inside a `ServiceProvider`:

```ts
import { Injectable, ServiceProvider, app } from "@veap/kernel";

@Injectable()
export class BillingService {
  public calculateTax(amountCents: number): number {
    return Math.round(amountCents * 0.23);
  }
}

export class BillingServiceProvider extends ServiceProvider {
  register(): void {
    this.container.register({
      token: BillingService,
      useClass: BillingService,
      singleton: true,
    });
  }

  async boot(): Promise<void> {
    const billing = await app(BillingService);
    // Perform any async startup checks here
  }
}
```

## Next steps

Learn how to connect your composition root to Next.js rendering and server boundaries:

- [Next.js integration](./nextjs-integration.md) — trigger `initializeSystem()` automatically via `instrumentation.ts` and call Veap services from Server Components and Server Actions.
- [Project structure and configuration](./project-structure.md) — explore how `veap.config.ts`, migrations, and plugins are organized.
