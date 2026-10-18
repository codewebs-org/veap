# Agent notes for the Veap monorepo

This file is a guide for coding agents (and human contributors) working across the Veap monorepo. It is intentionally concise and operational.

## Repo layout

- `apps/` — Applications. Key apps include `01-base`, `03-rest-api`, `04-blog`, `05_fullstack` (example apps), and `veap-docs` (the documentation website).
- `packages/` — Shared framework packages, including `kernel`, `database`, `auth`, `plugins`, `intl`, `mail`, `settings`, `storage`, `ui`, `create-veap`, and ORM traits.
- `plugins/` — Veap plugins and modular traits such as `blog-plugin`, `action-confirm-plugin`, `installer-plugin`, `media-plugin`, `panel-plugin`.
- `templates/` — Scaffold templates used by `create-veap`.
- `docs/` — Documentation sources:
  - `docs/developer-docs/` — Public user and developer guides, tutorials, and API references (rendered at [veap.pl/docs](https://veap.pl/docs)).
  - `docs/maintainer-notes/` — Technical architecture, package authoring guidelines, and CI/CD release runbooks.

## Architecture and authoring guides

Before adding or refactoring packages, consult the maintainer notes:

- [**Architecture & Ecosystem Design**](docs/maintainer-notes/architecture.md) — Dependency graph rules, IoC container contracts, ports and adapters, and Next.js boundaries.
- [**Authoring Packages**](docs/maintainer-notes/authoring-packages.md) — Step-by-step instructions for creating `@veap/*` packages, writing `ServiceProvider` classes, registering tokens, and exporting subpaths.
- [**Release, Versioning, and CI/CD**](docs/maintainer-notes/release-and-versioning.md) — Changesets, npm publication ordering, and the GitHub Actions release workflow.
- [**Testing & QA Runbook**](docs/maintainer-notes/testing-and-qa.md) — Container test isolation, database connection teardown, CLI command testing, and verification suites.
- [**Templates & Scaffolding**](docs/maintainer-notes/templates-and-scaffolding.md) — `create-veap` template compilation, version synchronization, and local testing.
- [**Plugins & Modular Traits**](docs/maintainer-notes/plugins-and-traits.md) — `IPlugin` contract, registry persistence, virtual routing, and polymorphic ORM traits.

## Keeping the repo consistent

- Run `bun install` after pulling new changes or modifying dependencies.
- Run `bun run check:write` to format the entire workspace with Biome before committing.
- Run `bun run check:arch` to verify package architectural boundaries and invariants.
- Run `bun run check:types` to type-check without emitting files (`tsc --noEmit`).
- Run `bun run test` to run the workspace tests.
- Run `bun run build` if you need compiled outputs.

## Documentation checks and metadata

Markdown files under `docs/developer-docs/` have automated consistency checks:

- Broken relative links and anchor fragments are detected by `docs/scripts/check-docs.mjs`.
- Navigation metadata lives in `meta.json` files next to the Markdown, and the same script validates that every listed page exists.
- Run the validator from the repository root:
  ```bash
  node docs/scripts/check-docs.mjs
  ```

## Changes and versioning

This repository uses [Changesets](https://github.com/changesets/changesets) for semver versioning and changelogs:

- Run `bun run changeset` to create a new changeset file when modifying public package APIs.
- Run `bun run version-packages` to apply pending changesets to package manifests.
- Note: Published package dependencies must never use `workspace:*` ranges; they must specify exact semver versions matching the workspace (for example `"0.1.7"`).

## Scaffolding

New Veap applications are scaffolded with `create-veap`. The package source lives in `packages/create-veap`, and its templates live in `packages/create-veap/templates`. If you modify scaffolding behavior, update both the source and the templates, and ensure `bun run test` in `packages/create-veap` passes.

## Conventions for agents

- The repository targets Node >= 24 and uses Bun as the package manager.
- Formatting is handled by Biome; the configuration is at the repository root (`biome.json`).
- Commit messages should be concise and descriptive; prefer describing the "why" over the "what" where possible.
- In documentation, write in standard US English, present tense, and active voice. Avoid Latin abbreviations (use "for example" instead of "e.g.", and "that is" instead of "i.e."). Use sentence case for headings.
- Format GitHub markdown alerts with `<!-- prettier-ignore -->` directly before the callout block:
  ```markdown
  <!-- prettier-ignore -->
  > [!NOTE]
  > Alert content...
  ```
- When in doubt, keep changes minimal, well-tested, and focused on one task.

## If something fails

- If a command complains about missing types or packages, try `bun install` first.
- If a command complains about missing types or build artifacts, run `bun run build:packages` to emit declaration files.
- If documentation checks fail after moving files, update the relative links and the corresponding `meta.json` navigation file.
- When a change touches multiple areas, run the checks in order: format (`check:write`), architecture (`check:arch`), typecheck (`check:types`), tests (`test`), then documentation checks (`check:docs`).
