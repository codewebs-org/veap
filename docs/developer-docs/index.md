# Veap documentation

Veap is a modular, backend-focused TypeScript framework built for **Next.js** (App Router, React Server Components, and Server Actions). Out of the box, `@veap/kernel` binds default Next.js adapters (`NextCookieStore` and `NextRequestContext`) to its HTTP transport ports (`COOKIE_STORE` and `REQUEST_CONTEXT`). Because all other Veap packages communicate with the HTTP layer strictly through those two IoC ports rather than importing Next.js directly, Veap works with zero transport configuration in Next.js while remaining easy to run in other frameworks (such as **Hono**, **Express**, or standalone Node.js/Bun services) by overriding those ports with custom adapters.

## How Veap works

Every Veap application starts from a central composition root (`lib/veap.ts`) powered by `@veap/kernel`. When `app.bootstrap()` runs, it automatically boots `KernelServiceProvider` (which sets up the default Next.js `COOKIE_STORE` and `REQUEST_CONTEXT` adapters, `ConfigService`, `EventBus`, `ConsoleLogger`, and `MemoryCacheProvider`) followed by the feature `ServiceProvider` classes your application registers:

```ts
import { Application } from "@veap/kernel";
import { DatabaseServiceProvider } from "@veap/database";
import { AuthServiceProvider } from "@veap/auth";
import { StorageServiceProvider } from "@veap/storage";

export const app = Application.configure()
  .use(DatabaseServiceProvider)
  .use(AuthServiceProvider)
  .use(StorageServiceProvider)
  .create();
```

## Core ecosystem packages

Veap is distributed as a set of focused packages. You can adopt the full stack or install individual packages incrementally:

| Package | Description |
| --- | --- |
| `@veap/kernel` | IoC dependency injection container, `Application` lifecycle builder, asynchronous `eventBus`, `ConfigService`, `AppError` / `Result<T>` helpers, and the `veap` CLI runner. |
| `@veap/database` | Knex-powered Active Record ORM (`Model`), fluent `QueryBuilder`, relations (`belongsTo`, `hasMany`, polymorphic `morphMany` / `morphToMany`), `AsyncLocalStorage` transactions, and schema migrations. |
| `@veap/auth` | Session management, password hashing (`bcrypt`), AES-GCM encryption, RBAC roles and permissions, email verification, and Next.js Server Actions (`signIn`, `signUp`, `signOut`). |
| `@veap/plugins` | Modular plugin contract (`IPlugin`), virtual router (`VeapRouter`), UI extension slots (`ExtensionPoint`), customizable widget grids (`WidgetComposer`), and CLI management (`veap add`, `veap eject`). |
| `@veap/intl` | Server and client internationalization, ICU message formatting (`intl-messageformat`), and automatic locale negotiation from cookies and HTTP headers. |
| `@veap/mail` | Pluggable email delivery (`sendMail`) with SMTP/Nodemailer, console development logging, and custom transport adapters (`CUSTOM_MAILER`). |
| `@veap/settings` | Database-persisted key-value application settings (`SettingsService`) with automatic in-memory caching. |
| `@veap/storage` | File upload and deletion router (`StorageService`) with a hardened `LocalFileProvider` and custom cloud driver contracts (`IStorageProvider`). |
| `@veap/ui` | Accessible React 19 and Tailwind CSS v4 component library built on Radix UI primitives. |
| `create-veap` | Project scaffolding CLI (`bun create veap`) for initializing new Next.js + Veap applications. |

## Polymorphic ORM traits

In addition to the core infrastructure packages, Veap ships four reusable polymorphic traits for `@veap/database` models:

| Trait package | Description |
| --- | --- |
| `@veap/translatable` | Stores multilingual model attributes in a single polymorphic `translations` table with proxy property access and locale-scoped queries. |
| `@veap/taggable` | Attaches polymorphic, translatable tags (`tags` and `taggables` tables) to any model with query scopes (`whereTag`, `whereAnyTag`, `whereAllTags`). |
| `@veap/categorizable` | Organizes models into hierarchical parent-child category trees (`categories` and `categorizables` tables) with a `<CategoryTreeSelect />` UI component. |
| `@veap/commentable` | Adds threaded polymorphic comments, nested replies, and moderation statuses (`pending`, `approved`, `spam`, `rejected`, `trash`) to any model. |

## Getting started path

Follow these four guides in order to set up and structure your first Veap application:

1. [Installation and scaffolding](./getting-started/installation.md) — create a new project with `create-veap` or add Veap packages to an existing Next.js application.
2. [Your first application](./getting-started/first-application.md) — build the `lib/veap.ts` composition root, configure transport adapters, and resolve services from the container.
3. [Next.js integration](./getting-started/nextjs-integration.md) — wire Veap into Next.js `instrumentation.ts`, Server Components, Server Actions, and Route Handlers while respecting server/client boundaries.
4. [Project structure and configuration](./getting-started/project-structure.md) — understand the directory layout, `veap.config.ts`, `lib/plugins.gen.ts`, and plugin ejection.

## Kernel fundamentals (`@veap/kernel`)

Dive deeper into the core architectural primitives provided by `@veap/kernel`:

