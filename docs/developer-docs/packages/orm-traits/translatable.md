# Polymorphic translations (`@veap/translatable`)

`@veap/translatable` adds multilingual attribute storage to any `@veap/database` model without altering your model tables. All translated field values across all models (`BlogPost`, `Product`, `Category`, `Tag`) are stored in a single polymorphic `translations` table using `morphMany` relations.

## Installation and migration

Install `@veap/translatable` alongside `@veap/database`:

```bash
bun add @veap/translatable @veap/database
```

Register or run the package migrations so the `translations` table is created in your database:

```ts
import { runMigrations } from "@veap/database";
import { migrations as translatableMigrations } from "@veap/translatable/migrations";

await runMigrations("@veap/translatable", translatableMigrations);
```

## Making a model translatable

You can either extend `TranslatableModel` directly or wrap an existing base class with the `Translatable(...)` mixin. Declare the list of localized field names in `static override translatable`:

```ts
import { Model } from "@veap/database";
import { Translatable } from "@veap/translatable";

export class Article extends Translatable(Model) {
  static override table = "articles";
  static override translatable = ["title", "slug", "excerpt", "content"];

  declare id: string;
  declare status: "draft" | "published";
  declare title: string;
  declare slug: string;
  declare excerpt: string;
  declare content: string;
}
```

## Reading and writing translations

`Translatable` wraps model instances in a `Proxy` so reading or assigning a translatable property (`article.title`) automatically targets the active locale, while explicit methods let you read or populate multiple locales at once.

```ts
// 1. Set translations for multiple locales at once
const article = new Article({ status: "published" });

article.fillTranslations({
  en: {
    title: "Hello World",
    slug: "hello-world",
    content: "Welcome to Veap.",
  },
  de: {
    title: "Hallo Welt",
    slug: "hallo-welt",
    content: "Willkommen bei Veap.",
  },
});

// Saving the model automatically persists all staged translations
await article.save();

// 2. Read for a specific locale or active locale
const deTitle = article.getTranslation("title", "de"); // "Hallo Welt"
const activeTitle = article.title; // Resolves active locale (falls back to fallbackLocale)

// 3. Inspect all locales for a field or for the entire model
const titleMap = article.getTranslations("title");
// => { en: "Hello World", de: "Hallo Welt" }
```

## Querying translated attributes

Calling `Article.query()` on a translatable model returns a `TranslatableQueryBuilder` equipped with locale-aware filtering, sorting, and eager-loading scopes:

```ts
// Filter by exact translation in a specific locale
const post = await Article.query()
  .whereTranslation("slug", "hallo-welt", "de")
  .first();

// Search translated fields using SQL LIKE in the current locale
const matches = await Article.query()
  .whereTranslationLike("title", "%Veap%")
  .get();

// Eager-load translations for specific locales (or all locales) to avoid N+1 queries
const feed = await Article.query()
  .withTranslations(["en", "de"])
  .orderByTranslation("title", "asc", "de")
  .get();
```

## Scoping the active locale

Use `setLocale`, `setFallbackLocale`, or the `AsyncLocalStorage`-backed `withLocale` helper to control which language `model.<field>` resolves during a request:

```ts
import { setFallbackLocale, setLocale, withLocale } from "@veap/translatable";

setLocale("en");
setFallbackLocale("en");

// Scope the active locale for a specific async execution flow
await withLocale("de", async () => {
  const articles = await Article.query().withTranslations(["de", "en"]).get();
  console.log(articles[0]?.title); // "Hallo Welt"
});
```
