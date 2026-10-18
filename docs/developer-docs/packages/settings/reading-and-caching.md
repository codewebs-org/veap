# Reading, writing, and caching settings

Resolve `SettingsService` from the IoC container to read, update, or remove persisted application settings.

## Using `SettingsService`

`SettingsService` serializes values as JSON in the `settings` database table and caches them under the `veap:settings:<key>` namespace in `CACHE_PROVIDER`:

```ts
import { app } from "@veap/kernel";
import { SettingsService } from "@veap/settings";

const settings = await app(SettingsService);

// Read a setting with a typed fallback default
const siteTitle = await settings.get<string>("site.title", "Veap App");
const maintenanceMode = await settings.get<boolean>("site.maintenance", false);

// Create or update a setting (automatically invalidates cache)
await settings.set("site.title", "Acme Developer Portal");

// Delete a setting key
await settings.remove("site.legacy_banner");
```

## Updating settings in a Server Action

Wrap `settings.set()` inside a Next.js Server Action using `@veap/kernel` `Result<T>` helpers so admin forms receive structured responses:

```ts
"use server";

import { app, handleActionError, ok } from "@veap/kernel";
import { SettingsService } from "@veap/settings";
import { initializeSystem } from "@/lib/veap";

export async function updateSiteTitleAction(title: string) {
  try {
    await initializeSystem();
    const settings = await app(SettingsService);
    await settings.set("site.title", title.trim());
    return ok({ title: title.trim() });
  } catch (e) {
    return handleActionError(e, "updateSiteTitleAction");
  }
}
```
