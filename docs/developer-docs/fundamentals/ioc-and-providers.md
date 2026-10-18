# IoC container and service providers

At the heart of `@veap/kernel` is an asynchronous Inversion of Control (IoC) container paired with a two-phase `ServiceProvider` lifecycle. Every Veap package registers its capabilities as abstract contracts (tokens) in the container and resolves its dependencies asynchronously at runtime.

## Why Veap uses an IoC container

Modern Next.js applications frequently outgrow direct module imports when services require asynchronous initialization, test isolation, or swappable infrastructure drivers. The `@veap/kernel` container solves these challenges with three design mechanisms:

- **Hexagonal ports and adapters**: Packages depend on `Symbol.for(...)` tokens (ports) such as `COOKIE_STORE`, `CACHE_PROVIDER`, or `MAIL_DRIVER` rather than concrete classes, allowing you to swap adapters without editing business logic.
- **Hot Module Replacement (HMR) survival**: Both the global `container` instance (`globalThis.__VEAP_CONTAINER__`) and class tokens (normalized via `Symbol.for("veap:ioc:<ClassName>")` in development) survive Next.js Fast Refresh reloads without duplicating connections or losing singleton state.
- **Concurrent async resolution**: When multiple React Server Components resolve the same asynchronous singleton simultaneously, the container deduplicates in-flight promises so the factory or constructor runs only once.

## The `Container` and `app()` helper

`@veap/kernel` exports a global `container` instance alongside the `app()` helper function. Calling `app()` with no arguments returns the `Container` instance, while calling `app(token)` resolves and returns a `Promise<T>` for the requested token.

```ts
import { app, CONFIG_SERVICE, container } from "@veap/kernel";

// Resolve a service via the app(token) shorthand
const config = await app(CONFIG_SERVICE);

// Access the container directly
const hasConfig = container.has(CONFIG_SERVICE);
const sameConfig = await container.resolve(CONFIG_SERVICE);
```

### Container methods

The `Container` class provides six methods for registering, inspecting, resolving, and resetting bindings across your application and test suites:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `register` | `register<T>(def: ProviderDef<T>): void` | Registers a provider definition (`useClass`, `useValue`, or `useFactory`) for a token. |
| `resolve` | `resolve<T>(token: Token<T>): Promise<T>` | Resolves and returns the bound instance for `token`, deduplicating concurrent in-flight resolutions. |
| `make` | `make<T>(token: Token<T>): Promise<T>` | Alias for `resolve(token)`. |
| `has` | `has(token: Token<any>): boolean` | Returns `true` if a provider definition or instantiated singleton is registered for `token`. |
| `clear` | `clear(): void` | Clears cached singleton instances and in-flight promises while preserving registered provider definitions. |
| `reset` | `reset(): void` | Clears all provider definitions, cached singleton instances, and in-flight promises. |

## Registering bindings

When you call `container.register(def)`, you pass a `ProviderDef<T>` object describing how the container should construct the dependency. By default, all bindings are singletons (`singleton: true`) unless you explicitly pass `singleton: false`.

### Binding strategies

You can register a token using one of three strategies: a class constructor (`useClass`), a static value (`useValue`), or a synchronous/asynchronous factory function (`useFactory`).

```ts
import { container, CONFIG_SERVICE, type IConfigService, type Token } from "@veap/kernel";

export interface IPaymentGateway {
  charge(amountCents: number): Promise<{ transactionId: string }>;
}

export const PAYMENT_GATEWAY: Token<IPaymentGateway> = Symbol.for(
  "app:payment-gateway",
);

// 1. useValue: Bind a constant or pre-instantiated object
container.register({
  token: "APP_VERSION",
  useValue: "1.0.0",
});

// 2. useFactory: Bind a sync or async factory with injected dependencies
container.register({
  token: PAYMENT_GATEWAY,
  inject: [CONFIG_SERVICE],
  useFactory: async (config: IConfigService): Promise<IPaymentGateway> => {
    const apiKey = config.get<string>("STRIPE_SECRET_KEY", "sk_test_mock");
    return {
      async charge(amountCents: number) {
        return { transactionId: `tx_${apiKey.slice(-4)}_${amountCents}` };
      },
    };
  },
  singleton: true,
});
```

