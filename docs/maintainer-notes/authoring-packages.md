# Authoring packages in the Veap ecosystem

This guide is a practical walkthrough for developers building a new package
(`@veap/*`) or extending an existing one within the Veap monorepo.

---

## 1. Anatomy of a Veap package

A compliant Veap framework package adheres to this directory layout:

```
packages/my-service/
├── src/
│   ├── index.ts             # Public contracts, types, and client-safe tokens
│   ├── server.ts            # Server-only provider and implementation (optional)
│   ├── provider.ts          # ServiceProvider implementation
│   ├── service.ts           # Core business logic and adapter implementations
│   ├── contracts.ts         # Interfaces (ports) and container tokens
│   └── composition.ts       # Module augmentation for ApplicationBuilder
├── tests/
│   ├── service.test.ts      # Unit tests
│   └── integration.test.ts  # Container and lifecycle tests
├── dist/                    # Compiled JavaScript and TypeScript declaration files
├── package.json             # Manifest with subpath exports and versioned dependencies
└── tsconfig.json            # Strict TypeScript configuration
```

### Module format and import rules

1. **Pure ESM (`"type": "module"`):** All Veap packages are distributed as
   ECMAScript Modules. CommonJS is not supported.
2. **Explicit `.js` extensions:** In TypeScript source files under `src/`, all
   relative imports must use the `.js` extension (for example, `import { foo } from "./foo.js";`),
   matching Node.js native ESM module resolution.
3. **No circular imports:** Ensure barrel files (`index.ts`) only re-export
   completed modules.

---

## 2. Package manifest conventions (`package.json`)

Here is an annotated template for a Veap package manifest:

```json
{
  "name": "@veap/my-service",
  "version": "0.1.10",
  "description": "My custom domain service for the Veap framework",
  "repository": {
    "type": "git",
    "url": "https://github.com/veapjs/veap.git",
    "directory": "packages/my-service"
  },
  "type": "module",
  "license": "MIT",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./server": {
      "types": "./dist/server.d.ts",
      "default": "./dist/server.js"
    },
    "./package.json": "./package.json"
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "clean": "rimraf dist",
    "build": "rimraf dist && tsc",
    "dev": "tsc --watch",
    "test": "vitest run"
  },
  "dependencies": {
    "@veap/kernel": "^0.2.2"
  },
  "peerDependencies": {
    "@veap/ui": "^0.1.4"
  },
  "peerDependenciesMeta": {
    "@veap/ui": {
      "optional": true
    }
  },
  "devDependencies": {
    "@types/node": "^22.20.2",
    "rimraf": "^6.1.3",
    "typescript": "6.0.3",
    "vitest": "^5.0.0"
  }
}
```

### Critical rules for `dependencies`
- **Never use `workspace:*` in published packages:** The automated release
  workflow forbids `workspace:*` ranges before publishing to npm. Use the
  monorepo's current version (for example, `"0.1.10"`).
- **Align internal `@veap/*` versions:** Ensure all internal `@veap/*` dependencies
  match the exact workspace version (`0.1.10`) to avoid duplicate package
  resolution and lockfile corruption during `bun install`.

---

## 3. Implementing the `ServiceProvider`

Every capability in Veap is mounted via a `ServiceProvider`. Create a dedicated
provider subclassing `ServiceProvider` from `@veap/kernel`:

