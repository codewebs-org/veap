# Models, queries, and relationships

Extend the base `Model` class from `@veap/database` to map a database table to a strongly typed Active Record class with fluent querying, attribute casting, relations, lifecycle hooks, and soft deletes.

## Defining Active Record models

Set `static override table` on your `Model` subclass to the underlying database table name. By default, models use `id` as the primary key and manage `created_at` and `updated_at` timestamps automatically:

```ts
// lib/models/article.ts
import { type BelongsTo, type HasMany, Model } from "@veap/database";
import { Author } from "./author";
import { Comment } from "./comment";

export class Article extends Model {
  static override table = "articles";

  declare id: number;
  declare author_id: number;
  declare title: string;
  declare slug: string;
  declare content: string;
  declare is_published: boolean;
  declare metadata: Record<string, any>;
  declare created_at: string;
  declare updated_at: string;

  protected static override casts = {
    is_published: "boolean",
    metadata: "json",
  } as const;

  public author(): BelongsTo<Author> {
    return this.belongsTo(Author, "author_id");
  }

  public comments(): HasMany<Comment> {
    return this.hasMany(Comment, "article_id");
  }
}
```

### Attribute casting

Define `protected static override casts` on a model to convert database column values automatically when reading and writing attributes. Supported cast types include `"boolean"`, `"number"`, `"int"`, `"integer"`, `"float"`, `"string"`, `"json"`, `"array"`, `"object"`, and `"date"`.

## Querying and CRUD operations

Call `Model.query()` to start a fluent `QueryBuilder<T>` chain, or use static convenience methods such as `create`, `find`, `findOrFail`, and `all`:

```ts
import { Article } from "@/lib/models/article";

// 1. Create and persist a new record
const article = await Article.create({
  author_id: 1,
  title: "Getting Started with Veap ORM",
  slug: "getting-started-with-veap-orm",
  content: "Active Record modeling in TypeScript...",
  is_published: true,
  metadata: { readingTimeMinutes: 4 },
});

// 2. Query with filtering, ordering, and eager loading
const published = await Article.query()
  .with("author", "comments")
  .where("is_published", true)
  .orderBy("created_at", "desc")
  .limit(10)
  .get();

// 3. Update an existing instance
article.title = "Mastering Veap ORM";
await article.save();

// 4. Paginate results
const page = await Article.query()
  .where("is_published", true)
  .paginate(1, 20);
// page => { data: Article[], total, perPage: 20, currentPage: 1, lastPage }
```

## Relationships

`@veap/database` supports standard relational associations (`belongsTo`, `hasOne`, `hasMany`, `belongsToMany`) as well as polymorphic associations (`morphTo`, `morphOne`, `morphMany`, `morphToMany`) used by Veap's ORM traits:

| Relation method | Signature | Description |
| :--- | :--- | :--- |
| `this.belongsTo` | `belongsTo(RelatedModel, foreignKey?, ownerKey?)` | Inverse one-to-one or one-to-many relation where the current model holds the foreign key. |
| `this.hasOne` | `hasOne(RelatedModel, foreignKey?, localKey?)` | One-to-one relation where `RelatedModel` holds the foreign key. |
| `this.hasMany` | `hasMany(RelatedModel, foreignKey?, localKey?)` | One-to-many relation where `RelatedModel` holds the foreign key. |
| `this.belongsToMany` | `belongsToMany(RelatedModel, pivotTable?, foreignPivotKey?, relatedPivotKey?)` | Many-to-many relation over a join table (supports `.attach()`, `.detach()`, and `.sync()`). |
| `this.morphMany` | `morphMany(RelatedModel, morphName)` | Polymorphic one-to-many relation using `<morphName>_type` and `<morphName>_id` columns. |
| `this.morphToMany` | `morphToMany(RelatedModel, morphName, pivotTable?)` | Polymorphic many-to-many relation over a shared pivot table. |

## Model lifecycle hooks and events

Every `Model` subclass can define instance lifecycle hook methods that run automatically before and after persistence operations. Returning `false` from any `"before*"` (or `creating` / `updating` / `saving` / `deleting` / `restoring`) hook cancels the database operation cleanly:

