# `@veap/kernel` API reference

`@veap/kernel` is the foundational layer of the Veap framework. It provides the asynchronous Inversion of Control (IoC) container, `ServiceProvider` and `Application` lifecycle orchestration, `ConfigService`, `EventBus`, `AppError` / `Result<T>` error handling, `ConsoleLogger`, `MemoryCacheProvider`, Next.js HTTP transport adapters (`NextCookieStore`, `NextRequestContext`), and the `veap` CLI command runner.

## Subpath exports

`@veap/kernel` exposes eleven entry points in `package.json`:

| Subpath | Description |
| :--- | :--- |
| `@veap/kernel` | Core barrel exporting IoC container, `Application`, `ServiceProvider`, `ConfigService`, `EventBus`, `AppError`, `Result<T>`, `MemoryCacheProvider`, `ConsoleLogger`, and HTTP transport ports (`COOKIE_STORE`, `REQUEST_CONTEXT`, `ICookieStore`, `IHttpRequestContext`, `MemoryCookieStore`, `MemoryRequestContext`). |
| `@veap/kernel/server` | Server-only entry point exporting `KernelServiceProvider`, `getVeapConfig`, `clearVeapConfigCache`, and all core symbols. |
| `@veap/kernel/cli` | CLI framework (`Command`, `CommandInput`, `ConsoleApplication`, `ConsoleOutput`, `BufferedOutput`, `commands`, `COMMANDS`). |
| `@veap/kernel/ioc` | `Container`, `container`, `app`, `ServiceProvider`, `Injectable`, `Inject`, and `Token<T>`. |
| `@veap/kernel/config` | `ConfigService`, `CONFIG_SERVICE`, `VEAP_CONFIG`, `getVeapConfig`, `clearVeapConfigCache`, and `VeapConfig`. |
| `@veap/kernel/errors` | `AppError`, `Result<T>`, `ok`, `handleActionError`, `httpStatusForErrorCode`, and `ErrorCode`. |
| `@veap/kernel/events` | `EventBus`, `eventBus`, `EVENT_BUS`, `IEventBus`, `SystemEvent`, and `SystemEventsMap`. |
| `@veap/kernel/cache` | `CACHE_PROVIDER`, `ICacheProvider`, and `MemoryCacheProvider`. |
| `@veap/kernel/http` | `COOKIE_STORE`, `REQUEST_CONTEXT`, `ICookieStore`, `IHttpRequestContext`, `MemoryCookieStore`, `MemoryRequestContext`, and security headers. |
| `@veap/kernel/next` | Next.js HTTP transport adapters (`NextCookieStore`, `NextRequestContext`, `NextTransportServiceProvider`). |
| `@veap/kernel/logging` | `LOGGER`, `ILogger`, `ConsoleLogger`, `logger`, `debug`, `info`, `warn`, and `error`. |

## IoC tokens registered by `KernelServiceProvider`

When `app.bootstrap()` runs, `KernelServiceProvider` binds the following tokens in the global container:

| Token | Default Binding | Interface / Type |
| :--- | :--- | :--- |
| `EVENT_BUS` / `EventBus` | `eventBus` (`EventBus`) | `IEventBus` |
| `COMMANDS` | `commands` (`CommandRegistry`) | `CommandRegistry` |
| `LOGGER` / `ConsoleLogger` | `logger` (`ConsoleLogger`) | `ILogger` |
| `CONFIG_SERVICE` / `ConfigService` | `ConfigService` | `IConfigService` |
| `CACHE_PROVIDER` | `MemoryCacheProvider` | `ICacheProvider` |
| `VEAP_CONFIG` | `VeapConfigProvider` | `IVeapConfigProvider` |
| `COOKIE_STORE` | `MemoryCookieStore` *(fallback, overridden by `NextCookieStore` in Next.js apps)* | `ICookieStore` |
| `REQUEST_CONTEXT` | `MemoryRequestContext` *(fallback, overridden by `NextRequestContext` in Next.js apps)* | `IHttpRequestContext` |

## Core classes and functions

The table below summarizes the primary classes and helper functions exported by `@veap/kernel`:

| Symbol | Signature / Members | Description |
| :--- | :--- | :--- |
| `Application` | `Application.configure()`, `bootstrap()`, `shutdown()`, `providers()` | Orchestrates registration, CLI command discovery, booting, and shutdown across `ServiceProvider` entries. |
| `ApplicationBuilder` | `.use(provider)`, `.with(provider)`, `.withProviders(list)`, `.create()` | Fluent builder returned by `Application.configure()`. |
| `Container` | `register(def)`, `resolve(token)`, `make(token)`, `call(target, method, ...extraArgs)`, `has(token)`, `clear()`, `reset()` | Asynchronous dependency injection container with method injection (`call`), HMR persistence, and in-flight promise deduplication. |
| `app` | `app(): Container` / `app<T>(token: Token<T>): Promise<T>` | Global helper returning the `Container` or resolving a token directly. |
| `ServiceProvider` | `register()`, `commands?()`, `boot?()`, `shutdown?()` | Abstract base class for modular service providers. |
| `AppError` | `BadRequest`, `Unauthorized`, `Forbidden`, `NotFound`, `Conflict`, `Validation`, `RateLimited`, `Internal`, `.toJSON()` | Transport-agnostic domain error class carrying an `ErrorCode` and optional `details`. |
| `ok` | `ok<T>(data: T): Result<T>` | Wraps a value into `{ success: true, data }`. |
| `handleActionError` | `handleActionError(e: unknown, context?: string): Result<never>` | Formats caught errors into `{ success: false, error }` while re-throwing Next.js `NEXT_REDIRECT` and `NEXT_NOT_FOUND` digests. |
| `httpStatusForErrorCode` | `httpStatusForErrorCode(code: ErrorCode): number` | Maps an `ErrorCode` to its HTTP status code (`400`–`500`). |
