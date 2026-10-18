# Deployment and production readiness

Preparing a Veap + Next.js App Router application for production involves configuring dynamic route rendering so build workers do not require live database connections, verifying required secrets, and swapping in-memory development adapters for multi-instance production drivers where needed.

## Next.js build boundaries and `force-dynamic`

During `next build`, Next.js attempts to prerender static routes at build time. Any layout or page that calls `await initializeSystem()` and queries the database or session store must opt into dynamic rendering so the kernel boots at request time rather than during container image builds:

```tsx
// app/layout.tsx
import { initializeSystem } from "@/lib/veap";

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await initializeSystem();
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

Ensure your root `instrumentation.ts` also guards initialization behind the Node.js runtime check:

```ts
// instrumentation.ts
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeSystem } = await import("./lib/veap");
    await initializeSystem();
  }
}
```

## Production environment variables checklist

Before starting your application in production (`NODE_ENV=production`), configure the following environment variables:

| Variable | Package | Requirement |
| :--- | :--- | :--- |
| `NODE_ENV` | `@veap/kernel` | Set to `"production"`. Suppresses debug logs and enables strict security defaults. |
| `DATABASE_URL` | `@veap/database` | Connection URI (such as `postgres://user:pass@host:5432/db`) or SQLite file path. |
| `DATABASE_SSL_REJECT_UNAUTHORIZED` | `@veap/database` | Optional (`"false"` when using managed PostgreSQL with self-signed certificates). |
| `ENCRYPTION_KEY` | `@veap/auth` | Required when `@veap/auth` is used. Base64-encoded 16, 24, or 32-byte key (`openssl rand -base64 16`). |
| `MAIL_TRANSPORT` | `@veap/mail` | Set to `"smtp"` or `"custom"` in production (`"console"` is for local development). |

## Running migrations in CI/CD pipelines

By default, `MigrationServiceProvider` and `PluginsServiceProvider` apply pending migrations on startup during `app.bootstrap()`. In multi-replica deployments where you prefer running migrations as a dedicated release step before rolling out new containers:

1. Run `bun veap migrate --force` in your deployment pipeline.
2. Check migration status at any time with `bun veap migrate:status`.
3. Roll back the last batch if needed with `bun veap migrate:rollback --force`.

## Multi-instance cache and cloud storage adapters

Out of the box, Veap registers single-node adapters (`MemoryCacheProvider` for `CACHE_PROVIDER` and `LocalFileProvider` for `StorageService`). When scaling horizontally across multiple stateless containers:

- **Cache (`CACHE_PROVIDER`)**: Implement `ICacheProvider` backed by Redis or Upstash and bind it to `CACHE_PROVIDER` in `lib/veap.ts` so `@veap/settings` and custom services share cache invalidation across instances.
- **File storage (`StorageService`)**: Implement `IStorageProvider` backed by S3, Cloudflare R2, or Supabase Storage and register it on `StorageService` so user uploads are stored in durable object storage rather than container-local disk.

## Containerizing with Docker (`Dockerfile`)

Use a multi-stage `Dockerfile` to produce minimal, secure container images based on Next.js standalone output. Configure `output: "standalone"` in `next.config.ts`:

```dockerfile
# Dockerfile
FROM oven/bun:1.2-alpine AS base

# Stage 1: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 2: Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NODE_ENV=production
RUN bun run build

# Stage 3: Production runner
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy standalone build and static assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
```

### Docker Compose for local staging

Run your application alongside PostgreSQL and Redis using `docker-compose.yml`:

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://veap:secret@postgres:5432/veap_prod
      - REDIS_URL=redis://redis:6379
      - ENCRYPTION_KEY=dGhpc2lzYTE2Ynl0ZWtleTEyMzQ=
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_started

  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: veap
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: veap_prod
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U veap"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

## Continuous deployment with GitHub Actions

Automate linting, testing, image builds, and zero-downtime database migrations in `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  verify-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install --frozen-lockfile

      - name: Run test suite
        run: bun run test

      - name: Run database migrations
        env:
          DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
          ENCRYPTION_KEY: ${{ secrets.PROD_ENCRYPTION_KEY }}
        run: bun veap migrate --force

      - name: Deploy container to production
        run: |
          echo "Triggering deployment webhook or registry push..."
```

### Zero-downtime migration strategy

In continuous deployment pipelines where old and new container instances run simultaneously during rolling updates, follow the expand and contract pattern for database schema changes:

1. **Phase 1 (Expand)**: Add new columns as nullable, or create new tables. Deploy the code that writes to both old and new columns.
2. **Phase 2 (Backfill)**: Run a background migration or script to backfill existing records.
3. **Phase 3 (Contract)**: Deploy code reading exclusively from the new column. Once all old containers are replaced, apply a migration dropping unused columns or constraints.

## PaaS and self-hosted deployment guides

Deploy your Veap container image or repository to modern hosting platforms:

- **Coolify / Railway / Render**: Connect your Git repository, configure environment variables (`DATABASE_URL`, `ENCRYPTION_KEY`, `NODE_ENV=production`), set the build command to `bun install && bun run build`, and start command to `node .next/standalone/server.js` or `bun run start`.
- **Vercel**: Deploy directly using the official Next.js integration. Because serverless runtimes have a read-only root filesystem (`/var/task`), `@veap/database` redirects SQLite database files to `/tmp/veap.sqlite`. Because `/tmp` on serverless functions is ephemeral and reset between cold starts, configure a persistent PostgreSQL database (such as Neon, Supabase, or AWS RDS) using connection pooler endpoints (with `sslmode=require`) to prevent connection exhaustion.
- **Ubuntu VPS with PM2 and Nginx**: Run your standalone application using PM2 (`pm2 start server.js --name my-app`) behind an Nginx reverse proxy with automated Let's Encrypt SSL certificates.
