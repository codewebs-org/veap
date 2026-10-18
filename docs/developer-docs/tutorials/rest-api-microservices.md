# Building REST APIs and microservices with Veap

This tutorial demonstrates how to build RESTful web services with Veap across two primary deployment patterns:

1. **Next.js Route Handlers (`app/api/`)**: High-performance API endpoints co-located with your Next.js application, sharing database models and authentication.
2. **Standalone Hono microservices (`02-hono`)**: Ultra-lightweight REST API microservices pairing [Hono](https://hono.dev) with `@veap/kernel`'s IoC container and Active Record ORM—without Next.js or React.

---

## Pattern 1: REST endpoints with Next.js Route Handlers

Next.js App Router defines API endpoints in `app/api/**/route.ts` files. By integrating `@veap/kernel` and `@veap/database`, your route handlers benefit from Active Record models, transactions, typed error handling, and session authentication.

### Step 1: Define the model

Create an Active Record model in `lib/models/article.ts`:

```ts
// lib/models/article.ts
import { Model } from "@veap/database";

export class Article extends Model {
  static override table = "articles";

  declare id: number;
  declare title: string;
  declare slug: string;
  declare content: string;
  declare is_published: boolean;

  protected static override casts = {
    is_published: "boolean",
  } as const;
}
```

### Step 2: Create a collection Route Handler (`app/api/articles/route.ts`)

Implement `GET` (list with pagination) and `POST` (create with Bearer token authentication and Zod validation):

```ts
// app/api/articles/route.ts
import { NextResponse } from "next/server";
import { getCurrentSession } from "@veap/auth";
import { AppError, httpStatusForErrorCode } from "@veap/kernel";
import { Article } from "@/lib/models/article";
import { initializeSystem } from "@/lib/veap";
import { z } from "zod";

const createArticleSchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3),
  content: z.string().min(10),
  is_published: z.boolean().default(false),
});

export async function GET(request: Request) {
  await initializeSystem();

  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") ?? 1);
  const perPage = Number(url.searchParams.get("perPage") ?? 10);

  const paginated = await Article.query()
    .where("is_published", true)
    .orderBy("created_at", "desc")
    .paginate(page, perPage);

  return NextResponse.json(paginated);
}

export async function POST(request: Request) {
  try {
    await initializeSystem();

    // 1. Authenticate via session cookie or Authorization: Bearer <token>
    const { user } = await getCurrentSession();
    if (!user) {
      throw AppError.Unauthorized("Authentication required.");
    }

    // 2. Validate request payload
    const body = await request.json();
    const parsed = createArticleSchema.safeParse(body);
    if (!parsed.success) {
      throw AppError.Validation("Invalid input", parsed.error.format());
    }

    // 3. Create record using Active Record ORM
    const article = await Article.create(parsed.data);

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        error.toJSON(),
        { status: httpStatusForErrorCode(error.code) },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
```

### Step 3: Create an item Route Handler (`app/api/articles/[id]/route.ts`)

Handle single-resource `GET`, `PUT`, and `DELETE` requests:

```ts
// app/api/articles/[id]/route.ts
import { NextResponse } from "next/server";
import { getCurrentSession } from "@veap/auth";
import { AppError, httpStatusForErrorCode } from "@veap/kernel";
import { Article } from "@/lib/models/article";
import { initializeSystem } from "@/lib/veap";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await initializeSystem();
  const { id } = await params;

  const article = await Article.find(Number(id));
  if (!article) {
    return NextResponse.json(
      AppError.NotFound("Article not found").toJSON(),
      { status: 404 },
    );
  }

  return NextResponse.json(article);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await initializeSystem();

    const { user } = await getCurrentSession();
    if (!user) {
      throw AppError.Unauthorized();
    }

    const { id } = await params;
    const article = await Article.find(Number(id));
    if (!article) {
      throw AppError.NotFound();
    }

    await article.delete();
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        error.toJSON(),
        { status: httpStatusForErrorCode(error.code) },
      );
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
```

---

## Pattern 2: Standalone API microservices with Hono (`02-hono`)

When you do not need Next.js or React, pair [Hono](https://hono.dev) with `@veap/kernel` for sub-millisecond response times, edge portability, and full access to the Veap IoC container.

### Step 1: Scaffold using the `02-hono` template

Run `create-veap` with the `--template 02-hono` flag:

```bash
bun create veap my-api --template 02-hono
cd my-api
```

### Step 2: Bridge Hono request context with `@veap/kernel`

In `src/veap.ts`, adapt Hono's `contextStorage` to satisfy `@veap/kernel`'s `COOKIE_STORE` and `REQUEST_CONTEXT` ports:

```ts
// src/veap.ts
import {
  Application,
  COOKIE_STORE,
  type ICookieStore,
  type IHttpRequestContext,
  REQUEST_CONTEXT,
  ServiceProvider,
} from "@veap/kernel";
import { tryGetContext } from "hono/context-storage";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

class HonoTransportServiceProvider extends ServiceProvider {
  register(): void {
    // Adapter for COOKIE_STORE backed by Hono context
    this.container.register({
      token: COOKIE_STORE,
      useValue: {
        async get(name: string) {
          const c = tryGetContext();
          return c ? getCookie(c, name) : undefined;
        },
        async set(name: string, value: string, options?: any) {
          const c = tryGetContext();
          if (c) setCookie(c, name, value, options);
        },
        async delete(name: string) {
          const c = tryGetContext();
          if (c) deleteCookie(c, name);
        },
      } satisfies ICookieStore,
    });

    // Adapter for REQUEST_CONTEXT backed by Hono headers
    this.container.register({
      token: REQUEST_CONTEXT,
      useValue: {
        async getHeader(name: string) {
          const c = tryGetContext();
          return c ? c.req.header(name) : undefined;
        },
        async getIp() {
          const c = tryGetContext();
          return c ? c.req.header("x-forwarded-for") : undefined;
        },
      } satisfies IHttpRequestContext,
    });
  }
}

export const app = Application.configure()
  .use(HonoTransportServiceProvider)
  .create();
```

### Step 3: Run the Hono server (`src/index.ts`)

Mount the Hono router with `contextStorage` middleware, boot the Veap application on startup, and graceful shutdown on termination:

```ts
// src/index.ts
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { app } from "./veap";

const server = new Hono();

// Enable async request context storage
server.use("*", contextStorage());

server.get("/health", (c) => {
  return c.json({ status: "healthy", timestamp: new Date().toISOString() });
});

server.get("/api/v1/info", async (c) => {
  return c.json({ framework: "Veap + Hono", runtime: "bun" });
});

// Boot Veap lifecycle before listening
await app.bootstrap();

export default server;
```

Start the service with Bun:

```bash
bun run dev
```

Visit `http://localhost:3000/health` to verify that the service is running.