## Constructor injection with `@Injectable` and `@Inject`

When registering a class with `useClass` (or resolving an unregistered class constructor directly), the container inspects TypeScript decorator metadata to resolve constructor parameters automatically.

### Decorating classes and token parameters

Mark your service classes with `@Injectable()` so TypeScript emits `design:paramtypes` metadata, and use `@Inject(token)` on constructor parameters that reference `Symbol` or string tokens rather than class constructors:

```ts
import {
  CONFIG_SERVICE,
  type IConfigService,
  type ILogger,
  Inject,
  Injectable,
  LOGGER,
} from "@veap/kernel";

@Injectable()
export class OrderService {
  constructor(
    @Inject(CONFIG_SERVICE) private readonly config: IConfigService,
    @Inject(LOGGER) private readonly logger: ILogger,
  ) {}

  async placeOrder(orderId: string): Promise<void> {
    const env = this.config.get("NODE_ENV", "development");
    this.logger.info("app:orders", `Order ${orderId} placed in ${env} mode.`);
  }
}
```

<!-- prettier-ignore -->
> [!WARNING]
> When injecting another class via constructor metadata (without an explicit `@Inject(token)` decorator), never import that class using `import type`. TypeScript erases type-only imports from `design:paramtypes` metadata and replaces them with `Object`, causing the container to throw an error at runtime. Always use a value import for class constructor tokens, or annotate the parameter with `@Inject(TOKEN)`.

## Method injection with `container.call()`

In addition to constructor injection, `Container` supports method-level dependency injection through `container.call(target, method, ...extraArgs)`.

The container inspects method parameters decorated with `@Inject(token)` or class tokens from `design:paramtypes`, resolves each dependency asynchronously from the container, and supplies any remaining non-injected parameters sequentially from `extraArgs`:

```ts
import { app, Inject, type ILogger, LOGGER } from "@veap/kernel";

export class ReportGenerator {
  async generate(
    reportType: string,
    @Inject(LOGGER) logger: ILogger,
    format: "pdf" | "csv" = "pdf",
  ): Promise<string> {
    logger.info("reports", `Generating ${reportType} report as ${format}`);
    return `report-${reportType}.${format}`;
  }
}

// Invocations resolve @Inject(LOGGER) automatically:
const generator = new ReportGenerator();
const result = await app().call(generator, "generate", "sales", "pdf");
```

This pattern is especially useful in plugin lifecycle hooks (such as `init`, `onEnable`, and `onMigrate`) and controller action dispatchers where parameters combine container-managed services and runtime arguments.

## Writing a `ServiceProvider`

Instead of scattering `container.register()` calls across your project, Veap organizes bindings into modular `ServiceProvider` classes. Every `@veap/*` package exports a `ServiceProvider`, and you can write custom providers for your own application domains.

### Lifecycle methods

A `ServiceProvider` subclass can implement up to four lifecycle hooks executed in a deterministic order by the `Application`:

1. **`register(): void | Promise<void>` (required)**: Binds tokens into `this.container`. Never resolve other services inside `register()`, because other providers may not have registered their bindings yet.
2. **`commands?(): CommandEntry[] | Promise<CommandEntry[]>` (optional)**: Returns an array of CLI command classes or instances contributed by this provider. Collected after all providers have finished `register()` and before `boot()`.
3. **`boot?(): void | Promise<void>` (optional)**: Executes after every provider has registered. You can safely resolve other services from `this.container`, subscribe to `EventBus` topics, or warm up caches here.
4. **`shutdown?(): void | Promise<void>` (optional)**: Releases persistent resources (such as database connection pools, timers, or sockets) when `app.shutdown()` is called. Executed in reverse registration order.

