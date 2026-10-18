# Application settings (`@veap/settings`)

`@veap/settings` persists runtime-editable key-value settings in a `settings` database table (`Setting` model) while caching reads automatically through `@veap/kernel`'s `CACHE_PROVIDER`.

## Registering `SettingsServiceProvider`

Install `@veap/settings` alongside `@veap/database`, then register `SettingsServiceProvider` in your `lib/veap.ts` composition root:

```ts
// lib/veap.ts
import { DatabaseServiceProvider } from "@veap/database";
import { Application } from "@veap/kernel";
import { SettingsServiceProvider } from "@veap/settings";

export const app = Application.configure()
  .use(DatabaseServiceProvider)
  .use(SettingsServiceProvider)
  .create();
```

When `SettingsServiceProvider.boot()` runs, it automatically applies the `settings` table migration unless `autoMigrate: false` is passed.

## Next steps

Continue exploring `@veap/settings`:

- [Reading, writing, and caching settings](./reading-and-caching.md) — Use `SettingsService` to read typed settings with defaults, update values, and invalidate cached entries.
