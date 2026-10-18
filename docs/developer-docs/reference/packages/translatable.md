# `@veap/translatable` API reference

`@veap/translatable` provides polymorphic multilingual translation storage for
`@veap/database` Active Record models. All translated attributes across your
application share a single centralized `translations` table using `morphMany`
relations.

## Subpath exports

`@veap/translatable` exposes three entry points in `package.json`:

| Subpath | Description |
| :--- | :--- |
| `@veap/translatable` | Core model classes (`TranslatableModel`), mixin (`Translatable`), query builder (`TranslatableQueryBuilder`), and locale manager. |
| `@veap/translatable/migrations` | Knex migration defining the polymorphic `translations` table. |
| `@veap/translatable/ui` | React UI components (`TranslatableTabs`, `TranslatableField`, `TranslatableFormCard`) for multilingual forms. |

## Core APIs and classes

The table below summarizes the primary classes, mixins, and utilities exported
by `@veap/translatable`:

| Symbol | Kind | Signature / Props | Description |
| :--- | :--- | :--- | :--- |
| `Translatable` | Function | `Translatable<T extends Constructor<Model>>(Base: T)` | Class mixin adding multilingual attributes and query scopes to any model. |
| `TranslatableModel` | Class | `class TranslatableModel extends Model` | Base Active Record class with built-in polymorphic translation support. |
| `Translation` | Class | `class Translation extends Model` | Morph target model mapping to the `translations` table. |
| `TranslatableQueryBuilder` | Class | `class TranslatableQueryBuilder extends QueryBuilder` | Extends query builder with translation scopes and locale filters. |
| `getLocale` | Function | `getLocale(): string` | Returns the active application locale for translation resolution. |
| `setLocale` | Function | `setLocale(locale: string): void` | Sets the global fallback locale for translatable models. |

## Model instance methods

Models that extend `TranslatableModel` or use `Translatable(Base)` expose the
following methods on each instance:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `getTranslation` | `getTranslation(key: string, locale?: string, useFallback?: boolean): string \| null` | Resolves the translated value for a field, falling back to default locale if needed. |
| `setTranslation` | `setTranslation(key: string, locale: string, value: string \| null): this` | Stages a translation for a specific locale in memory. |
| `fillTranslations` | `fillTranslations(data: Record<string, Record<string, string \| null>>): this` | Stages multi-attribute translations across multiple locales simultaneously. |
| `getTranslations` | `getTranslations(key?: string): Record<string, any>` | Returns all loaded translations indexed by locale. |
| `hasTranslation` | `hasTranslation(key: string, locale?: string): boolean` | Checks whether a translation exists for the given attribute and locale. |
| `forgetTranslation` | `forgetTranslation(key: string, locale?: string): this` | Marks a translation for deletion upon next `save()`. |

## Query builder scopes

`TranslatableQueryBuilder` extends database queries with translation-aware
filtering and preloading:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `whereTranslation` | `whereTranslation(key: string, value: any, locale?: string): this` | Filters records where a translated attribute equals the specified value. |
| `whereTranslationLike` | `whereTranslationLike(key: string, pattern: string, locale?: string): this` | Filters records using a SQL `LIKE` expression against a translated attribute. |
| `orderByTranslation` | `orderByTranslation(key: string, direction?: "asc" \| "desc", locale?: string): this` | Joins the translation table and sorts records by localized field values. |
| `withTranslations` | `withTranslations(locales?: string[]): this` | Eager-loads translations into the in-memory cache to prevent N+1 queries. |

## Multilingual UI components (`@veap/translatable/ui`)

`@veap/translatable/ui` provides client-side React components for managing multilingual input forms:

| Component | Props | Description |
| :--- | :--- | :--- |
| `TranslatableTabs` | `TranslatableTabsProps` | Tab bar switching the active editing locale with visual flags and completion indicators. |
| `TranslatableField` | `TranslatableFieldProps` | Single localized field supporting text, textarea, or rich text with locale switching. |
| `TranslatableFormCard` | `TranslatableFormCardProps` | Complete form card managing a set of localized fields across multiple languages. |

