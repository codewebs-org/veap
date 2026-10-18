# Database and ORM (`@veap/database`)

`@veap/database` is an Active Record ORM built on top of Knex.js for PostgreSQL, MySQL, and SQLite. It provides declarative `Model` classes, a chainable `QueryBuilder`, relational and polymorphic associations, `AsyncLocalStorage` transaction propagation, and a reversible schema migration runner.

## Connecting to the database

Register `DatabaseServiceProvider` and `MigrationServiceProvider` in your application composition root (`lib/veap.ts`), or chain `.withMigrations(appMigrations)` to register your migration list and `MigrationServiceProvider` in a single step:

```ts
// lib/veap.ts
import { DatabaseServiceProvider } from "@veap/database";
import { Application } from "@veap/kernel";
import { appMigrations } from "../migrations";

export const app = Application.configure()
  .use(DatabaseServiceProvider)
  .withMigrations(appMigrations)
  .create();
```

When `DatabaseServiceProvider.boot()` runs, it reads `DATABASE_URL` (or `DATABASE_FILE`) from `ConfigService` / `process.env` and automatically selects `better-sqlite3` for SQLite file paths or `pg` for PostgreSQL connection strings.

<!-- prettier-ignore -->
> [!TIP]
> If you use `@veap/database` in a standalone script or service without `Application.configure()`, call `initDatabase({ client: "better-sqlite3", connection: { filename: "./dev.sqlite" }, useNullAsDefault: true })` directly.

## PostgreSQL SSL configuration

When `DATABASE_URL` points to a PostgreSQL instance in production (`NODE_ENV === "production"`), `DatabaseServiceProvider` configures TLS verification automatically. You can customize certificate verification through two environment variables:

- `DATABASE_SSL_REJECT_UNAUTHORIZED`: Set to `"false"` when connecting to managed PostgreSQL providers with self-signed certificates.
- `DATABASE_SSL_CA`: Provide a custom PEM-encoded CA certificate string for strict verification.

## Next steps

Continue exploring `@veap/database` features:

- [Models, queries, and relationships](./models-and-relations.md) — Define `Model` subclasses, casts, scopes, lifecycle hooks, and eager loaded associations.
- [Migrations and transactions](./migrations-and-transactions.md) — Manage schema changes with `Schema` and run `AsyncLocalStorage` transactions.
- [Seeders and model factories](./seeders-and-factories.md) — Populate test data with `defineFactory`, create `Seeder` classes, and run seeds via the console CLI.
