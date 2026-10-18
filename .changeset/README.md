# Changesets

This directory contains changeset files generated before releasing new library versions across this monorepo.

## How to add a changeset

When introducing changes to packages in `packages/*` (or any publishable workspace), run:

```bash
bun run changeset
```

The interactive CLI will guide you through:
1. Selecting the modified package(s).
2. Choosing the appropriate semver bump type (`patch`, `minor`, `major`).
3. Writing a concise summary of the changes for the changelog.

Commit the generated Markdown file in `.changeset/` and include it in your Pull Request.

## Automated Versioning and Publishing

In the GitHub Actions CI/CD workflow:
- PRs containing changesets are merged into the `main` branch.
- The Changesets GitHub Action automatically creates or updates a **"chore: version packages"** Pull Request that bumps version numbers in `package.json` and updates `CHANGELOG.md`.
- When the **"chore: version packages"** PR is merged into `main`, packages are built and published to the npm registry.
