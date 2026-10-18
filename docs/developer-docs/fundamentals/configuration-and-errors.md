# Configuration and error handling

`@veap/kernel` provides a unified configuration system that merges environment variables with a typed `veap.config.ts` file, alongside a transport-agnostic domain error taxonomy (`AppError`) and Server Action result helpers (`Result<T>`, `ok`, and `handleActionError`).

## Configuration management

Veap separates configuration into two complementary mechanisms: static project configuration defined in `veap.config.ts` and runtime configuration accessed through the `CONFIG_SERVICE` (`ConfigService`) IoC port.

### Project configuration with `veap.config.ts`

At the root of your application, `veap.config.ts` exports a configuration object satisfying the `VeapConfig` interface. During `KernelServiceProvider.boot()`, `@veap/kernel` loads `veap.config.ts` on the server using `jiti` (via the `VEAP_CONFIG` port) and merges all defined keys into `ConfigService`.

```ts
// veap.config.ts
import type { VeapConfig } from "@veap/kernel";

const config: VeapConfig = {
  debug: process.env.NODE_ENV !== "production",
  appName: "Acme Portal",
  pagination: {
    defaultPageSize: 20,
  },
};

export default config;
```

`@veap/kernel` looks for the configuration file in the current working directory in the following order:

1. `veap.config.ts`
2. `veap.config.mjs`
3. `veap.config.js`
4. `veap.config`

In development, `getVeapConfig()` reloads `veap.config.ts` on demand with cache busting so changes take effect immediately. In production (`NODE_ENV === "production"`), the parsed object is cached in memory after the first read.

<!-- prettier-ignore -->
> [!NOTE]
> `getVeapConfig()` is strictly a server-only function (`@veap/kernel/server` or `@veap/kernel`). Calling it in a browser environment throws an `INTERNAL_SERVER_ERROR` `AppError`.

### Reading configuration via `CONFIG_SERVICE`

In your services, Server Components, or Server Actions, resolve `CONFIG_SERVICE` (or `ConfigService`) from the container. `ConfigService` initializes with a snapshot of `process.env` and is enriched with keys from `veap.config.ts` when `KernelServiceProvider` boots.

```ts
import { app, CONFIG_SERVICE } from "@veap/kernel";

export async function getMailConfiguration() {
  const config = await app(CONFIG_SERVICE);

  // Read with an optional fallback value
  const driver = config.get<string>("MAIL_DRIVER", "log");
  const fromAddress = config.get<string>("MAIL_FROM", "noreply@example.com");

  // Check if a key is defined
  if (config.has("SMTP_HOST")) {
    const smtpHost = config.get<string>("SMTP_HOST");
    return { driver, fromAddress, smtpHost };
  }

  return { driver, fromAddress };
}
```

### `IConfigService` API summary

The `IConfigService` contract exposes four methods for reading and mutating runtime configuration:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `get` | `get<T = any>(key: string, defaultValue?: T): T` | Returns the configuration value for `key`, or `defaultValue` if `undefined`. |
| `has` | `has(key: string): boolean` | Returns `true` if `key` exists in the configuration store and is not `undefined`. |
| `set` | `set(key: string, value: any): void` | Sets or overrides a configuration value in memory at runtime. |
| `getAll` | `getAll(): Record<string, any>` | Returns a shallow copy of all configuration key-value pairs. |

## Domain error handling with `AppError`

Instead of throwing generic `Error` instances or coupling business services to HTTP status codes, Veap models failures with the `AppError` class. Every `AppError` carries a transport-agnostic `ErrorCode`, a human-readable `message`, and an optional `details` payload (such as field validation errors).

