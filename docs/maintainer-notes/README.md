# Veap Maintainer and Author Documentation

This directory contains technical architecture documentation, design guidelines,
and operational runbooks for core contributors, package authors, and maintainers
extending the Veap ecosystem.

If you are building applications *using* Veap, refer to the user-facing
documentation in [`../developer-docs/`](../developer-docs/). If you are
developing new `@veap/*` packages, writing official plugins, maintaining the
monorepo, or executing releases, start here.

---

## Documentation index

The maintainer documentation is split into six operational guides:

| Guide | Purpose |
|---|---|
| [**Architecture and Ecosystem Design**](./architecture.md) | Monorepo structure, package layers, IoC contracts, ports and adapters, and module augmentation. |
| [**Authoring Packages**](./authoring-packages.md) | Step-by-step guide to creating new `@veap/*` packages, writing ServiceProviders, exporting subpaths, and registering CLI commands. |
| [**Release, Versioning, and CI/CD**](./release-and-versioning.md) | Versioning with Changesets, dependency alignment rules, the automated `.github/workflows/release.yml` pipeline, and npm release order. |
| [**Testing and QA Runbook**](./testing-and-qa.md) | Container isolation, database connection pool teardown, CLI command testing, and pre-release verification. |
| [**Templates and Scaffolding**](./templates-and-scaffolding.md) | Maintenance of create-veap, template compilation lifecycle, version injection, and local scaffolding verification. |
| [**Plugins and Modular Traits**](./plugins-and-traits.md) | IPlugin contract, registry persistence, virtual routing, and polymorphic ORM trait architecture. |

---

## Core Invariants for Maintainers

Every contributor working on the monorepo must observe these invariants:

1. **Kernel has zero framework dependencies:** `@veap/kernel` defines the
   foundation (IoC container, event bus, cache port, configuration schema,
   logging, and HTTP contracts). It must never depend on database drivers, ORM
   code, authentication, or Next.js internals.
2. **Strict unidirectional dependency graph:** Packages sit in well-defined
   layers. Lower layers never import from higher layers. Cyclic dependencies are
   strictly forbidden and break the release pipeline.
3. **Ports and Adapters (Hexagonal Architecture):** Packages define interfaces
   (ports) for external infrastructure (database, mail, file storage, cache).
   Default adapters are decoupled and swappable in test environments.
4. **No `workspace:*` ranges in published package dependencies:** Packages
   under `packages/` that are published to the npm registry must specify exact
   versions or semver ranges matching the workspace version (for example `"0.1.7"`),
   never `workspace:*`.
5. **Private packages remain private:** Packages or plugins with `"private": true`
   are ignored by the release pipeline and must never be pushed to npm.
6. **Ecosystem registry synchrony:** When modifying package manifests, entry
   points, or dependencies, always update `veap-registry.json` and regenerate
   `apps/veap-docs/lib/ecosystem.generated.json` using
   `node apps/veap-docs/scripts/generate-ecosystem.mjs`.
