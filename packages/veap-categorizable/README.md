# @veap/categorizable (Veap Categorizable)

Hierarchical polymorphic categorization package for the **Veap ORM**, inspired by enterprise taxonomy systems.

`@veap/categorizable` enables any model (`BlogPost`, `Product`, `Documentation`, etc.) to belong to a single primary category or multiple categories arranged in nested parent-child trees.

---

## Features

- 📁 **Single & Multiple Categories**: Provides both `category()` (morphOne) and `categories()` (morphToMany) relations.
- 🌳 **Nested Hierarchies**: Model categories support recursive parent-child relations (`parent`, `children`).
- 🌐 **Multilingual Names & Slugs**: Localized via `@veap/translatable`.
- ⚡ **Auto-Resolution & Creation**: Assign by name, slug, UUID, or Category instance.
- 🔍 **Expressive Query Scopes**: `whereCategory(nameOrSlugOrId)`, `whereInCategories([...])`, and `withCategories()`.
- 🎨 **Tree Selector UI**: Includes `<CategoryTreeSelect />` under `@veap/categorizable/ui` with collapsible levels.

---

## Installation

Install `@veap/categorizable` alongside `@veap/database` and `@veap/translatable`:

```bash
bun add @veap/categorizable @veap/database @veap/translatable
```

Run migrations to create the `categories` and `categorizables` pivot tables:

```ts
import { runMigrations } from "@veap/database";
import { migrations } from "@veap/categorizable/migrations";

await runMigrations("@veap/categorizable", migrations);
```

---

## Usage

### 1. Adding `Categorizable` to Your Model

```ts
import { Model } from "@veap/database";
import { Categorizable } from "@veap/categorizable";

export class Product extends Categorizable(Model) {
  static override table = "products";
}
```

Or inherit directly from `CategorizableModel`:

```ts
import { CategorizableModel } from "@veap/categorizable";

export class Product extends CategorizableModel {
  static override table = "products";
}
```

### 2. Assigning & Syncing Categories

```ts
// Assign a primary category by name or slug (auto-created if missing)
await product.assignCategory("Electronics");

// Sync multiple categories
await product.syncCategories(["Laptops", "Workstations"]);

// Detach categories
await product.detachCategories();
```

### 3. Querying Models by Category

```ts
// Query by category name or slug
const electronics = await Product.query().whereCategory("electronics").get();

// Query by any category in list
const devices = await Product.query()
  .whereInCategories(["laptops", "smartphones"])
  .get();

// Eager-load categories with translations
const products = await Product.query().withCategories().get();
```

---

## UI Component (`@veap/categorizable/ui`)

```tsx
import { CategoryTreeSelect } from "@veap/categorizable/ui";

export function ProductForm({ categories, field }) {
  return (
    <CategoryTreeSelect
      categories={categories}
      value={field.value ? [field.value] : []}
      onChange={(ids) => field.onChange(ids[0] || null)}
      multiple={false}
      placeholder="Select category..."
    />
  );
}
```