- [IoC container and service providers](./fundamentals/ioc-and-providers.md) — dependency injection tokens, `@Injectable()` and `@Inject()`, `ServiceProvider` lifecycle hooks, and `Application.configure()`.
- [Configuration and error handling](./fundamentals/configuration-and-errors.md) — `veap.config.ts`, `ConfigService` (`CONFIG_SERVICE`), domain errors with `AppError`, and Server Action `Result<T>` helpers (`ok`, `handleActionError`).
- [Events, caching, and logging](./fundamentals/events-and-cache.md) — publish-subscribe `EventBus` (`EVENT_BUS`), `CACHE_PROVIDER` (`MemoryCacheProvider`), and structured console logging (`LOGGER`).
- [Console and CLI commands](./fundamentals/cli.md) — the `veap` console runner (`ConsoleApplication`), built-in commands, and custom `Command` classes (`@veap/kernel/cli`).

## Packages (`@veap/*`)

Learn how to configure and use each package in the Veap ecosystem:

- [`@veap/database`](./packages/database/index.md) — Active Record [models and relations](./packages/database/models-and-relations.md), `AsyncLocalStorage` [transactions and migrations](./packages/database/migrations-and-transactions.md), and [seeders and model factories](./packages/database/seeders-and-factories.md).
- [Polymorphic ORM traits](./packages/orm-traits/index.md) — [Translatable](./packages/orm-traits/translatable.md) (`@veap/translatable`), [Taggable](./packages/orm-traits/taggable.md) (`@veap/taggable`), [Categorizable](./packages/orm-traits/categorizable.md) (`@veap/categorizable`), and [Commentable](./packages/orm-traits/commentable.md) (`@veap/commentable`).
- [`@veap/auth`](./packages/auth/index.md) — Sessions, [Server Actions and RBAC](./packages/auth/actions-and-rbac.md), and [email verification, cryptography, and 2FA hooks](./packages/auth/verification-and-security.md).
- [`@veap/plugins`](./packages/plugins/index.md) — `IPlugin` contract, [virtual routing (`VeapRouter`), extension slots, and widgets](./packages/plugins/routing-and-ui.md).
- [`@veap/intl`](./packages/intl/index.md) — Locale negotiation and [ICU formatting in Server and Client Components](./packages/intl/formatting-and-components.md).
- [`@veap/mail`](./packages/mail/index.md) — Transactional emails and [SMTP or custom mail drivers](./packages/mail/transports-and-drivers.md).
- [`@veap/settings`](./packages/settings/index.md) — Persisted key-value settings and [cached reads with `SettingsService`](./packages/settings/reading-and-caching.md).
- [`@veap/storage`](./packages/storage/index.md) — Local file storage and [Server Action uploads with custom cloud drivers](./packages/storage/uploads-and-drivers.md).
- [`@veap/ui`](./packages/ui/index.md) — Tailwind CSS v4 tokens, `ThemeProvider`, and [accessible Radix UI components](./packages/ui/components.md).
- [`create-veap`](./packages/create-veap/index.md) — Project scaffolding CLI and [starter template structure](./packages/create-veap/templates-and-options.md).

## Guides

Explore cross-cutting recipes and production best practices:

- [Testing Veap applications](./guides/testing.md) — container isolation, SQLite `:memory:` databases, `MemoryCookieStore`, and `BufferedOutput`.
- [Authoring and customizing plugins](./guides/custom-plugins.md) — scaffolding workspace plugins with `veap make:plugin`, ejecting npm plugins with `veap eject`, and publishing plugins.
- [Deployment and production readiness](./guides/deployment-and-production.md) — Docker containerization, Next.js `force-dynamic` boundaries, environment variables, CI migrations, and PaaS hosting.
- [Background tasks, queues, and distributed cache](./guides/background-jobs-and-cache.md) — non-blocking execution with `after()`, `EventBus` topics, BullMQ queue workers, and Redis caching.
- [Troubleshooting and frequently asked questions](./guides/troubleshooting.md) — solving database connection exhaustion, SQLite locks, migration recovery, CLI headers, and hydration warnings.

## Tutorials

Build complete end-to-end applications step by step:

- [Building a full-stack multilingual blog CMS](./tutorials/fullstack-blog-cms.md) — combine `@veap/database`, `@veap/translatable`, `@veap/taggable`, `@veap/auth`, and `@veap/plugins` into a working CMS.

## API reference

Look up subpath exports, IoC tokens, class methods, and CLI commands by package:

- **Core & infrastructure packages**: [`@veap/kernel`](./reference/packages/kernel.md), [`@veap/database`](./reference/packages/database.md), [`@veap/auth`](./reference/packages/auth.md), [`@veap/plugins`](./reference/packages/plugins.md), [`@veap/intl`](./reference/packages/intl.md), [`@veap/mail`](./reference/packages/mail.md), [`@veap/settings`](./reference/packages/settings.md), [`@veap/storage`](./reference/packages/storage.md), [`@veap/ui`](./reference/packages/ui.md), and [`create-veap`](./reference/packages/create-veap.md).
- **Polymorphic ORM traits**: [`@veap/translatable`](./reference/packages/translatable.md), [`@veap/taggable`](./reference/packages/taggable.md), [`@veap/categorizable`](./reference/packages/categorizable.md), and [`@veap/commentable`](./reference/packages/commentable.md).
- **Plugin & migration CLI tooling**: [Plugin CLI and generated files](./reference/plugins/cli.md).



