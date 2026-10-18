# `@veap/taggable` API reference

`@veap/taggable` provides polymorphic tagging for `@veap/database` Active Record
models. It includes a multilingual `Tag` model backed by `@veap/translatable`,
a pivot relationship (`taggables`), querying scopes, factories, seeders, and
ready-to-use UI badge components.

## Subpath exports

`@veap/taggable` exposes four entry points in `package.json`:

| Subpath | Description |
| :--- | :--- |
| `@veap/taggable` | Core mixin (`Taggable`), base model (`TaggableModel`), `Tag` entity, and query builder (`TaggableQueryBuilder`). |
| `@veap/taggable/migrations` | Knex migrations creating the `tags` table and `taggables` polymorphic pivot table. |
| `@veap/taggable/ui` | React UI badge and selector components (`TagBadge`, `TagInput`) for forms and display. |
| `@veap/taggable/testing` | Test utilities, model factory (`TagFactory`), and seeder (`TagSeeder`) for testing environments. |

## Core APIs and classes

The table below summarizes the primary classes, mixins, and utilities exported
by `@veap/taggable`:

| Symbol | Kind | Signature / Props | Description |
| :--- | :--- | :--- | :--- |
| `Taggable` | Function | `Taggable<T extends Constructor<Model>>(Base: T)` | Class mixin adding tag relationships and management methods to any model. |
| `TaggableModel` | Class | `class TaggableModel extends Model` | Base Active Record class with built-in polymorphic tagging capabilities. |
| `Tag` | Class | `class Tag extends TranslatableModel` | Multilingual tag entity storing localized name, slug, and description. |
| `TaggableQueryBuilder` | Class | `class TaggableQueryBuilder extends ModelQueryBuilder` | Extends query builder with tag-filtering scopes (`whereTag`, `whereAnyTag`, `whereAllTags`). |
| `TagFactory` | Class | `defineFactory(Tag, ...)` | Model factory for generating realistic fake tag data in tests (exported from `@veap/taggable/testing`). |
| `TagSeeder` | Class | `class TagSeeder extends Seeder` | Database seeder populating standard application tags (exported from `@veap/taggable/testing`). |

## Model instance methods

Models that extend `TaggableModel` or use `Taggable(Base)` expose the following
tagging methods on each instance:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `tags` | `tags(): MorphToMany<any, Tag>` | Defines the polymorphic many-to-many relationship to the `tags` table through `taggables`. |
| `attachTags` | `attachTags(tags: (string \| Tag)[] \| string \| Tag, locale?: string): Promise<this>` | Attaches tags by ID, name (finding or creating automatically), or model instance. |
| `detachTags` | `detachTags(tags?: (string \| Tag)[] \| string \| Tag, locale?: string): Promise<this>` | Detaches specified tags, or detaches all tags if called without arguments. |
| `syncTags` | `syncTags(tags: (string \| Tag)[] \| string \| Tag, locale?: string): Promise<this>` | Synchronizes the model tags so only the specified list remains attached. |

## Query builder scopes

`TaggableQueryBuilder` provides fluent scopes for querying tagged records:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `whereTag` | `whereTag(nameOrSlug: string, locale?: string): this` | Filters models that have a tag matching the given name or slug. |
| `whereAnyTag` | `whereAnyTag(namesOrSlugs: string[], locale?: string): this` | Filters models having at least one of the specified tags. |
| `whereAllTags` | `whereAllTags(namesOrSlugs: string[], locale?: string): this` | Filters models having all of the specified tags attached simultaneously. |
| `withTags` | `withTags(): this` | Preloads attached tags and their translations in a single optimized query. |