```ts
// src/provider.ts
import { LOGGER, type ILogger, ServiceProvider } from "@veap/kernel";
import { MY_SERVICE, type IMyService } from "./contracts.js";
import { MyServiceImpl } from "./service.js";

export interface MyServiceOptions {
  apiKey?: string;
  timeoutMs?: number;
}

export class MyServiceProvider extends ServiceProvider {
  constructor(
    container: any,
    private readonly options: MyServiceOptions = {}
  ) {
    super(container);
  }

  override register(): void {
    // 1. Bind options value
    this.container.register({
      token: "MY_SERVICE_OPTIONS",
      useValue: this.options,
    });

    // 2. Register service as a singleton
    this.container.register({
      token: MY_SERVICE,
      useFactory: (logger: ILogger) => new MyServiceImpl(this.options, logger),
      inject: [LOGGER],
      singleton: true,
    });
  }

  override async boot(): Promise<void> {
    // 3. Optional async initialization
    const service = await this.container.resolve<IMyService>(MY_SERVICE);
    await service.connect();
  }

  override async shutdown(): Promise<void> {
    // 4. Graceful cleanup on process termination
    const service = await this.container.resolve<IMyService>(MY_SERVICE);
    await service.disconnect();
  }
}
```

---

## 4. Registering console commands

If your package contributes CLI commands to the `veap` console, implement a
subclass of `Command` from `@veap/kernel/cli` and register it in the provider:

```ts
// src/commands/sync.command.ts
import { Command, type CommandInput, type Output } from "@veap/kernel/cli";

export class SyncCommand extends Command {
  static override signature = "myservice:sync {--force : Force sync execution}";
  static override description = "Synchronize domain records with remote API";

  override async handle(input: CommandInput, output: Output): Promise<number> {
    output.info("Starting synchronization...");

    const force = input.hasOption("force");
    output.success(`Sync completed successfully (force: ${force}).`);

    return 0; // Exit code 0 indicates success
  }
}
```

In your `ServiceProvider`, implement the `commands()` method:

```ts
// src/provider.ts
import { SyncCommand } from "./commands/sync.command.js";

export class MyServiceProvider extends ServiceProvider {
  // ...
  override commands() {
    return [SyncCommand];
  }
}
```

---

## 5. Exposing fluent builder methods (`composition.ts`)

To allow developers to configure your package fluently in `lib/veap.ts`:

```ts
// src/composition.ts
import { ApplicationBuilder } from "@veap/kernel";
import { MyServiceProvider, type MyServiceOptions } from "./provider.js";

declare module "@veap/kernel" {
  interface ApplicationBuilder {
    withMyService(options?: MyServiceOptions): this;
  }
}

ApplicationBuilder.prototype.withMyService = function (
  this: ApplicationBuilder,
  options?: MyServiceOptions,
): ApplicationBuilder {
  return this.use((c) => new MyServiceProvider(c, options));
};
```

Import `./composition.js` in your package's primary entry point (`src/index.ts`)
so the augmentation takes effect whenever the package is imported.

---

## 6. Checklist: creating a new package from scratch

Follow these steps when adding a new package to the monorepo:

1. **Scaffold directory:** Create `packages/<name>` with `src/`, `tests/`, and
   `tsconfig.json`.
2. **Define contracts:** In `src/contracts.ts`, define your service ports
   (interfaces) and token symbols before writing implementations.
3. **Implement service:** Write domain implementations adhering to ports.
4. **Create `ServiceProvider`:** Wire dependencies in `register()` and `boot()`.
5. **Configure `package.json`:**
   - Set `"version": "0.1.10"` matching existing feature packages.
   - Configure subpath `"exports"`.
   - Use `"dependencies": { "@veap/kernel": "^0.2.2" }`.
6. **Write unit and integration tests:** Verify service logic and container
   resolution using in-memory doubles.
7. **Register package documentation and metadata:**
   - Add package documentation in `docs/developer-docs/packages/<name>/` and
     register the page in `meta.json`.
   - Add an API reference page in `docs/developer-docs/reference/packages/<name>.md`.
   - Update `docs/developer-docs/source-map.json` and `apps/veap-docs/veap-registry.json`
     if applicable.
8. **Run verification checks:**
   - `bun run build` (all packages compile without errors)
   - `bun run check:write` (Biome formatting passes)
   - `bun run check:arch` (architectural boundary invariants hold)
   - `bun run check:types` (type-checking passes across workspaces)
   - `bun run test` (all test suites pass)
   - `bun run check:docs` (documentation links and navigation valid)
