# Veap documentation

This repository is the **documentation content source** for the Veap package ecosystem.

The documentation is organized into two primary tracks:
1. **Developer documentation (`developer-docs/`):** The public documentation published on [veap.pl/docs](https://veap.pl/docs), guiding developers through onboarding, architecture fundamentals, practical feature guides, advanced patterns, and comprehensive package API references.
2. **Maintainer notes (`maintainer-notes/`):** Internal architectural documentation, authoring runbooks, and release engineering guidelines for contributors extending the Veap monorepo or creating new ecosystem packages.

## Developer documentation sections

The public documentation under `developer-docs/` follows a clear user journey:

| Section | Location | Purpose |
|---|---|---|
| **Getting Started** | `developer-docs/getting-started/` | Installation, first application setup, project layout, and Next.js integration boundaries. |
| **Fundamentals** | `developer-docs/fundamentals/` | `@veap/kernel` core: application lifecycle, dependency injection (IoC), service providers, configuration, event bus, error handling, and console CLI (`@veap/kernel/cli`). |
| **Packages (`@veap/*`)** | `developer-docs/packages/` | Dedicated guides for each ecosystem package (`database`, `orm-traits`, `auth`, `plugins`, `intl`, `mail`, `settings`, `storage`, `ui`, `create-veap`). |
| **Guides** | `developer-docs/guides/` | Cross-cutting engineering guides (testing, custom plugin authoring & ejection, production deployment, background jobs & cache, troubleshooting). |
| **Tutorials** | `developer-docs/tutorials/` | Step-by-step guides building complete end-to-end applications (such as a full-stack multilingual blog CMS). |
| **API Reference** | `developer-docs/reference/` | Complete TypeScript signatures, subpath exports, and CLI reference tables for all ecosystem packages. |

### Quick links for developers

- [Start learning Veap](developer-docs/index.md)
- [Installation and scaffolding](developer-docs/getting-started/installation.md)
- [Your first application](developer-docs/getting-started/first-application.md)
- [Next.js integration](developer-docs/getting-started/nextjs-integration.md)
- [Project structure and configuration](developer-docs/getting-started/project-structure.md)

## Maintainer notes and ecosystem authoring

If you are developing new `@veap/*` framework packages, contributing official plugins, or managing releases across the monorepo, refer to the maintainer documentation in `maintainer-notes/`:

| Guide | Location | Purpose |
|---|---|---|
| **Maintainer Overview** | [`maintainer-notes/README.md`](maintainer-notes/README.md) | Invariants, contribution rules, and index of maintainer resources. |
| **Architecture & Ecosystem** | [`maintainer-notes/architecture.md`](maintainer-notes/architecture.md) | Hexagonal architecture, ports and adapters, IoC contracts, and Next.js hydration boundaries. |
| **Authoring Packages** | [`maintainer-notes/authoring-packages.md`](maintainer-notes/authoring-packages.md) | Creating new packages, implementing `ServiceProvider` classes, registering tokens, exporting subpaths, and CLI commands. |
| **Release & Versioning** | [`maintainer-notes/release-and-versioning.md`](maintainer-notes/release-and-versioning.md) | Changesets workflow, version synchronization, npm publishing order, and the automated GitHub Actions release pipeline. |
| **Testing & QA Runbook** | [`maintainer-notes/testing-and-qa.md`](maintainer-notes/testing-and-qa.md) | Container isolation, database connection teardown, CLI command testing, and verification suites. |
| **Templates & Scaffolding** | [`maintainer-notes/templates-and-scaffolding.md`](maintainer-notes/templates-and-scaffolding.md) | Scaffolding architecture, template compilation lifecycle, version injection, and local testing. |
| **Plugins & Modular Traits** | [`maintainer-notes/plugins-and-traits.md`](maintainer-notes/plugins-and-traits.md) | IPlugin contract, registry persistence, virtual routing, and polymorphic ORM traits. |

## Documentation validation and automation

Markdown files in `docs/developer-docs/` are continuously verified by automated scripts:

- **Link and navigation validation:** Checks all relative links, anchor
  fragments, and `meta.json` navigation entries:
  ```bash
  bun run check:docs
  ```
- **Architectural boundary verification:** Validates unidirectional package
  dependencies and boundary invariants across the monorepo:
  ```bash
  bun run check:arch
  ```
- **Formatting and linting:** Formats all documentation and code samples using Biome:
  ```bash
  bun run check:write
  ```

Always run these validation checks before committing changes to documentation or navigation metadata.
