# Core kernel (`@veap/kernel`)

`@veap/kernel` is the foundational package of the Veap framework. It provides the asynchronous Inversion of Control (IoC) dependency injection container, the `Application` and `ServiceProvider` lifecycle engine, configuration loading, event dispatching, transport-agnostic error handling with `Result<T>`, the `veap` CLI console runner, and HTTP adapters for Next.js and Node.js runtimes.

Every framework package in Veap depends on `@veap/kernel`.

## Installation and setup

`@veap/kernel` is installed by default in every application scaffolded with `create-veap`. If you add Veap to an existing project, install the package directly:

```bash
bun add @veap/kernel
```

<!-- prettier-ignore -->
> [!NOTE]
> Enable `experimentalDecorators` and `emitDecoratorMetadata` in your `tsconfig.json` compiler options to use `@Injectable()` and `@Inject()` decorators with the IoC container.

## The composition root (`lib/veap.ts`)

Applications configure and boot their service providers through the fluent `Application.configure()` builder:

```ts
// lib/veap.ts
import { Application } from "@veap/kernel";
import { DatabaseServiceProvider } from "@veap/database";
import { AuthServiceProvider } from "@veap/auth";

export const app = Application.configure()
  .use(DatabaseServiceProvider)
  .use(AuthServiceProvider)
  .create();

let bootstrapPromise: Promise<void> | null = null;

export async function initializeSystem(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = app.bootstrap().catch((error) => {
      bootstrapPromise = null;
      throw error;
    });
  }
  return bootstrapPromise;
}
```

## Core subsystems overview

`@veap/kernel` packages several coordinated subsystems:

### 1. Inversion of Control (IoC) container

The asynchronous DI container (`Container`) supports constructor injection, property injection, singleton and transient lifetimes, in-flight promise deduplication, and method-level injection with `container.call()`:

```ts
import { app, Injectable, Inject, Token } from "@veap/kernel";

export interface IAnalyticsService {
  track(event: string, properties?: Record<string, any>): Promise<void>;
}

export const ANALYTICS: Token<IAnalyticsService> = Symbol.for("app:analytics");

@Injectable()
export class OrderProcessor {
  constructor(@Inject(ANALYTICS) private analytics: IAnalyticsService) {}

  async processOrder(orderId: string): Promise<void> {
    await this.analytics.track("order_processed", { orderId });
  }
}

// Resolve anywhere asynchronously
const processor = await app(OrderProcessor);
```

### 2. Service providers and lifecycle

`ServiceProvider` is the modular unit of packaging in Veap. Providers define four deterministic lifecycle hooks:

- **`register()`**: Binds tokens, factories, and singletons into the container. No database or network I/O should run here.
- **`commands?()`**: Discovers console commands contributed by this module for `bun veap <command>`.
- **`boot?()`**: Performs asynchronous initialization (verifying connections, running bootstrap routines, or subscribing to events).
- **`shutdown?()`**: Closes connection pools and releases resources cleanly when the process exits.

### 3. Events and cache ports

Hexagonal ports decouple application logic from concrete drivers:

- **`EventBus` (`EVENT_BUS`)**: In-memory pub/sub broker for asynchronous event-driven architectures.
- **`ICacheProvider` (`CACHE_PROVIDER`)**: Low-latency cache contract (`get`, `set`, `delete`, `remember`, `clear`).

### 4. Configuration and typed errors

- **`ConfigService` (`CONFIG_SERVICE`)**: Reads typed environment configuration with nested dot notation (`config.get("database.host", "localhost")`).
- **`AppError` and `Result<T>`**: Structured domain errors (`AppError.NotFound()`, `AppError.Unauthorized()`, `AppError.Validation()`) returned through the discriminated union `Result<T>` (`ok(data)` vs `{ success: false, error }`).

### 5. Console and CLI command engine (`@veap/kernel/cli`)

Built-in command runner for terminal tasks (`bun veap list`, `bun veap about`, `bun veap config:show`, `bun veap make:command`).

### 6. Next.js transport adapters (`@veap/kernel/next`)

Binds `NextCookieStore` and `NextRequestContext` to decouple authentication and request headers from direct `next/headers` calls, enabling seamless fallback to in-memory mocks during CLI commands and unit tests.

## Next steps

Explore each kernel subsystem in detail:

- [IoC container and service providers](../../fundamentals/ioc-and-providers.md) — Dependency injection, registration styles, and method injection.
- [Configuration and error handling](../../fundamentals/configuration-and-errors.md) — Environment variables, `veap.config.ts`, and `Result<T>` pattern.
- [Events and cache](../../fundamentals/events-and-cache.md) — Subscribing to domain events and using cache providers.
- [Console and CLI commands](../../fundamentals/cli.md) — The `veap` runner, built-in commands, and writing custom commands.
- [Kernel API reference](../../reference/packages/kernel.md) — Detailed list of exported classes, interfaces, and tokens.
