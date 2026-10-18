# Troubleshooting and frequently asked questions

This guide provides solutions for common issues encountered during development, testing, and production deployment of Veap applications.

## Database connection issues

When running applications against managed databases, local file stores, or serverless platforms, unexpected connection drops and lock contention can occur.

### PostgreSQL connection exhaustion in serverless environments

In serverless hosting environments (such as Vercel, AWS Lambda, or Cloudflare Pages), each serverless function invocation can instantiate a new database connection pool. Under load, this exhausts the database connection limit and produces `remaining connection slots are reserved for non-replication superuser connections` or `timeout acquiring connection` errors.

To prevent connection exhaustion:

1. **Use a managed connection pooler**: Connect to your database using a connection pooler endpoint (such as PgBouncer, Neon pooled connections, or Supabase connection pooler on port `6543`).
2. **Configure connection pool limits**: In your database configuration, configure a low pool maximum (such as `max: 2` or `max: 1`) for serverless functions:

```ts
// lib/veap.ts
export const app = Application.configure()
  .use(
    (c) =>
      new DatabaseServiceProvider(c, {
        pool: { min: 0, max: 1 },
      }),
  )
  .create();
```

### SQLite locks (`SQLITE_BUSY: database is locked`)

When running concurrent writes or parallel test suites against a local SQLite file, SQLite can return `SQLITE_BUSY` errors because default rollback journals lock the entire database file during writes.

To resolve SQLite locking:

1. **Enable Write-Ahead Logging (WAL)**: In WAL mode, readers do not block writers and writers do not block readers. Configure WAL mode in your connection options:

```ts
// veap.config.ts or database provider options
{
  client: "better-sqlite3",
  connection: {
    filename: "./data/app.sqlite",
    options: {
      timeout: 5000, // Wait up to 5 seconds before throwing SQLITE_BUSY
    },
  },
}
```

2. **Use isolated databases for parallel tests**: When running tests with Vitest or Jest in multi-worker mode, allocate a unique database file per worker using `process.env.VITEST_POOL_ID` or use in-memory SQLite (`:memory:`).

### Recovering from migration locks (`knex_migrations_lock`)

If a migration process terminates abruptly (such as a container crash or forced SIGKILL), Knex may leave the migration lock active, causing subsequent `veap migrate` commands to hang indefinitely.

To resolve a migration lock:

1. Inspect the migration status:
   ```bash
   bun veap migrate:status
   ```
2. If migrations report a persistent lock, clear the lock in your database client:
   ```sql
   UPDATE knex_migrations_lock SET is_locked = 0;
   ```
3. Re-run `bun veap migrate`.

## CLI and environment issues

Console commands and automated scripts run in a standalone Node.js or Bun process without an active HTTP server context.

### `Dynamic server usage: cookies() cannot be called outside request scope`

Next.js App Router throws a dynamic server usage error if code calls `cookies()` or `headers()` from `next/headers` inside CLI commands or background workers where no HTTP request exists.

In Veap, the console runner automatically sets `process.env.VEAP_CLI = "1"` and registers in-memory transport fallbacks `MemoryCookieStore` (`COOKIE_STORE`) and `MemoryRequestContext` (`REQUEST_CONTEXT`) before bootstrapping services.

If you encounter this error in custom services:

- Do not call `cookies()` from `next/headers` directly inside reusable service classes or domain models.
- Instead, inject the `COOKIE_STORE` token from `@veap/kernel`:

```ts
import { COOKIE_STORE, type ICookieStore, Inject } from "@veap/kernel";

export class SessionService {
  constructor(@Inject(COOKIE_STORE) private cookies: ICookieStore) {}

  async getSessionToken(): Promise<string | undefined> {
    return this.cookies.get("session_token");
  }
}
```

In HTTP requests, `COOKIE_STORE` automatically delegates to Next.js `cookies()`. In CLI commands, it reads from in-memory fallback storage without throwing errors.

### Invalid `ENCRYPTION_KEY` in `@veap/auth`

On startup, `@veap/auth` validates that `ENCRYPTION_KEY` is a base64-encoded string representing exactly 16, 24, or 32 bytes (128, 192, or 256 bits for AES-GCM encryption). If the key is missing or has an invalid length, startup halts with a descriptive error.

Generate a valid 16-byte key using OpenSSL:

```bash
openssl rand -base64 16
```

Copy the generated output to your `.env` file:

```ini
ENCRYPTION_KEY=dGhpc2lzYTE2Ynl0ZWtleTEyMzQ=
```

## React and UI hydration mismatches

Next.js App Router renders pages on the server before hydrating interactive components on the client, which can trigger hydration mismatches if states diverge.

### Hydration warning with theme and language attributes

If you inspect the console and observe `Warning: Extra attributes from the server: class, style` on the `<html>` or `<body>` element, this occurs when client-side theme toggling or locale negotiation modifies attributes before hydration completes.

Add `suppressHydrationWarning` to the root `<html>` tag in `app/layout.tsx`:

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Static prerendering failure during `next build`

If `bun run build` or `next build` fails with an error indicating that a database query or secret environment variable was requested during build time:

1. Ensure your root `app/layout.tsx` or dynamic routes export `export const dynamic = "force-dynamic";`.
2. Guard background database calls in `instrumentation.ts` behind `if (process.env.NEXT_RUNTIME === "nodejs")`.