```ts
import { AppError } from "@veap/kernel";

export async function publishArticle(articleId: number, userId: number | null) {
  if (!userId) {
    throw AppError.Unauthorized("You must be signed in to publish articles.");
  }

  const article = await findArticleById(articleId);
  if (!article) {
    throw AppError.NotFound(`Article #${articleId} does not exist.`);
  }

  if (article.authorId !== userId) {
    throw AppError.Forbidden("You can only publish your own articles.");
  }

  if (!article.title.trim()) {
    throw AppError.Validation("Article title cannot be empty.", {
      field: "title",
    });
  }
}
```

### Static factory methods and error codes

`AppError` provides eight static factory methods that map directly to standardized `ErrorCode` values and HTTP status codes (via `httpStatusForErrorCode(code)`):

| Factory Method | `ErrorCode` | Default Message | HTTP Status (`httpStatusForErrorCode`) |
| :--- | :--- | :--- | :--- |
| `AppError.BadRequest(message, details?)` | `"BAD_REQUEST"` | *(required)* | `400` |
| `AppError.Unauthorized(message?, details?)` | `"UNAUTHORIZED"` | `"Unauthorized"` | `401` |
| `AppError.Forbidden(message?, details?)` | `"FORBIDDEN"` | `"Forbidden"` | `403` |
| `AppError.NotFound(message?, details?)` | `"NOT_FOUND"` | `"Not Found"` | `404` |
| `AppError.Conflict(message, details?)` | `"CONFLICT"` | *(required)* | `409` |
| `AppError.Validation(message, details?)` | `"VALIDATION_ERROR"` | *(required)* | `422` |
| `AppError.RateLimited(message?, details?)` | `"RATE_LIMITED"` | `"Too Many Requests"` | `429` |
| `AppError.Internal(message?, details?)` | `"INTERNAL_SERVER_ERROR"` | `"Internal Server Error"` | `500` |

Calling `error.toJSON()` serializes any `AppError` into a plain object safe for crossing the Next.js Server Action boundary:

```ts
{
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Article title cannot be empty.",
    details: { field: "title" },
  },
}
```

## Typed Server Action results (`Result<T>`)

Next.js Server Actions serialize return values across the network to Client Components, and unhandled exceptions strip custom properties in production builds. To preserve typed error codes and validation details without try/catch boilerplate on the client, `@veap/kernel` provides the `Result<T>` discriminated union along with `ok()` and `handleActionError()`.

```ts
export type AppErrorJson = {
  code: ErrorCode;
  message: string;
  details?: unknown;
};

export type Result<T> =
  | { success: true; data: T; error?: never }
  | { success: false; error: AppErrorJson; data?: never };
```

### Using `ok()` and `handleActionError()` in Server Actions

Wrap your Server Action body in a `try / catch` block, return `ok(data)` on success, and delegate any caught error to `handleActionError(e)`:

```ts
// app/actions/articles.ts
"use server";

import { AppError, handleActionError, ok, type Result } from "@veap/kernel";
import { initializeSystem } from "@/lib/veap";

export async function createTagAction(
  name: string,
): Promise<Result<{ id: number; slug: string }>> {
  try {
    await initializeSystem();

    const trimmed = name.trim();
    if (trimmed.length < 2) {
      throw AppError.Validation("Tag name must be at least 2 characters.", {
        field: "name",
      });
    }

    const slug = trimmed.toLowerCase().replace(/\s+/g, "-");
    return ok({ id: 1, slug });
  } catch (e) {
    return handleActionError(e, "createTagAction");
  }
}
```

<!-- prettier-ignore -->
> [!IMPORTANT]
> `handleActionError(e)` automatically detects Next.js internal control-flow exceptions (`NEXT_REDIRECT` and `NEXT_NOT_FOUND` digests) and re-throws them so `redirect()` and `notFound()` calls inside your Server Actions continue to work as expected.

### Mapping `AppError` in REST Route Handlers

When building JSON Route Handlers (`app/api/.../route.ts`), combine `handleActionError` with `httpStatusForErrorCode` to return proper HTTP status codes alongside the standardized error payload:

```ts
// app/api/tags/route.ts
import { handleActionError, httpStatusForErrorCode, ok } from "@veap/kernel";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json(ok({ created: body.name }), { status: 201 });
  } catch (e) {
    const failure = handleActionError(e);
    return NextResponse.json(failure, {
      status: httpStatusForErrorCode(failure.error.code),
    });
  }
}
```

## Next steps

Continue exploring `@veap/kernel` fundamentals:

- [Events, caching, and logging](./events-and-cache.md) — Decouple domain side effects with `EventBus`, cache expensive queries with `CACHE_PROVIDER`, and output structured logs via `LOGGER`.