| Lifecycle stage | Hook methods invoked on `this` | Dispatched `EventBus` topics |
| :--- | :--- | :--- |
| Before insert or update | `saving()` / `beforeSave()` | `model:saving:<tableName>`, `model:saving` |
| After insert or update | `saved()` / `afterSave()` | `model:saved:<tableName>`, `model:saved` |
| Before insert | `creating()` / `beforeCreate()` | `model:creating:<tableName>`, `model:creating` |
| After insert | `created()` / `afterCreate()` | `model:created:<tableName>`, `model:created` |
| Before update | `updating()` / `beforeUpdate()` | `model:updating:<tableName>`, `model:updating` |
| After update | `updated()` / `afterUpdate()` | `model:updated:<tableName>`, `model:updated` |
| Before delete | `deleting()` / `beforeDelete()` | `model:deleting:<tableName>`, `model:deleting` |
| After delete | `deleted()` / `afterDelete()` | `model:deleted:<tableName>`, `model:deleted` |
| Before restore | `restoring()` / `beforeRestore()` | `model:restoring:<tableName>`, `model:restoring` |
| After restore | `restored()` / `afterRestore()` | `model:restored:<tableName>`, `model:restored` |

```ts
import { Model } from "@veap/database";

export class Article extends Model {
  static override table = "articles";

  declare title: string;
  declare slug: string;

  protected beforeSave(): void {
    if (!this.slug && this.title) {
      this.slug = this.title.toLowerCase().trim().replace(/\s+/g, "-");
    }
  }
}
```

## Soft deletes and global scopes

Enable soft deletes on a model by setting `static override softDeletes = true` (which uses the `deleted_at` column by default, configurable via `static override deletedAtColumn`). Calling `await model.delete()` sets `deleted_at` to the current timestamp, and standard `Model.query()` calls automatically exclude soft-deleted rows:

```ts
import { Model } from "@veap/database";

export class Invoice extends Model {
  static override table = "invoices";
  static override softDeletes = true;
}

// Soft-delete an instance
await invoice.delete();
console.log(invoice.trashed()); // true

// Include or isolate soft-deleted records in queries
const allInvoices = await Invoice.withTrashed().get();
const archivedOnly = await Invoice.onlyTrashed().get();

// Restore or permanently delete
await invoice.restore();
await invoice.forceDelete();
```

### Registering global scopes

Use `Model.addGlobalScope(name, callback)` to apply automatic constraints to every query on a model unless explicitly removed with `.withoutGlobalScope(name)`:

```ts
Article.addGlobalScope("publishedOnly", (builder) => {
  builder.where("is_published", true);
});
```

## Eager loading and preventing N+1 queries (`.with`)

When rendering lists of models and their associated relations, lazy loading each relation inside a loop triggers the N+1 query problem. Use `.with()` to eager load relations in bulk queries:

```ts
// Eager load single or multiple relations
const articles = await Article.query()
  .with("author", "tags")
  .where("is_published", true)
  .get();

// Eager load nested relations (such as author and their profile)
const posts = await Article.query()
  .with("author.profile", "comments.author")
  .get();
```

### Filtering queries by relation existence (`whereHas` and `whereDoesntHave`)

Use `whereHas` or `whereDoesntHave` to filter models based on whether they have matching child or pivot records:

```ts
// Find articles that have at least one approved comment
const commentedArticles = await Article.query()
  .whereHas("comments", (query) => {
    query.where("status", "approved");
  })
  .get();

// Find users who do not have any orders
const inactiveUsers = await User.query()
  .whereDoesntHave("orders")
  .get();

// Count related models as an extra attribute (such as comments_count)
const articlesWithCounts = await Article.query()
  .withCount("comments")
  .get();
```

## Advanced queries and raw Knex (`.toKnex`)

When you need specialized SQL features not covered by Active Record (such as row-level locking with `forUpdate()`, Common Table Expressions, or window functions), call `.toKnex()` to access the underlying Knex query builder directly:

```ts
import { transaction } from "@veap/database";

await transaction(async () => {
  // Acquire an exclusive lock on the row until the transaction commits
  const account = await BankAccount.query()
    .where("id", accountId)
    .toKnex()
    .forUpdate()
    .first();

  // Perform balance updates securely
});
```

