# Testing Veap applications

Because Veap is built around an Inversion of Control (IoC) container, hexagonal transport ports (`COOKIE_STORE` and `REQUEST_CONTEXT`), and SQLite-compatible Active Record models, you can test services, Server Actions, database queries, and CLI commands in fast, isolated unit and integration tests without booting a Next.js HTTP server.

## Isolating the container and database

In test suites (using `bun:test` or `vitest`), reset or clear the global container between tests and always shut down the application in `afterAll` (or `afterEach`) so database connection pools and event listeners do not leak across test files.

| Method | Behavior | When to use |
| :--- | :--- | :--- |
| `container.clear()` | Clears instantiated singletons and in-flight promises while keeping registered provider definitions. | In `beforeEach` when all tests share the same `ServiceProvider` registrations. |
| `container.reset()` | Clears all provider definitions, singletons, and in-flight promises. | When each test registers a different set of providers or mock bindings. |
| `await app.shutdown()` | Calls `shutdown()` on all active providers in reverse order (closing Knex connections) and resets bootstrap flags. | In `afterAll` or `afterEach` after running `await app.bootstrap()`. |

```ts
// tests/articles.test.ts
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { DatabaseServiceProvider, runMigrations, Schema } from "@veap/database";
import { Application, container } from "@veap/kernel";
import { Article } from "../lib/models/article";

const testApp = Application.configure()
  .use(
    (c) =>
      new DatabaseServiceProvider(c, {
        config: {
          client: "better-sqlite3",
          connection: { filename: ":memory:" },
          useNullAsDefault: true,
        },
      }),
  )
  .create();

describe("Article model", () => {
  beforeAll(async () => {
    await testApp.bootstrap();
    await runMigrations("test", [
      {
        name: "create_articles",
        async up() {
          await Schema.create("articles", (table) => {
            table.uuid("id").primary();
            table.string("title").notNullable();
            table.string("slug").notNullable().unique();
            table.timestamps(true, true);
          });
        },
      },
    ]);
  });

  beforeEach(async () => {
    await Article.query().delete();
  });

  afterAll(async () => {
    await testApp.shutdown();
    container.reset();
  });

  it("creates and queries an article", async () => {
    await Article.create({ title: "Testing Veap", slug: "testing-veap" });
    const found = await Article.query().where("slug", "testing-veap").first();
    expect(found?.title).toBe("Testing Veap");
  });
});
```

## Mocking HTTP cookies and headers (`MemoryCookieStore` & `MemoryRequestContext`)

Next.js functions like `cookies()` and `headers()` throw an error when called outside a Next.js request scope. Because `@veap/auth` and `@veap/intl` read cookies and headers through `@veap/kernel`'s `COOKIE_STORE` and `REQUEST_CONTEXT` tokens, you can bind the built-in `MemoryCookieStore` and `MemoryRequestContext` adapters in your tests:

```ts
import { beforeEach, describe, expect, it } from "bun:test";
import {
  app,
   container,
  COOKIE_STORE,
  MemoryCookieStore,
  MemoryRequestContext,
  REQUEST_CONTEXT,
} from "@veap/kernel";

describe("HTTP transport isolation", () => {
  let cookieStore: MemoryCookieStore;
  let requestContext: MemoryRequestContext;

  beforeEach(() => {
    container.reset();
    cookieStore = new MemoryCookieStore();
    requestContext = new MemoryRequestContext();

    container.register({ token: COOKIE_STORE, useValue: cookieStore });
    container.register({ token: REQUEST_CONTEXT, useValue: requestContext });
  });

  it("reads cookies and headers from memory adapters", async () => {
    await cookieStore.set("NEXT_LOCALE", "de");
    requestContext.setHeader("accept-language", "de-DE,de;q=0.9,en;q=0.8");

    const resolvedCookies = await app(COOKIE_STORE);
    const resolvedRequest = await app(REQUEST_CONTEXT);

    expect(await resolvedCookies.get("NEXT_LOCALE")).toBe("de");
    expect(await resolvedRequest.getHeader("Accept-Language")).toContain("de-DE");
  });
});
```

## Testing CLI commands with `BufferedOutput`

`@veap/kernel/cli` provides `BufferedOutput`, an in-memory implementation of the `Output` port that captures every line written by a command and replays pre-queued answers for interactive `output.ask()` and `output.confirm()` prompts:

```ts
import { describe, expect, it } from "bun:test";
import { Application, container } from "@veap/kernel";
import {
  BufferedOutput,
  CommandInput,
  commands,
  matchArgs,
  parseSignature,
} from "@veap/kernel/cli";
import { SeedDemoCommand } from "../lib/commands/seed-demo.command";

describe("SeedDemoCommand", () => {
  it("prompts for confirmation and seeds records", async () => {
    const sig = parseSignature(SeedDemoCommand.signature);
    const matched = matchArgs(sig, ["--count=5"]);
    const input = new CommandInput(sig, matched, ["--count=5"]);

    // Queue "yes" for the output.confirm() prompt
    const output = new BufferedOutput().queueAnswer("yes");

    const cmd = new SeedDemoCommand({
      root: process.cwd(),
      env: "test",
      application: new Application([]),
      container,
      registry: commands,
      flags: { force: false },
    });

    const exitCode = await cmd.handle(input, output);

    expect(exitCode).toBe(0);
    expect(output.find("success")).toContain("Sample records created.");
  });
});
```
