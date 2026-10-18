# Testing and QA Runbook for Maintainers

This runbook outlines testing methodologies, container isolation strategies, database connection lifecycle management, and pre-release quality assurance (QA) verification for the Veap monorepo.

Maintaining high architectural confidence across multiple decoupled packages requires strict test isolation and automated verification before changes merge to `main`.

## Testing architecture and philosophies

Veap tests operate across three distinct tiers:

1. **Unit and contract tests (package-level):** Verify individual services, model algorithms, signature parsers, and cryptographic adapters in complete isolation.
2. **Integration tests (monorepo-level):** Verify multi-package interactions, such as `MigrationServiceProvider` executing schema DDL via `@veap/database` or `AuthServiceProvider` creating hashed sessions through the kernel container.
3. **Application fixture checks:** Validate that example apps (`apps/01-base`, `apps/04-blog`, `apps/05_fullstack`) and templates build and run against the workspace packages.

## IoC container test isolation

The global IoC container (`container` or `app()`) caches singleton instances and resolved dependencies. If tests mutate global container bindings without cleanup, subsequent tests can suffer from non-deterministic failures.

### Resetting container state

Always clean up container registrations and singletons in test lifecycle hooks (`beforeEach` or `afterEach`):

```ts
import { describe, it, beforeEach, expect } from "vitest";
import { container } from "@veap/kernel";

describe("ReportService", () => {
  beforeEach(() => {
    // Purges all cached singleton instances and in-flight resolutions
    container.clear();
  });

  it("resolves fresh instances without state leakage", async () => {
    // ...
  });
});
```

| Method | Behavior | When to Use |
|---|---|---|
| `container.clear()` | Purges all cached singleton instances and in-flight resolutions while preserving registered provider definitions. | Standard unit tests where provider bindings remain constant across test cases. |
| `container.reset()` | Completely wipes all registered provider definitions and all cached instances. | Integration tests where different test cases register completely different ServiceProviders. |

### Mocking ports and adapters

Because Veap follows Hexagonal Architecture (Ports and Adapters), you should never mock concrete class internals. Instead, register a mock adapter under the port's injection token:

```ts
import { describe, it, beforeEach, expect } from "vitest";
import { container } from "@veap/kernel";
import { MAILER, type IMailer, type MailMessage } from "@veap/mail";

class MockMailer implements IMailer {
  public sentMessages: MailMessage[] = [];

  async sendMail(message: MailMessage): Promise<void> {
    this.sentMessages.push(message);
  }
}

describe("NotificationService", () => {
  let mockMailer: MockMailer;

  beforeEach(() => {
    container.clear();
    mockMailer = new MockMailer();

    // Bind mock adapter to the official injection token
    container.register({
      token: MAILER,
      useValue: mockMailer,
    });
  });

  it("sends a welcome email on registration", async () => {
    // Execute service under test
    expect(mockMailer.sentMessages).toHaveLength(1);
  });
});
```

## Database testing and connection management

Database tests verify schema migrations, model queries, transactions, and active record hooks.

### In-memory SQLite for speed

Configure `DATABASE_URL` to use an in-memory SQLite instance for fast, ephemeral test execution:

```bash
DATABASE_URL="sqlite::memory:"
```

### Closing database connection pools

<!-- prettier-ignore -->
> [!IMPORTANT]
> Failing to destroy Knex connection pools in test suites causes Node.js and Bun test processes to hang indefinitely waiting for open socket connections.

Always close database connections in the `afterAll` hook:

```ts
import { describe, it, beforeAll, afterAll } from "vitest";
import { getKnex } from "@veap/database";
import { runMigrations } from "@veap/database/migrations";
import { appMigrations } from "../migrations/index.js";

describe("Database integration", () => {
  beforeAll(async () => {
    // Run migrations before executing tests
    await runMigrations("test", appMigrations);
  });

  afterAll(async () => {
    // Destroy connection pool to allow clean process termination
    const knex = getKnex();
    if (knex) {
      await knex.destroy();
    }
  });

  it("queries the migrated schema", async () => {
    // ...
  });
});
```

### Transactional test isolation

To prevent database writes from leaking between test cases without re-running migrations, wrap individual test cases in transactions and roll them back:

```ts
import { it, beforeEach, afterEach } from "vitest";
import { getKnex } from "@veap/database";

let trx: any;

beforeEach(async () => {
  const knex = getKnex();
  trx = await knex.transaction();
});

afterEach(async () => {
  if (trx) {
    await trx.rollback();
  }
});
```

## Testing CLI commands

Console commands written with `@veap/kernel/cli` should never write directly to `process.stdout` or call `process.exit()`. They accept an `Output` port and return numeric exit codes, making them easy to unit test.

### Using `BufferedOutput`

Use `BufferedOutput` to assert printed lines, levels, tables, and prompts:

```ts
import { describe, it, expect } from "vitest";
import {
  BufferedOutput,
  CommandInput,
  MakeCommandCommand,
  parseSignature,
  matchArgs,
} from "@veap/kernel/cli";

describe("MakeCommandCommand", () => {
  it("scaffolds a command file", async () => {
    const output = new BufferedOutput();
    const command = new MakeCommandCommand(testContext);

    const rawArgs = ["reports:generate"];
    const sig = parseSignature(MakeCommandCommand.signature);
    const parsed = matchArgs(sig, rawArgs);
    const input = new CommandInput(sig, parsed, rawArgs);

    const exitCode = await command.handle(input, output);

    expect(exitCode).toBe(0);
    expect(output.find("success")[0]).toContain("Created");
  });

  it("handles prompts via queued answers", async () => {
    const output = new BufferedOutput();
    output.queueAnswer("yes"); // Pre-program interactive prompt response

    const confirmed = await output.confirm("Are you sure?");
    expect(confirmed).toBe(true);
  });
});
```

## Pre-merge and release verification suite

Before opening a pull request or executing a release, run the monorepo verification checks in sequence:

```bash
# 1. Format and lint with Biome
bun run check:write

# 2. Verify architectural package boundaries
bun run check:arch

# 3. Type-check the entire workspace
bun run check-types

# 4. Run workspace unit and integration tests
bun run test

# 5. Validate documentation links and navigation metadata
node docs/scripts/check-docs.mjs

# 6. Verify ecosystem generated snapshot
node apps/veap-docs/scripts/generate-ecosystem.mjs --check
```

If any check in this pipeline fails, fix the issue locally before committing.
