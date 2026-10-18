# Scaffolding and Templates Maintenance

This guide explains the architecture, compilation lifecycle, template synchronization, and local testing workflows for `create-veap` (`packages/create-veap`).

`create-veap` is the official CLI tool that developers use to initialize new Veap applications. Maintainers must ensure that template source files, packaging artifacts, and package version dependencies remain synchronized across monorepo releases.

## Repository layout and sources of truth

The scaffolding system spans two distinct directories in the monorepo:

1. **Root `templates/` (Canonical Source):** The primary source of truth for starter templates (for example, `templates/01-basic`). Maintainers edit starter files, configurations, and dependencies directly in this directory.
2. **`packages/create-veap/templates/` (Build Artifacts):** The packaged templates directory bundled into the published npm distribution. **Never edit files in this directory manually**, as they are overwritten during compilation.

```
veap-repo/
├── templates/                     # <-- EDIT HERE (Source templates)
│   └── 01-basic/
│       ├── app/
│       ├── lib/
│       ├── package.json
│       └── .gitignore
└── packages/
    └── create-veap/
        ├── cli.js                 # Executable entry point
        ├── src/                   # CLI source (TypeScript)
        └── templates/             # <-- GENERATED (Bundled into npm package)
            └── 01-basic/
                └── gitignore      # Renamed for npm publishing
```

## Compilation lifecycle

Publishing templates to the npm registry requires special handling because the npm CLI automatically strips `.gitignore` files during `npm pack` and `npm publish`.

`packages/create-veap/package.json` defines a multi-stage `compile` script:

```bash
bun run compile
```

The compilation lifecycle executes the following steps:

1. **Clean build artifacts:** Deletes `packages/create-veap/dist` and `packages/create-veap/templates`.
2. **Copy root templates:** Copies `../../templates` into `packages/create-veap/templates`.
3. **Prune ephemeral files:** Removes `node_modules`, `.next`, `.cache`, and `*.tsbuildinfo` from copied templates.
4. **Rename `.gitignore` to `gitignore`:** Renames `.gitignore` to `gitignore` in every copied template to prevent npm from omitting it during package publication.
5. **Compile TypeScript:** Runs `tsc` to produce compiled JavaScript in `packages/create-veap/dist`.

<!-- prettier-ignore -->
> [!IMPORTANT]
> Whenever you modify files in `templates/` or change CLI logic in `packages/create-veap/src/`, always run `bun run compile` in `packages/create-veap` before committing or releasing.

## Scaffolding execution workflow

When a developer runs `bun create veap my-app` or `npx create-veap my-app`:

1. **Argument parsing:** Resolves target project directory, template name (`--template`), GitHub example (`--example`), and options (`--choose`, `--skip-install`).
2. **Template selection:** Reads directory names from the bundled `templates/` folder (default: `01-basic`).
3. **Template installation:** Copies the selected template directory to the target path using `fs-extra`.
4. **Manifest rewrite:** Reads `package.json` in the target directory and overwrites `name` with the project name and sets `version` to `"0.0.0"`.
5. **Gitignore restoration:** Renames `gitignore` back to `.gitignore` so the scaffolded project has immediate version control ignores.
6. **Package manager detection:** Inspects `process.versions.bun` and `npm_config_user_agent` to detect whether the user is executing under Bun, pnpm, Yarn, or npm.
7. **Dependency installation:** Spawns `<package-manager> install` unless `--skip-install` is specified.

## Package version synchronization rules

When framework packages (`@veap/kernel`, `@veap/database`, `@veap/auth`, etc.) receive a new release, maintainers must update the dependency versions in `templates/01-basic/package.json`:

```json
{
  "dependencies": {
    "@veap/kernel": "^0.2.2",
    "next": "16.4.0",
    "react": "19.3.0",
    "react-dom": "19.3.0"
  }
}
```

<!-- prettier-ignore -->
> [!WARNING]
> If package versions in `templates/01-basic/package.json` are not updated after a major or minor framework release, users who scaffold new projects will receive outdated dependencies or mismatched peer dependencies.

## Local verification and testing

Maintainers should verify `create-veap` both with automated test suites and through local manual scaffolding.

### 1. Automated test suite

Run the test suite from within `packages/create-veap`:

```bash
cd packages/create-veap
bun run test
```

The test suite runs Vitest with `npm_config_user_agent=bun` and verifies:
- Template discovery and directory parsing.
- Argument handling and prompt resolution.
- Manifest rewriting and gitignore renaming.

### 2. Manual local test run

To test the CLI locally without publishing to npm:

```bash
# 1. Compile the package and templates
cd packages/create-veap
bun run compile

# 2. Run the CLI against a scratch directory
node ./cli.js /tmp/veap-test-app --template 01-basic --skip-install

# 3. Verify generated project structure
ls -la /tmp/veap-test-app
cat /tmp/veap-test-app/package.json

# 4. Clean up
rm -rf /tmp/veap-test-app
```
