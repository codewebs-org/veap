[![CI](https://github.com/veapjs/veap-settings/actions/workflows/CI.yml/badge.svg)](https://github.com/veapjs/veap-settings/actions/workflows/CI.yml)
[![Release](https://github.com/veapjs/veap-settings/actions/workflows/RELEASE.yml/badge.svg)](https://github.com/veapjs/veap-settings/actions/workflows/RELEASE.yml)
[![Version](https://img.shields.io/npm/v/@veap%2Fsettings?style=flat-square&color=181717&logo=npm&logoColor=959da5)](https://www.npmjs.com/package/@veap/settings)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?style=flat-square&logo=discord&logoColor=959da5)](https://discord.gg/qTkrCwpMW)

# @veap/settings

Key-value application settings management, caching, and persistence engine
for Veap applications.

## Overview

`@veap/settings` provides a dynamic configuration and settings system for
applications needing runtime-tunable options (site title, maintenance mode,
features flags, integrations). It bridges database persistence powered by
`@veap/database` with in-memory caching to minimize database query overhead.

## Features

- **Typed key-value storage**: Store strings, numbers, booleans, and complex
  JSON structures under unique keys.
- **In-memory cache layer**: Fast cached reads with automated cache
  invalidation on update or delete operations.
- **Active Record persistence**: Backed by the `Setting` model with automatic
  schema migrations.
- **Clean Architecture & IoC**: Follows repository pattern with
  `SETTINGS_REPOSITORY` and integrates cleanly via `SettingsServiceProvider`.
- **Default values & fallback**: Specify fallback values when keys have not yet
  been configured in the database.

## Installation

```bash
# Using bun
bun add @veap/settings @veap/kernel @veap/database

# Using pnpm
pnpm add @veap/settings @veap/kernel @veap/database

# Using npm
npm install @veap/settings @veap/kernel @veap/database
```

## Usage

### Register in Application Builder

Include `SettingsServiceProvider` in your application composition root:

```ts
import { Application } from "@veap/kernel";
import { DatabaseServiceProvider } from "@veap/database";
import { SettingsServiceProvider } from "@veap/settings";

export const app = Application.configure()
  .use(DatabaseServiceProvider)
  .use(
    (c) =>
      new SettingsServiceProvider(c, {
        autoMigrate: true, // Automatically applies settings table migrations
      }),
  )
  .create();
```

### Accessing Settings via IoC

Resolve `SettingsService` from the container in your services or server actions:

```ts
import { app } from "@veap/kernel";
import { SettingsService } from "@veap/settings";

// Read a setting with a typed fallback
const settings = await app(SettingsService);
const siteName = await settings.get("site.name", "Default Site Name");
const maintenance = await settings.get<boolean>("system.maintenance", false);

// Save or update a setting
await settings.set("site.name", "My Enterprise Portal");
await settings.set("features.comments_enabled", true);

// Remove a setting
await settings.remove("obsolete_key");
```

### Direct Model Access

Interact directly with the Active Record model from `@veap/settings/models`:

```ts
import { Setting } from "@veap/settings/models";

// Query all public settings
const allSettings = await Setting.query().orderBy("key", "asc").get();
```

## Subpath Exports

| Export Path                 | Content                                                                 |
| --------------------------- | ----------------------------------------------------------------------- |
| `@veap/settings`            | `SettingsService`, `SettingsServiceProvider`, and repository interfaces |
| `@veap/settings/server`     | Server-side entry point re-exporting core settings APIs                 |
| `@veap/settings/models`     | Active Record `Setting` model                                           |
| `@veap/settings/migrations` | Knex migrations for the settings schema (`settingsMigrations`)          |

## Documentation

For full guides and settings caching options, visit:

- **Official Website**: [https://veap.pl](https://veap.pl)
- **Documentation**: [https://veap.pl/docs](https://veap.pl/docs)
- **GitHub Repository**: [https://github.com/veapjs/veap-settings](https://github.com/veapjs/veap-settings)

## License

MIT
