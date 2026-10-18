# @veap/taggable (Veap Taggable)

Polymorphic tagging feature package for the **Veap ORM**, inspired by `spatie/laravel-tags`.

`@veap/taggable` provides a decoupled, polymorphic system for attaching, detaching, and syncing tags to any model (`BlogPost`, `Product`, `Media`, etc.) using a shared `taggables` pivot table and multilingual tag names via `@veap/translatable`.

---

## Features

- 🏷️ **100% Polymorphic**: Attach tags to any model using the `morphToMany` relation without altering target model tables.
- 🌐 **Multilingual Tags**: Integrates seamlessly with `@veap/translatable` for localized tag names and slugs (for example, `pl`, `en`).
- 🪄 **Functional Mixin & Base Model**: Use either `Taggable(BaseModel)` or extend `TaggableModel`.
- ⚡ **Auto-Resolution & Creation**: Pass tag IDs, tag names, or existing Tag instances. Non-existent tags are automatically created via `findOrCreateByName`.
- 🔍 **Expressive Query Scopes**: Filter models by tags using `whereTag(nameOrSlug)`, `whereAnyTag([...])`, `whereAllTags([...])`, and eager-load via `withTags()`.
- 🎨 **Ready-to-Use UI**: Includes `<TagInput />` component under `@veap/taggable/ui` with auto-complete and keyboard navigation.

---

## Installation

Install `@veap/taggable` alongside `@veap/database` and `@veap/translatable`:

```bash
bun add @veap/taggable @veap/database @veap/translatable
```

Run migrations to set up the `tags` and `taggables` tables:

```ts
import { runMigrations } from "@veap/database";
import { migrations } from "@veap/taggable/migrations";

await runMigrations("@veap/taggable", migrations);
```

---

## Usage

### 1. Adding `Taggable` to Your Model

```ts
import { Model } from "@veap/database";
import { Taggable } from "@veap/taggable";

export class Article extends Taggable(Model) {
  static override table = "articles";
}
```

Or inherit directly from `TaggableModel`:

```ts
import { TaggableModel } from "@veap/taggable";

export class Article extends TaggableModel {
  static override table = "articles";
}
```

### 2. Attaching, Detaching & Syncing Tags

```ts
// Attach tags by name, slug, ID, or instance
await article.attachTags(["technology", "web-dev"]);

// Sync tags (replaces existing tags)
await article.syncTags(["news", "ai"]);

// Detach specific tags or all tags
await article.detachTags("ai");
await article.detachTags(); // removes all attached tags
```

### 3. Querying Models by Tags

```ts
// Records tagged with a specific tag (name or slug)
const techArticles = await Article.query().whereTag("technology").get();

// Records matching any of the specified tags
const matched = await Article.query().whereAnyTag(["news", "tech"]).get();

// Records matching all specified tags
const strictlyTagged = await Article.query()
  .whereAllTags(["news", "tech"])
  .get();

// Eager load tags with their translations
const articles = await Article.query().withTags().get();
```

---

## UI Component (`@veap/taggable/ui`)

```tsx
import { TagInput } from "@veap/taggable/ui";

export function ArticleForm({ allAvailableTags, control }) {
  return (
    <TagInput
      value={selectedTagNames}
      availableTags={allAvailableTags}
      onChange={(tags) => setSelectedTagNames(tags)}
      placeholder="Add tags..."
    />
  );
}
```
