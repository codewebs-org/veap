# `@veap/categorizable` API reference

`@veap/categorizable` provides hierarchical polymorphic categorization for
`@veap/database` Active Record models. It features a recursive `Category` model
with parent-child nesting, multilingual translations via `@veap/translatable`,
query builder scopes, factories, seeders, and tree navigation UI components.

## Subpath exports

`@veap/categorizable` exposes four entry points in `package.json`:

| Subpath | Description |
| :--- | :--- |
| `@veap/categorizable` | Core mixin (`Categorizable`), base model (`CategorizableModel`), `Category` entity, and query builder (`CategorizableQueryBuilder`). |
| `@veap/categorizable/migrations` | Knex migrations creating the `categories` table and `categorizables` polymorphic pivot table. |
| `@veap/categorizable/ui` | React UI tree view and category selector components (`CategoryTree`, `CategorySelect`) for forms and admin navigation. |
| `@veap/categorizable/testing` | Test utilities, model factory (`CategoryFactory`), and seeder (`CategorySeeder`) for testing environments. |

## Core APIs and classes

The table below summarizes the primary classes, mixins, and utilities exported
by `@veap/categorizable`:

| Symbol | Kind | Signature / Props | Description |
| :--- | :--- | :--- | :--- |
| `Categorizable` | Function | `Categorizable<T extends Constructor<Model>>(Base: T)` | Class mixin adding category relationships and management methods to any model. |
| `CategorizableModel` | Class | `class CategorizableModel extends Model` | Base Active Record class with built-in polymorphic categorization. |
| `Category` | Class | `class Category extends TranslatableModel` | Multilingual hierarchical category entity supporting recursive parent-child trees. |
| `CategorizableQueryBuilder` | Class | `class CategorizableQueryBuilder extends ModelQueryBuilder` | Extends query builder with category scopes (`whereCategory`, `whereCategoryIn`). |
| `CategoryFactory` | Class | `defineFactory(Category, ...)` | Model factory for generating test category hierarchies (exported from `@veap/categorizable/testing`). |
| `CategorySeeder` | Class | `class CategorySeeder extends Seeder` | Database seeder generating baseline taxonomic categories (exported from `@veap/categorizable/testing`). |

## Model instance methods

Models extending `CategorizableModel` or using `Categorizable(Base)` provide the
following instance methods:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `categories` | `categories(): MorphToMany<any, Category>` | Defines the polymorphic many-to-many relationship through `categorizables`. |
| `category` | `category(): MorphOneCategory<any, Category>` | Resolves the primary or first category associated with the model. |
| `assignCategory` | `assignCategory(category: string \| Category, locale?: string): Promise<this>` | Assigns a single category by UUID, name (finds or creates), or instance. |
| `syncCategories` | `syncCategories(categories: (string \| Category)[] \| string \| Category, locale?: string): Promise<this>` | Replaces currently assigned categories with the provided collection. |
| `detachCategories` | `detachCategories(categories?: (string \| Category)[] \| string \| Category, locale?: string): Promise<this>` | Detaches specific categories or clears all category assignments. |

## Query builder scopes

`CategorizableQueryBuilder` enables filtering models by single or grouped
categories:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `whereCategory` | `whereCategory(nameOrSlugOrId: string, locale?: string): this` | Filters models belonging to a category identified by UUID, name, or slug. |
| `whereCategoryIn` | `whereCategoryIn(namesOrSlugsOrIds: string[], locale?: string): this` | Filters models matching any category within the specified array. |
| `withCategories` | `withCategories(): this` | Preloads attached categories along with their multilingual translations. |
| `withCategory` | `withCategory(): this` | Eager-loads the primary category relation. |
