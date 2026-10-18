# Veap applications

The `apps/` directory contains deployable applications, reference implementations,
and web portals for the Veap ecosystem.

These applications demonstrate how the modular components of Veap—such as the
IoC container, Active Record ORM, authentication system, polymorphic traits, and
modular plugins—assemble within Next.js App Router environments.

## Architectural role

Applications in this directory represent complete, deployable software systems.
They fulfill key functions across the monorepo:

- **Integration targets and benchmarks:** Applications serve as automated and
  manual integration environments, ensuring that changes to framework packages
  and plugins function reliably in realistic runtime conditions.
- **Reference architectures:** Each application provides concrete patterns for
  structuring the composition root (`lib/veap.ts`), executing database migrations,
  validating Server Actions, and mounting dynamic UI widgets.
- **Production web portals:** Applications provide public interfaces,
  documentation sites, and administrative shells built on top of the framework.

<!-- prettier-ignore -->
> [!NOTE]
> Applications may depend on core packages (`packages/*`) and modular plugins
> (`plugins/*`), but framework packages and plugins must never import code from
> `apps/`.

## Application anatomy

Applications built on Veap follow standard Next.js conventions while integrating
the framework lifecycle:

```
apps/<name>/
├── app/                # Next.js App Router layouts, pages, and route handlers
├── lib/
│   └── veap.ts         # Central composition root and service provider wiring
├── public/             # Static web assets
├── package.json        # Workspace manifest and dependencies
├── next.config.ts      # Next.js configuration
└── tsconfig.json       # TypeScript configuration
```

### The composition root

Every application defines an entry point (conventionally `lib/veap.ts`) that
configures the `Application` builder:

```ts
import { Application } from "@veap/kernel";
import { DatabaseServiceProvider } from "@veap/database";
import { AuthServiceProvider } from "@veap/auth";

export const app = Application.configure()
  .use(DatabaseServiceProvider)
  .use(AuthServiceProvider)
  .create();

export async function initializeSystem() {
  await app.bootstrap();
  return app;
}
```

## Development commands

You can run, build, and test applications using Bun workspace filters from the
monorepo root.

To start an application in development mode:

```bash
bun --filter '<app-name>' dev
```

To create an optimized production build:

```bash
bun --filter '<app-name>' build
```

To run an application in production mode:

```bash
bun --filter '<app-name>' start
```

## Related documentation

For more details on monorepo architecture and runtime boundaries:

- [Architecture & Ecosystem Design](../docs/maintainer-notes/architecture.md)
- [Public Developer Documentation](https://veap.pl/docs)
