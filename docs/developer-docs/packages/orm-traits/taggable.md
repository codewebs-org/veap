# Polymorphic tagging (`@veap/taggable`)

`@veap/taggable` lets you attach, sync, detach, and query tags on any `@veap/database` model (`Article`, `Product`, `MediaFile`) through shared `tags` and `taggables` tables. Because `Tag` itself uses `@veap/translatable`, tag names and slugs are automatically multilingual.

## Installation and migration

Install `@veap/taggable` alongside `@veap/database` and `@veap/translatable`:

```bash
bun add @veap/taggable @veap/database @veap/translatable
```

Run the migrations for both `@veap/translatable` and `@veap/taggable`:

```ts
import { runMigrations } from "@veap/database";
import { migrations as taggableMigrations } from "@veap/taggable/migrations";
import { migrations as translatableMigrations } from "@veap/translatable/migrations";

await runMigrations("@veap/translatable", translatableMigrations);
await runMigrations("@veap/taggable", taggableMigrations);
```

## Adding `Taggable` to a model

Apply the `Taggable` mixin to any `Model` (or extend `TaggableModel`). You can compose `Taggable` with other ORM traits such as `Translatable` and `Categorizable`:

```ts
import { Model } from "@veap/database";
import { Taggable } from "@veap/taggable";
import { Translatable } from "@veap/translatable";

export class Article extends Taggable(Translatable(Model)) {
  static override table = "articles";
  static override translatable = ["title", "content"];
}
```

## Attaching, syncing, and detaching tags

Tag mutation methods accept tag names, slugs, UUIDs, or `Tag` model instances. When you pass a tag name that does not exist yet, `@veap/taggable` creates the `Tag` record automatically via `Tag.findOrCreateByName`.

```ts
// Attach additional tags without removing existing ones
await article.attachTags(["TypeScript", "Next.js"]);

// Replace all attached tags with the provided list
await article.syncTags(["Architecture", "ORM", "TypeScript"]);

// Detach a single tag or clear all tags on the model
await article.detachTags("ORM");
await article.detachTags(); // Detaches all tags
```

## Querying models by tags

`Taggable` extends your model's query builder with four expressive scopes for filtering and eager-loading tags:

```ts
// 1. Models tagged with a specific tag (by name, slug, or ID)
const tsArticles = await Article.query().whereTag("typescript").get();

// 2. Models matching ANY of the given tags
const webArticles = await Article.query()
  .whereAnyTag(["typescript", "nextjs"])
  .get();

// 3. Models matching ALL of the given tags
const strictMatches = await Article.query()
  .whereAllTags(["architecture", "typescript"])
  .get();

// 4. Eager-load attached tags and their localized names
const articlesWithTags = await Article.query().withTags().get();
```

## Using the `<TagInput />` UI component

`@veap/taggable/ui` exports a client-side `<TagInput />` component with autocomplete suggestions and keyboard chip creation:

```tsx
"use client";

import { TagInput } from "@veap/taggable/ui";
import { useState } from "react";

export function ArticleTagsField({ availableTags }: { availableTags: string[] }) {
  const [tags, setTags] = useState<string[]>(["TypeScript"]);

  return (
    <TagInput
      value={tags}
      availableTags={availableTags}
      onChange={setTags}
      placeholder="Add a tag and press Enter..."
    />
  );
}
```
