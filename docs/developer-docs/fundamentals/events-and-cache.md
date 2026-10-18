# Events, caching, and logging

`@veap/kernel` includes three built-in infrastructure ports registered automatically by `KernelServiceProvider`: an asynchronous publish-subscribe `EventBus` (`EVENT_BUS`), a key-value cache abstraction (`CACHE_PROVIDER`), and a group-colored logger (`LOGGER`).

## Domain events with `EventBus`

The `EventBus` decouples modules and plugins so a package (such as `@veap/auth` or `@veap/plugins`) can broadcast domain events without knowing which listeners will react to them. Every subscriber is keyed by a unique `subscriberId` string, making subscriptions idempotent across Next.js Hot Module Replacement (HMR) reloads.

### Subscribing and publishing events

Resolve `EVENT_BUS` (or import the `eventBus` singleton) to subscribe handlers or publish events. `subscribe` takes three arguments (`eventType`, `subscriberId`, and `handler`) and returns an unsubscribe function:

```ts
import { app, EVENT_BUS } from "@veap/kernel";

const eventBus = await app(EVENT_BUS);

// 1. Register an idempotent subscriber by subscriberId
const unsubscribe = eventBus.subscribe(
  "user:registered",
  "welcome-email-listener",
  async (event) => {
    console.log(
      `[${event.source}] User ${event.payload.email} registered at ${event.timestamp}`,
    );
  },
);

// 2. Publish an event (runs all registered handlers concurrently via Promise.all)
await eventBus.publish(
  "user:registered",
  { userId: 42, email: "ada@example.com" },
  "auth-service",
);

// 3. Remove the listener when no longer needed
unsubscribe();
```

### `IEventBus` methods

The `IEventBus` interface supports persistent subscriptions, one-time listeners, and both fault-tolerant and strict publishing modes:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `subscribe` | `subscribe(eventType, subscriberId, handler): () => void` | Registers `handler` under `subscriberId` for `eventType`. If `subscriberId` is already registered for that event, it is a no-op and returns the unsubscribe function. |
| `once` | `once(eventType, handler, subscriberIdPrefix?): () => void` | Subscribes a handler that automatically unsubscribes itself before executing on the first matching event. |
| `unsubscribe` | `unsubscribe(eventType, subscriberId): void` | Removes the handler registered under `subscriberId` for `eventType`. |
| `publish` | `publish(eventType, payload, source?, options?): Promise<void>` | Dispatches `{ type, payload, timestamp, source }` to all subscribers concurrently. By default (`strict: false`), handler errors are logged via `LOGGER` without aborting other handlers. |
| `publishStrict` | `publishStrict(eventType, payload, source?): Promise<void>` | Equivalent to `publish(..., { strict: true })`. Rethrows the handler error if one subscriber fails, or an `AggregateError` if multiple subscribers fail. |
| `clearAll` | `clearAll(): void` | Removes all event listeners across all topics (useful in test teardown). |

<!-- prettier-ignore -->
> [!NOTE]
> Built-in system lifecycle events include `"system:ready"` (published at the end of `app.bootstrap()`) and `"system:stop"` (published during `app.shutdown()`).

### Typing custom events with `SystemEventsMap`

You can augment the `SystemEventsMap` interface from `@veap/kernel` using TypeScript declaration merging so `eventBus.subscribe` and `eventBus.publish` infer payload types automatically:

```ts
// types/events.d.ts
import "@veap/kernel";

declare module "@veap/kernel" {
  interface SystemEventsMap {
    "user:registered": {
      userId: number;
      email: string;
    };
    "order:paid": {
      orderId: string;
      totalCents: number;
    };
  }
}
```

## Caching with `CACHE_PROVIDER`

The `CACHE_PROVIDER` port (`ICacheProvider`) provides an asynchronous key-value store with optional Time-To-Live (`ttlSeconds`) expiration. Packages such as `@veap/settings` use `CACHE_PROVIDER` to cache database lookups transparently.

By default, `KernelServiceProvider` binds `CACHE_PROVIDER` to `MemoryCacheProvider`, an in-memory `Map`-backed store with lazy TTL expiration on read.

```ts
import { app, CACHE_PROVIDER } from "@veap/kernel";

export async function getExchangeRates(): Promise<Record<string, number>> {
  const cache = await app(CACHE_PROVIDER);
  const cacheKey = "rates:usd";

  const cached = await cache.get<Record<string, number>>(cacheKey);
  if (cached) {
    return cached;
  }

  const freshRates = { EUR: 0.92, CAD: 1.36, GBP: 0.79 };

  // Cache for 300 seconds (5 minutes)
  await cache.set(cacheKey, freshRates, 300);

  return freshRates;
}
```

### `ICacheProvider` contract and custom adapters

To replace the default in-memory cache with Redis or Upstash in a multi-instance deployment, implement `ICacheProvider` and register it under the `CACHE_PROVIDER` token in your composition root:

```ts
import {
  CACHE_PROVIDER,
  type ICacheProvider,
  ServiceProvider,
} from "@veap/kernel";

export class RedisCacheProvider implements ICacheProvider {
  async get<T>(key: string): Promise<T | null> {
    // Fetch and JSON.parse from Redis
    return null;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    // Serialize and SET (with EX ttlSeconds) in Redis
  }

  async delete(key: string): Promise<void> {
    // DEL key in Redis
  }

  async clear(): Promise<void> {
    // Flush namespace in Redis
  }
}

export class CustomCacheServiceProvider extends ServiceProvider {
  register(): void {
    this.container.register({
      token: CACHE_PROVIDER,
      useClass: RedisCacheProvider,
      singleton: true,
    });
  }
}
```

## Structured logging with `LOGGER`

`@veap/kernel` provides a `LOGGER` port (`ILogger`) bound by default to `ConsoleLogger` (also exported as the `logger` singleton and standalone `debug`, `info`, `warn`, and `error` functions). Every log call takes a `group` namespace as its first argument, which `ConsoleLogger` hashes to assign a consistent ANSI terminal color (or CSS color in browser devtools).

```ts
import { app, AppError, LOGGER } from "@veap/kernel";

const log = await app(LOGGER);

log.debug("app:billing", "Verifying webhook signature...");
log.info("app:billing", "Invoice #1042 marked as paid.");
log.warn("app:billing", "Webhook retry attempt 2 of 3.");
log.error(
  "app:billing",
  "Payment capture failed",
  AppError.BadRequest("Card declined"),
);
```

### Log filtering and error formatting

`ConsoleLogger` adapts its output automatically based on runtime environment variables and arguments:

- **Production debug suppression**: `logger.debug(...)` is suppressed when `process.env.NODE_ENV === "production"` unless `process.env.DEBUG` is set.
- **CLI quiet mode**: When running CLI commands (`process.env.VEAP_CLI === "1"`), `debug` and `info` logs are silenced unless `process.env.DEBUG === "1"` so command output stays clean.
- **`AppError` code formatting**: When an `AppError` instance is passed as the first extra argument to `logger.error(group, message, appError)`, `ConsoleLogger` automatically appends `[<error.code>]` to the formatted message.

## Next steps

Continue exploring the `@veap/kernel` core subsystems:

- [Console and CLI commands](./cli.md) — Run built-in commands and author custom `Command` classes with `@veap/kernel/cli`.


