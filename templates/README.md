# Veap starter templates

The `templates/` directory contains the canonical source files for project
starter templates consumed by the `create-veap` scaffolding tool.

When developers run `bun create veap my-app` (or `npx create-veap my-app`), the
scaffolding CLI copies one of these templates into the target application
directory, configures the project manifest, and installs workspace dependencies.

## Architecture and source of truth

The repository maintains a strict separation between the editable starter sources
and the compiled scaffolding artifacts:

- **Canonical source (`templates/`):** Maintainers edit starter files,
  configurations, and framework dependencies directly in this directory.
- **Packaged distribution (`packages/create-veap/templates/`):** A generated
  directory bundled into the published npm package. Files in that directory must
  never be edited manually, as they are overwritten during compilation.

<!-- prettier-ignore -->
> [!IMPORTANT]
> Whenever you modify starter files in `templates/`, you must recompile the
> scaffolding package by running `bun run compile` in `packages/create-veap`.

## Compilation lifecycle

Publishing starter templates to the npm registry requires an automated
transformation pipeline because npm CLI tools strip `.gitignore` files during
packaging.

The compilation process in `packages/create-veap` performs these steps:

1. **Clean build artifacts:** Deletes previous `dist/` and `templates/` folders
   inside `packages/create-veap`.
2. **Copy canonical templates:** Synchronizes `templates/` into
   `packages/create-veap/templates/`.
3. **Prune ephemeral files:** Removes `node_modules`, `.next`, cache files, and
   TypeScript build info artifacts.
4. **Rename `.gitignore` to `gitignore`:** Preserves Git ignore rules so npm
   does not strip them during publication. The CLI restores them to `.gitignore`
   during project creation.
5. **Compile CLI binaries:** Builds the TypeScript source into JavaScript entry
   points.

## Available templates

The directory includes the following starter templates:

- **`01-basic`:** A clean starter application configured with Next.js App
  Router, React 19, Tailwind CSS, and the Veap composition root
  (`lib/veap.ts`). It provides an empty foundation for custom application
  development.
- **`02-hono`:** A lightweight API and microservice starter combining Hono HTTP
  routing with `@veap/kernel` IoC dependency injection, service providers,
  and request context adapters.

## Dependency synchronization

Maintainers must keep dependencies in `templates/*/package.json` aligned with
the latest framework releases.

When `@veap/kernel` or other framework packages are versioned and released,
update the corresponding version ranges in `templates/01-basic/package.json` to
prevent new users from installing incompatible packages.

## Local testing

You can verify template changes locally before releasing new versions of
`create-veap`.

To compile the scaffolding package and test project creation:

```bash
# 1. Compile templates and CLI binary
cd packages/create-veap
bun run compile

# 2. Test scaffolding into a temporary path
node ./cli.js /tmp/veap-test-app --template 01-basic --skip-install

# 3. Clean up the test directory
rm -rf /tmp/veap-test-app
```

## Related documentation

For more details on scaffolding architecture and test runbooks:

- [Templates & Scaffolding Maintainer Notes](../docs/maintainer-notes/templates-and-scaffolding.md)
- [Release and Versioning Runbook](../docs/maintainer-notes/release-and-versioning.md)
