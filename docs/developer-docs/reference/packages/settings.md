# `@veap/settings` API reference

`@veap/settings` manages database-persisted key-value application settings (`Setting` model) backed by `@veap/kernel`'s `CACHE_PROVIDER` for low-latency reads and automatic cache invalidation on writes.

## Subpath exports

`@veap/settings` exposes four entry points in `package.json`:

| Subpath | Description |
| :--- | :--- |
| `@veap/settings` | `SettingsService`, `SettingsServiceProvider`, `SETTINGS_REPOSITORY`, and `ISettingsRepository`. |
| `@veap/settings/server` | Server-only barrel re-exporting `SettingsService`, `SettingsServiceProvider`, and repository interfaces. |
| `@veap/settings/models` | Active Record `Setting` model (`settings` table). |
| `@veap/settings/migrations` | Knex migrations (`settingsMigrations`) for the `settings` table. |

## `SettingsService` API

Resolve `SettingsService` from the container (`await app(SettingsService)`) to read and mutate runtime settings:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `get` | `get<T = any>(key: string, defaultValue?: T): Promise<T>` | Reads a setting from cache or database, returning `defaultValue` if the key does not exist. |
| `set` | `set<T = any>(key: string, value: T, group?: string): Promise<void>` | Inserts or updates a setting in the database and invalidates its cached entry. |
| `remove` | `remove(key: string): Promise<void>` | Deletes a setting key from the database and removes its cached entry. |
| `getGroup` | `getGroup(group: string): Promise<Record<string, any>>` | Returns all key-value pairs belonging to the specified settings group. |
| `all` | `all(): Promise<Record<string, any>>` | Returns all persisted settings as a key-value record. |