```ts
import {
  EVENT_BUS,
  type IEventBus,
  type ILogger,
  LOGGER,
  ServiceProvider,
} from "@veap/kernel";
import { OrderService } from "./order.service";

export class OrderServiceProvider extends ServiceProvider {
  register(): void {
    this.container.register({
      token: OrderService,
      useClass: OrderService,
      singleton: true,
    });
  }

  async boot(): Promise<void> {
    const eventBus = await this.container.resolve<IEventBus>(EVENT_BUS);
    const logger = await this.container.resolve<ILogger>(LOGGER);

    eventBus.subscribe("order:created", "OrderServiceProvider", async (event) => {
      logger.info("app:orders", `Handled order:created for ${event.payload.id}`);
    });
  }

  async shutdown(): Promise<void> {
    const eventBus = await this.container.resolve<IEventBus>(EVENT_BUS);
    eventBus.unsubscribe("order:created", "OrderServiceProvider");
  }
}
```

## Composing the `Application`

The `Application` class orchestrates your `ServiceProvider` list in your composition root (`lib/veap.ts`). Use `Application.configure()` to chain providers via `.use(...)` (or `.with(...)` / `.withProviders(...)`) and finalize the instance with `.create()`.

```ts
// lib/veap.ts
import { DatabaseServiceProvider } from "@veap/database";
import { Application } from "@veap/kernel";
import { SettingsServiceProvider } from "@veap/settings";
import { OrderServiceProvider } from "./orders/order.provider";

export const app = Application.configure()
  .use(DatabaseServiceProvider)
  // Pass a factory function when a provider accepts options
  .use((c) => new SettingsServiceProvider(c, { cacheTtlSeconds: 120 }))
  .use(OrderServiceProvider)
  .create();
```

### What happens during `app.bootstrap()`

Calling `await app.bootstrap()` runs the initialization sequence with built-in safeguards for Next.js:

1. **Build and browser guards**: If called in the browser (`typeof window !== "undefined"`), during `next build` (`process.env.NEXT_PHASE === "phase-production-build"`), or when `process.env.SKIP_VEAP_INIT === "true"`, `bootstrap()` returns immediately as a no-op.
2. **Idempotency**: If the application is already bootstrapped (`globalThis.__VEAP_BOOTSTRAPPED__`) or currently bootstrapping (`globalThis.__VEAP_BOOTSTRAPPING_PROMISE__`), `bootstrap()` returns the existing promise without re-running providers.
3. **Kernel defaults**: `Application` automatically prepends `KernelServiceProvider` before your custom providers, registering `EventBus` (`EVENT_BUS`), `ConsoleLogger` (`LOGGER`), `ConfigService` (`CONFIG_SERVICE`), `MemoryCacheProvider` (`CACHE_PROVIDER`), `VeapConfigProvider` (`VEAP_CONFIG`), `commands` (`COMMANDS`), and default Next.js HTTP adapters (`NextCookieStore` for `COOKIE_STORE` and `NextRequestContext` for `REQUEST_CONTEXT` if not overridden).
4. **Deduplication**: Provider classes are deduplicated by constructor reference so each provider runs once even if registered multiple times.
5. **Two-phase execution**: Every provider's `register()` runs sequentially, then `commands()` are collected into the CLI registry, and finally every provider's `boot()` runs sequentially before publishing the `"system:ready"` event on the `EventBus`.

<!-- prettier-ignore -->
> [!TIP]
> If a provider throws Next.js control-flow exceptions (`NEXT_REDIRECT` or `NEXT_NOT_FOUND`) during `boot()`, `app.bootstrap()` re-throws them cleanly without logging a false critical error.

## Next steps

Learn how `@veap/kernel` loads configuration files, manages environment variables, and models typed domain errors:

- [Configuration and error handling](./configuration-and-errors.md) — `veap.config.ts`, `ConfigService`, `AppError`, and `Result<T>`.
- [Events, caching, and logging](./events-and-cache.md) — `EventBus`, `CACHE_PROVIDER`, and `LOGGER`.
