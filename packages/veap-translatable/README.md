# @veap/translatable (Veap Translatable)

Polymorphic multilingual model translations for the **Veap ORM**, inspired by `laravel-translatable`.

Instead of creating separate tables for every model (for example, `blog_posts_translations`, `categories_translations`, `products_translations`), `veap-translatable` utilizes a **single polymorphic table** (`translations`) powered by Veap's `morphMany` and `morphTo` relations. Any model can have translatable fields on the fly without schema migrations!

---

## Features

- 🌐 **100% Polymorphic**: Store translations for ANY model (`BlogPost`, `BlogCategory`, `Product`, etc.) in a unified, indexed `translations` table.
- ⚡ **Zero Schema Overhead**: Add new translatable fields to any model simply by adding them to `static translatable = [...]`.
- 🪄 **Proxy Access**: Access or assign translated attributes directly: `post.title`, `post.title = "Cześć"`, `post.title = { pl: "...", en: "..." }`.
- 🔄 **Automatic Lifecycle Sync**: Staged translations are automatically saved on `await model.save()` and removed on `await model.delete()`.
- 🔀 **Fallback Support**: Automatically falls back to fallback locale or default locale if a translation is missing.
- 🔍 **Rich Query Scopes**: Query models by translation values easily: `whereTranslation`, `whereTranslationLike`, `orderByTranslation`, `withTranslations`.
- 🧵 **AsyncLocalStorage Context**: Scope locale dynamically across asynchronous execution flows with `withLocale("pl", async () => { ... })`.

---

## Installation

Install `@veap/translatable` alongside `@veap/database`:

```bash
bun add @veap/translatable @veap/database
```

Run the migration to create the `translations` table:

```ts
import { runMigrations } from "@veap/database";
import { migrations } from "@veap/translatable/migrations";

await runMigrations("@veap/translatable", migrations);
```

---

## Usage

### 1. Extending `TranslatableModel`

```ts
import { TranslatableModel } from "@veap/translatable";

export interface BlogPostAttributes {
  id: string;
  authorId: string;
  status: "draft" | "published";
  createdAt?: Date;
  updatedAt?: Date | null;
}

export class BlogPost extends TranslatableModel<BlogPostAttributes> {
  static override table = "blog_posts";

  // Declare which attributes should be translated:
  static override translatable = ["title", "slug", "content", "excerpt"];
}
```

### 2. Using the `Translatable` Mixin

If your model already extends another base class:

```ts
import { Translatable } from "@veap/translatable";
import { CustomBaseModel } from "./CustomBaseModel";

export class BlogCategory extends Translatable(CustomBaseModel) {
  static override table = "blog_categories";
  static override translatable = ["name", "description"];
}
```

---

## Working with Translations

### Reading Translations

```ts
// Get translation for current active locale (with fallback)
const title = post.getTranslation("title");

// Get translation for a specific locale
const polishTitle = post.getTranslation("title", "pl");

// Direct property access via Proxy
console.log(post.title); // Evaluates for active locale!

// Get all translations for a field as { [locale]: value }
const titleTranslations = post.getTranslations("title");
// => { en: "Hello World", pl: "Witaj Świecie" }

// Get all translations for all fields as { [field]: { [locale]: value } }
const allTranslations = post.getTranslations();
```

### Setting Translations

```ts
// Set translation for a specific locale
post.setTranslation("title", "en", "Hello World");
post.setTranslation("title", "pl", "Witaj Świecie");

// Set multiple locales at once
post.setTranslations("title", {
  en: "Hello World",
  pl: "Witaj Świecie",
  de: "Hallo Welt",
});

// Set via direct property assignment
post.title = "Witaj Świecie"; // Sets for current locale
post.title = { en: "Hello World", pl: "Witaj Świecie" }; // Sets for multiple locales

// Fill multiple fields and locales at once
post.fillTranslations({
  en: { title: "Hello", content: "English content" },
  pl: { title: "Cześć", content: "Polska treść" },
});

// Persist the model and all staged translations automatically
await post.save();
```

---

## Querying

`TranslatableModel.query()` returns an enhanced `TranslatableQueryBuilder`:

```ts
// Find posts with exact translated title in Polish
const posts = await BlogPost.query()
  .whereTranslation("title", "Witaj Świecie", "pl")
  .get();

// Search with LIKE pattern in current locale
const results = await BlogPost.query()
  .whereTranslationLike("title", "%Veap%")
  .get();

// Eager load translations to avoid N+1 queries
const allPosts = await BlogPost.query().withTranslations(["pl", "en"]).get();

// Order posts by translated title
const ordered = await BlogPost.query()
  .orderByTranslation("title", "asc", "pl")
  .get();
```

---

## Managing Locales

```ts
import {
  getLocale,
  setLocale,
  getDefaultLocale,
  setDefaultLocale,
  getFallbackLocale,
  setFallbackLocale,
  withLocale,
} from "@veap/translatable";

// Set global active locale
setLocale("pl");

// Configure fallback locale
setFallbackLocale("en");

// Run code with scoped locale (AsyncLocalStorage)
await withLocale("de", async () => {
  console.log(getLocale()); // "de"
  console.log(post.title); // Returns German translation!
});
```
