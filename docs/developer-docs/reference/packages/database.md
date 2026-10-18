# `@veap/database` API reference

`@veap/database` provides the Knex-powered Active Record ORM (`Model`), fluent `QueryBuilder`, relational and polymorphic associations, `AsyncLocalStorage` transactions (`transaction`), test factories (`Factory`), and schema migration runner (`Schema`, `runMigrations`).

## Subpath exports

`@veap/database` defines three entry points in `package.json`:

| Subpath | Description |
| :--- | :--- |
| `@veap/database` | Main barrel exporting `Model`, `QueryBuilder`, `DatabaseServiceProvider`, `MigrationServiceProvider`, `Schema`, `runMigrations`, `transaction`, `initDatabase`, `getKnex`, `dbClient`, `Factory`, and relations. |
| `@veap/database/migrations` | `Schema`, `runMigrations`, `rollbackMigrations`, `getMigrationStatus`, and `Migration` types. |
| `@veap/database/relations` | `BelongsTo`, `HasOne`, `HasMany`, `BelongsToMany`, `MorphTo`, `MorphOne`, `MorphMany`, and `MorphToMany`. |

## Service providers and IoC tokens

`@veap/database` integrates with `@veap/kernel` through two providers and two container tokens:

| Symbol | Kind | Description |
| :--- | :--- | :--- |
| `DatabaseServiceProvider` | `ServiceProvider` | Initializes Knex from `DATABASE_URL` / `DATABASE_FILE` (auto-selecting `better-sqlite3` or `pg`), binds `DATABASE` (`Symbol.for("veap:database:connection")`) and `"Knex"`, and destroys the connection pool on `shutdown()`. |
| `MigrationServiceProvider` | `ServiceProvider` | Registers CLI migration commands (`make:migration`, `migrate`, `migrate:status`, `migrate:rollback`) and runs `APP_MIGRATIONS` automatically on server boot (skipped when `VEAP_CLI === "1"`). |
| `DATABASE` | `Token<Knex>` | Injection token for the active Knex instance. |
| `APP_MIGRATIONS` | `Token<Migration[]>` | Injection token populated by `ApplicationBuilder.withMigrations(migrations)`. |

## `Model` static and instance API

Every Active Record model extends `Model` and overrides `static override table`:

| Member | Signature | Description |
| :--- | :--- | :--- |
| `static table` | `string` | Database table name for the model. |
| `static primaryKey` | `string` (default `"id"`) | Primary key column name. |
| `static timestamps` | `boolean` (default `true`) | Automatically manages `created_at` and `updated_at` columns. |
| `protected static casts` | `Record<string, CastType>` | Automatic attribute casting (`"boolean"`, `"number"`, `"int"`, `"float"`, `"string"`, `"json"`, `"array"`, `"object"`, `"date"`). |
| `Model.query()` | `QueryBuilder<T>` | Starts a new fluent query builder for the model. |
| `Model.create(attrs)` | `Promise<T>` | Instantiates and inserts a new record into the database. |
| `Model.find(id)` | `Promise<T \| null>` | Finds a record by primary key or returns `null`. |
| `Model.findOrFail(id)` | `Promise<T>` | Finds a record by primary key or throws `NotFoundError`. |
| `model.save()` | `Promise<this>` | Inserts a new record or updates dirty attributes on an existing record. |
| `model.delete()` | `Promise<boolean>` | Deletes the record from the database. |

## `QueryBuilder` methods

`Model.query()` returns a chainable `QueryBuilder<T>`:

| Method | Signature | Description |
| :--- | :--- | :--- |
| `where` | `where(column, operatorOrValue, value?)` | Adds a `WHERE` clause (also supports `whereIn`, `whereNull`, `whereNotNull`, `orWhere`). |
| `with` | `with(...relations: string[])` | Eager-loads declared model relations to prevent N+1 queries. |
| `orderBy` | `orderBy(column, direction?: "asc" \| "desc")` | Sorts query results. |
| `limit` / `offset` | `limit(n)` / `offset(n)` | Restricts result count and offset. |
| `get` | `get(): Promise<T[]>` | Executes the query and returns hydrated model instances. |
| `first` | `first(): Promise<T \| null>` | Limits to 1 row and returns the model instance or `null`. |
| `count` | `count(): Promise<number>` | Returns the total number of matching rows. |
| `paginate` | `paginate(page?: number, perPage?: number)` | Returns `{ data, total, perPage, currentPage, lastPage }`. |
