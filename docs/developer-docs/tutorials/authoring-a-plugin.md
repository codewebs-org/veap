# Authoring a custom Veap plugin

This tutorial guides you through creating, testing, and packaging a custom plugin for the Veap ecosystem.

We will build `@acme/newsletter-plugin`—a modular feature that contributes:
1. An email subscriber database table with scoped migrations.
2. A public virtual subscription route (`/newsletter`).
3. An administrative dashboard widget displaying subscriber metrics.
4. An admin sidebar navigation link under `/admin`.

---

## Step 1: Scaffold the plugin directory

Use the `veap make:plugin` command from your application root to generate a standard plugin skeleton:

```bash
bun veap make:plugin newsletter
```

This creates `plugins/newsletter-plugin/` with the recommended layout and configures `"plugins/*"` in your root `package.json` workspaces.

```
plugins/newsletter-plugin/
├── src/
│   ├── index.ts             # Primary entry point implementing IPlugin
│   ├── client.ts            # Client-safe exports and React components
│   ├── migrations/          # Scoped database migrations
│   ├── models/              # Active Record models
│   └── ui/                  # Dashboard widgets and pages
├── package.json
└── tsconfig.json
```

---

## Step 2: Define the `Subscriber` model and migration

### 1. Database migration

Create a reversible schema migration in `plugins/newsletter-plugin/src/migrations/0001_create_subscribers_table.ts`:

```ts
// src/migrations/0001_create_subscribers_table.ts
import { type Migration, Schema } from "@veap/database";

export const createSubscribersTable: Migration = {
  name: "20261018000000_create_subscribers_table",
  async up() {
    await Schema.create("newsletter_subscribers", (table) => {
      table.increments("id").primary();
      table.string("email").notNullable().unique();
      table.string("status").notNullable().defaultTo("active");
      table.timestamps(true, true);
    });
  },
  async down() {
    await Schema.dropIfExists("newsletter_subscribers");
  },
};
```

Export the migration list in `src/migrations/index.ts`:

```ts
// src/migrations/index.ts
import { createSubscribersTable } from "./0001_create_subscribers_table";

export const newsletterMigrations = [createSubscribersTable];
```

### 2. Active Record model

Create the `Subscriber` model in `src/models/subscriber.ts`:

```ts
// src/models/subscriber.ts
import { Model } from "@veap/database";

export class Subscriber extends Model {
  static override table = "newsletter_subscribers";

  declare id: number;
  declare email: string;
  declare status: string;
  declare created_at: string;
  declare updated_at: string;
}
```

---

## Step 3: Create the dashboard widget

Create an analytics card component in `src/ui/newsletter-stats-widget.tsx`:

```tsx
// src/ui/newsletter-stats-widget.tsx
import { Subscriber } from "../models/subscriber";

export async function NewsletterStatsWidget() {
  const count = await Subscriber.query()
    .where("status", "active")
    .count();

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-medium text-muted-foreground">
        Newsletter Subscribers
      </h3>
      <p className="mt-2 text-3xl font-bold">{count}</p>
      <span className="text-xs text-emerald-600">Active and subscribed</span>
    </div>
  );
}
```

---

## Step 4: Implement the `IPlugin` entry point (`src/index.ts`)

Tie everything together in `src/index.ts`. Implement the `IPlugin` interface and use dependency injection in the `init` hook to register menu items and dashboard widgets:

```ts
// src/index.ts
import {
  type IPlugin,
  type MenuService,
  type PluginManifest,
  type WidgetService,
} from "@veap/plugins";
import { Inject } from "@veap/kernel";
import { newsletterMigrations } from "./migrations/index";
import { NewsletterStatsWidget } from "./ui/newsletter-stats-widget";
import pkg from "../package.json";

export class NewsletterPlugin implements IPlugin {
  manifest: PluginManifest = {
    id: "newsletter-plugin",
    name: "Newsletter",
    version: pkg.version ?? "0.1.0",
    description: "Email newsletter management and subscriber widgets.",
  };

  migrations = newsletterMigrations;

  async init(
    @Inject("MenuService") menuService: MenuService,
    @Inject("WidgetService") widgetService: WidgetService,
  ): Promise<void> {
    // 1. Register admin sidebar navigation
    menuService.addAdminItem("marketing", {
      id: "newsletter-subscribers",
      label: "Subscribers",
      url: "/admin/newsletter",
      priority: 20,
    });

    // 2. Register dashboard widget
    widgetService.addWidget({
      id: "newsletter:stats",
      name: "Newsletter Stats",
      area: "admin:dashboard",
      component: NewsletterStatsWidget,
      defaultColSpan: 1,
      defaultRowSpan: 1,
      priority: 50,
    });
  }

  async onEnable(): Promise<void> {
    // Lifecycle hook called when administrator enables the plugin
  }

  async onDisable(): Promise<void> {
    // Lifecycle hook called when administrator disables the plugin
  }
}

export default new NewsletterPlugin();
```

---

## Step 5: Test and enable the plugin

Regenerate your application's static plugin registry:

```bash
bun veap plugins:sync
```

Start the development server:

```bash
bun dev
```

1. The plugin database migrations execute automatically during startup.
2. Visit `/admin` to verify that `NewsletterStatsWidget` renders in the admin dashboard widget area.
3. Check the admin navigation sidebar to confirm the `Subscribers` menu link appears under `Marketing`.

---

## Step 6: Distribute and eject

- **Distributing**: Publish your plugin to npm as `@acme/newsletter-plugin`. Other developers install it with `bun veap add @acme/newsletter-plugin`.
- **Ejecting**: If your application consumes a third-party plugin from npm and you need full source-level customization, run `bun veap eject <package>` to clone its source code directly into your local `plugins/` workspace.
