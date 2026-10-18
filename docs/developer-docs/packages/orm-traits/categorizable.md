# Hierarchical categories (`@veap/categorizable`)

`@veap/categorizable` organizes `@veap/database` models into nested parent-child category trees using polymorphic `categories` and `categorizables` tables. Categories support both single primary assignment (`category()`) and multi-category assignment (`categories()`), with localized names and slugs powered by `@veap/translatable`.

## Installation and migration

Install `@veap/categorizable` alongside `@veap/database` and `@veap/translatable`:

```bash
bun add @veap/categorizable @veap/database @veap/translatable
```

Run the migrations to create the `translations`, `categories`, and `categorizables` tables:

```ts
import { migrations as categorizableMigrations } from "@veap/categorizable/migrations";
import { runMigrations } from "@veap/database";
import { migrations as translatableMigrations } from "@veap/translatable/migrations";

await runMigrations("@veap/translatable", translatableMigrations);
await runMigrations("@veap/categorizable", categorizableMigrations);
```

## Adding `Categorizable` to a model

Wrap your model with the `Categorizable` mixin or extend `CategorizableModel`:

```ts
import { Categorizable } from "@veap/categorizable";
import { Model } from "@veap/database";

export class Product extends Categorizable(Model) {
  static override table = "products";

  declare id: string;
  declare sku: string;
}
```

## Assigning and syncing categories

You can pass category names, slugs, UUIDs, or `Category` instances. Passing a name that does not exist yet creates the category automatically.

```ts
import { Category } from "@veap/categorizable";

// Create a parent-child hierarchy explicitly
const hardware = await Category.findOrCreateByName("Hardware");
const laptops = await Category.create({
  parentId: hardware.id,
  name: "Laptops",
  slug: "laptops",
});

// Assign a single primary category
await product.assignCategory(laptops);

// Or sync multiple categories at once
await product.syncCategories(["Hardware", "Laptops"]);

// Remove all category associations from this model
await product.detachCategories();
```

## Querying by category

Filter models by category name, slug, or ID using `whereCategory` and `whereInCategories`, and eager-load attached categories with `withCategories()`:

```ts
// Find products in a single category
const laptopsList = await Product.query().whereCategory("laptops").get();

// Find products belonging to any of the listed categories
const electronics = await Product.query()
  .whereInCategories(["laptops", "workstations"])
  .withCategories()
  .get();
```

## Using `<CategoryTreeSelect />`

`@veap/categorizable/ui` provides a collapsible `<CategoryTreeSelect />` component for selecting single or multiple categories from a nested hierarchy:

```tsx
"use client";

import { CategoryTreeSelect, type CategoryTreeNode } from "@veap/categorizable/ui";
import { useState } from "react";

export function ProductCategoryPicker({ tree }: { tree: CategoryTreeNode[] }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  return (
    <CategoryTreeSelect
      categories={tree}
      value={selectedIds}
      onChange={setSelectedIds}
      multiple={true}
      placeholder="Select categories..."
    />
  );
}
```
