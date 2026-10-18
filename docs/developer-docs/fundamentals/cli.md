# Console and CLI commands (`@veap/kernel/cli`)

`@veap/kernel` ships with a built-in console command runner (`@veap/kernel/cli`) and the `veap` binary (`bun veap <command>`). Every Veap application includes the console out of the box as a core kernel subsystem rather than an optional add-on.

## How the `veap` console works

When you run `bun veap <command>` from your project directory, `ConsoleApplication` executes a deterministic single-command lifecycle:

1. **Resolves the project root and environment**: Walks up from the current working directory (or `--cwd <path>`) to locate your project's `package.json`, sets `process.env.VEAP_CLI = "1"`, and loads `.env` and `.env.<env>` files before importing application code.
2. **Binds in-memory transport fallbacks**: Registers `MemoryCookieStore` (`COOKIE_STORE`) and `MemoryRequestContext` (`REQUEST_CONTEXT`) in the IoC container before bootstrap so services can be resolved outside an HTTP request scope without triggering `next/headers` errors.
3. **Discovers and boots your composition root**: Loads `lib/veap.ts` (or a dedicated console entry file) via `jiti` with JSX and `tsconfig.json` path alias support, calls `await app.bootstrap()`, and harvests `Command` definitions from every registered `ServiceProvider.commands()` method.
4. **Parses arguments and runs the command**: Matches CLI arguments and flags against the target command's `static signature`, injects `CommandContext` (`this.context`), and invokes `handle(input, output)`.
5. **Shuts down cleanly**: Always calls `await app.shutdown()` in a `finally` block so database connection pools and background listeners close cleanly before the process exits.

## Built-in and ecosystem CLI commands

Run `bun veap list` to inspect all commands registered in your application. `@veap/kernel` provides five built-in commands, and ecosystem providers (`MigrationServiceProvider` in `@veap/database` and `PluginsServiceProvider` in `@veap/plugins`) automatically register their own commands when added to `lib/veap.ts`:

| Command | Source package | Description |
| :--- | :--- | :--- |
| `veap list` | `@veap/kernel` | Lists all registered console commands grouped by namespace. |
| `veap help [command]` | `@veap/kernel` | Displays usage signature, arguments, and options for a command. |
| `veap about` | `@veap/kernel` | Prints environment, runtime, and registered provider diagnostics. |
| `veap config:show [key]` | `@veap/kernel` | Displays merged `ConfigService` values with sensitive secrets redacted. |
| `veap make:command <name>` | `@veap/kernel` | Scaffolds a new CLI command class in your project. |
| `veap make:migration <name>` | `@veap/database` | Creates a timestamped database migration file in `migrations/`. |
| `veap migrate` | `@veap/database` | Executes pending database migrations. |
| `veap migrate:status` | `@veap/database` | Shows applied and pending migrations. |
| `veap migrate:rollback` | `@veap/database` | Rolls back the last migration batch (`--force` skips confirmation). |
| `veap list-plugins` | `@veap/plugins` | Lists registered plugins and their runtime status. |
| `veap add <plugin>` | `@veap/plugins` | Installs a plugin (`--local`, `--skip-install`) and regenerates `lib/plugins.gen.ts`. |
| `veap remove <plugin>` | `@veap/plugins` | Removes a plugin (`--skip-install`) and updates `lib/plugins.gen.ts`. |
| `veap eject <plugin>` | `@veap/plugins` | Ejects an installed plugin or template into `plugins/<name>/` or `templates/<name>/`. |
| `veap make:plugin <name>` | `@veap/plugins` | Scaffolds a new local plugin in `plugins/<name>-plugin/`. |
| `veap plugins:sync` | `@veap/plugins` | Scans `package.json` and regenerates `lib/plugins.gen.ts`. |

### Global console flags

The `veap` runner recognizes global flags anywhere in `argv` before handing remaining tokens to the command:

| Flag | Shorthand | Description |
| :--- | :--- | :--- |
| `--cwd <path>` | — | Runs the console against a specific project root directory. |
| `--env <name>` | `-e` | Overrides `NODE_ENV` and loads `.env.<name>`. |
| `--force` | — | Waives interactive confirmation prompts (`this.context.flags.force = true`) for CI runs. |
| `--no-interaction` | `-n` | Disables interactive prompts (`ask()` uses default values or fails fast). |
| `--quiet` | `-q` | Suppresses informational and table output while preserving warnings and errors. |
| `--verbose` | `-v` | Enables `DEBUG=1` and prints full error stack traces. |
| `--help` | `-h` | Prints usage information for the target command. |
| `--version` | `-V` | Prints the installed `@veap/kernel` version. |

## Writing a custom CLI command

Scaffold a new command with `bun veap make:command SeedDemo` or create a class extending `Command` from `@veap/kernel/cli`. Declare `static signature` and `static description`, and implement `handle(input, output)`:

```ts
// lib/commands/seed-demo.command.ts
import { Command, type CommandInput, type Output } from "@veap/kernel/cli";

export class SeedDemoCommand extends Command {
  static override signature =
    "app:seed {--count=10 : Number of records} {--f|force : Skip confirmation prompt}";
  static override description = "Seed sample records into the database";

  async handle(input: CommandInput, output: Output): Promise<number> {
    const count = Number(input.option("count") ?? 10);

    if (!input.flag("force") && !this.context.flags.force) {
      const confirmed = await output.confirm(`Seed ${count} sample records?`);
      if (!confirmed) {
        output.warn("Seeding cancelled.");
        return 0;
      }
    }

    output.info(
      `Seeding ${count} records in ${this.context.env} environment...`,
    );
    output.success("Sample records created.");
    return 0;
  }
}
```

### Registering commands

You can register custom commands either directly on your `ApplicationBuilder` in `lib/veap.ts` using `.withCommands([...])`, or inside a `ServiceProvider` by implementing the `commands()` method:

```ts
// lib/veap.ts
import { Application } from "@veap/kernel";
import { SeedDemoCommand } from "./commands/seed-demo.command";

export const app = Application.configure()
  .withCommands([SeedDemoCommand])
  .create();
```

If you package commands inside a reusable module or plugin `ServiceProvider`, return them from `commands()`:

```ts
import { ServiceProvider } from "@veap/kernel";
import type { CommandEntry } from "@veap/kernel/cli";
import { SeedDemoCommand } from "./commands/seed-demo.command";

export class DemoServiceProvider extends ServiceProvider {
  commands(): CommandEntry[] {
    return [SeedDemoCommand];
  }

  register(): void {}
}
```

## Next steps

Explore the Veap ecosystem packages to build database models, authentication flows, and modular plugins:

- [Database and ORM (`@veap/database`)](../packages/database/index.md) — Define `Model` classes, relations, `AsyncLocalStorage` transactions, and migrations with `@veap/database`.
