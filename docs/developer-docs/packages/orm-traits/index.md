# Polymorphic ORM traits

Veap provides four reusable polymorphic ORM traits that extend any `@veap/database` `Model` subclass through TypeScript class mixins and shared polymorphic database tables—without adding extra columns to your domain tables.

## How Veap ORM traits work

Each trait package exports:

1. **A class mixin function** (`Translatable(Model)`, `Taggable(Model)`, `Categorizable(Model)`, `Commentable(Model)`) that attaches typed relation methods, query scopes, and lifecycle hooks (`afterSave`, `beforeDelete`) to your model.
2. **Polymorphic Active Record models** (`Translation`, `Tag`, `Category`, `Comment`) backed by shared `<morph>_type` and `<morph>_id` columns so multiple models (`Article`, `Product`, `Course`) share a single set of trait tables.
3. **Reversible migrations** exported from `<package>/migrations` that you spread into your application's `migrations/index.ts` array.

```ts
// lib/models/article.ts
import { Model } from "@veap/database";
import { Categorizable } from "@veap/categorizable";
import { Commentable } from "@veap/commentable";
import { Taggable } from "@veap/taggable";
import { Translatable } from "@veap/translatable";

export class Article extends Commentable(
  Categorizable(Taggable(Translatable(Model))),
) {
  static override table = "articles";
  static translatable = ["title", "content"];
}
```

## Available ORM trait packages

Explore each trait package in detail:

- [`@veap/translatable`](./translatable.md) — Multilingual model attributes stored in a polymorphic `translations` table with automatic proxy access and locale-scoped queries.
- [`@veap/taggable`](./taggable.md) — Polymorphic, translatable tags (`tags` and `taggables` tables) with `syncTags`, `attachTags`, and `whereTag` / `whereAnyTag` / `whereAllTags` query scopes.
- [`@veap/categorizable`](./categorizable.md) — Hierarchical parent-child categories (`categories` and `categorizables` tables) with tree queries and `<CategoryTreeSelect />`.
- [`@veap/commentable`](./commentable.md) — Threaded polymorphic comments, nested replies, ratings, and moderation statuses (`pending`, `approved`, `spam`, `rejected`, `trash`).
