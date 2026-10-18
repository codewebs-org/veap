# Veap framework packages

The `packages/` directory contains the core framework packages, reusable ORM
traits, and official developer tooling of the Veap ecosystem.

These packages constitute the foundational runtime architecture of Veap. They
provide low-level infrastructure such as the Inversion of Control (IoC)
container, Active Record ORM, authentication and authorization, ports and
adapters, polymorphic database capabilities, and project scaffolding. Packages in
this directory are versioned and published to npm under the `@veap/*` scope (as
well as the `create-veap` CLI).

## Architectural role

The packages in this directory provide domain-agnostic infrastructure, whereas
the modular plugins in `plugins/` provide optional, application-level feature
modules.

Every framework capability is structured around modular service providers and
typed ports:

- **Service providers:** Packages export subclasses of `ServiceProvider` from
  `@veap/kernel`, which register singleton contracts in `register()` and run
  asynchronous startup logic in `boot()`.
- **Ports and adapters:** Core services expose abstract interfaces (such as
  `IMailer`, `IStorageProvider`, and `ICacheProvider`), decoupling domain logic
  from specific third-party libraries and enabling easy mocking in tests.
- **Fluent composition:** Packages extend `ApplicationBuilder` through
  TypeScript module augmentation (`composition.ts`), providing fluent methods
  such as `.withDatabase()`, `.withMail()`, and `.withSettings()` in the
  application composition root.

<!-- prettier-ignore -->
> [!NOTE]
> Core framework packages must remain decoupled from specific plugins. A package
> under `packages/` must never import code from `plugins/` or `apps/`.

## Layered architecture and invariants

Packages adhere to a strict unidirectional dependency graph. Lower-level
packages never depend on higher-level layers:

- **Layer 0 (Core Foundation):** `@veap/kernel` provides the IoC container,
  event dispatcher, logger, cache ports, HTTP abstractions, and the CLI engine.
  It has no internal dependencies.
- **Layer 1 (Infrastructure Ports):** `@veap/database`, `@veap/mail`,
  `@veap/storage`, and `@veap/intl` depend only on `@veap/kernel`.
- **Layer 2 (Persisted Services):** `@veap/settings` coordinates key-value
  configuration preferences using `@veap/kernel` and `@veap/database`.
- **Layer 3 (Authentication and Security):** `@veap/auth` manages user
  identities, password hashing, sessions, and role-based access control.
- **Layer 4 (Extensibility):** `@veap/plugins` manages plugin discovery,
  virtual route mounting, extension slots, and runtime toggles.
- **Layer 5 (Presentation and Traits):** `@veap/ui` provides shared React
  components, while polymorphic ORM traits (`@veap/translatable`,
  `@veap/taggable`, `@veap/categorizable`, `@veap/commentable`) provide vertical
  model capabilities.
- **Developer Tooling:** `create-veap` provides application scaffolding CLI
  workflows for initializing new Next.js and Veap projects.

## Package anatomy

Each package in this directory adheres to a consistent directory structure and
packaging standard:

```
packages/<name>/
├── src/
│   ├── index.ts        # Public API, contracts, tokens, and client-safe exports
│   ├── server.ts       # Server-only provider and implementation (optional)
│   ├── provider.ts     # ServiceProvider implementation
│   ├── contracts.ts    # Port interfaces and container tokens
│   └── composition.ts  # Module augmentation for ApplicationBuilder
├── tests/              # Unit and integration test suites
├── dist/               # Compiled ESM outputs and TypeScript declaration files
├── package.json        # Package manifest with subpath exports and dependencies
└── tsconfig.json       # Strict TypeScript configuration
```

### Packaging rules

All packages must follow these repository invariants:

1. **Pure ESM:** Packages target ECMAScript Modules (`"type": "module"`).
2. **Explicit `.js` extensions:** All internal relative imports within `src/`
   must include the explicit `.js` extension to comply with native Node.js ESM
   resolution.
3. **Exact semver dependencies:** Dependencies on other internal `@veap/*`
   packages must use exact version numbers matching the workspace rather than
   `workspace:*` ranges.

## Development and build commands

You can build and test packages individually or across the entire workspace.

To compile all framework packages:

```bash
bun run build:packages
```

To compile a single package:

```bash
bun --filter '@veap/kernel' build
```

To run test suites for all packages:

```bash
bun run test
```

To verify architectural boundary invariants across all packages:

```bash
bun run check:arch
```

## Related documentation

For detailed guides on creating, publishing, and maintaining framework packages:

- [Authoring Packages Maintainer Notes](../docs/maintainer-notes/authoring-packages.md)
- [Architecture & Ecosystem Design](../docs/maintainer-notes/architecture.md)
- [Testing & QA Runbook](../docs/maintainer-notes/testing-and-qa.md)
- [Release and Versioning Runbook](../docs/maintainer-notes/release-and-versioning.md)
