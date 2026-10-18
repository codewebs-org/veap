# Plugins and modular traits architecture

This guide explains the architectural design, plugin contracts, registry persistence, and polymorphic ORM trait patterns across the Veap ecosystem.

Veap distinguishes between core framework infrastructure (`packages/`), application-level modular plugins (`plugins/`), and polymorphic database traits. Understanding these boundaries ensures consistent ecosystem expansion.

## Architectural taxonomy: packages vs. plugins vs. traits

The ecosystem distinguishes between three building blocks based on their lifecycle and integration depth:

| Type | Location | Primary Purpose | How It Integrates |
|---|---|---|---|
| **Core Framework Package** | `packages/<name>` | Low-level runtime infrastructure (IoC, database ORM, authentication, mail, storage). | Registered via `ApplicationBuilder.use(ServiceProvider)`. Bound as singleton ports in the container. |
| **Modular Plugin** | `plugins/<name>` | Self-contained application features (for example, `blog-plugin`, `media-plugin`, `panel-plugin`). | Implements `IPlugin`. Provides virtual route trees, UI widget mounts, navigation items, and runtime toggles. |
| **ORM Trait** | `packages/veap-<name>` | Reusable model capabilities (for example, translations, tags, categories, comments). | Applied to `Model` subclasses. Uses polymorphic pivot tables without modifying target table schemas. |

## The `IPlugin` contract

Plugins implement the `IPlugin` interface defined in `@veap/plugins`:

```ts
import { Inject } from "@veap/kernel";
import {
  ExtensionService,
  type IPlugin,
  MenuService,
  type PluginManifest,
  WidgetService,
} from "@veap/plugins";

export const manifest: PluginManifest = {
  id: "media-manager",
  name: "Media Manager",
  version: "0.1.0",
  description: "Asset library and image management plugin.",
  dependencies: ["@veap/kernel", "@veap/database", "@veap/storage"],
};

export class MediaManagerPlugin implements IPlugin {
  manifest = manifest;

  // Database schema required by this plugin
  migrations = mediaMigrations;

  // Lifecycle hooks
  async init(
    @Inject(MenuService) menuService: MenuService,
    @Inject(WidgetService) widgetService: WidgetService,
    @Inject(ExtensionService) extensionService: ExtensionService,
  ) {
    // Register navigation contributions during container boot
    menuService.addAdminItem("media", {
      id: "media-library",
      title: "Media Library",
      url: "/media",
      icon: "image",
    });

    // Register dashboard widgets
    widgetService.addWidget({
      id: "media-stats",
      name: "Media Stats",
      area: "dashboard.overview",
      component: MediaStatsWidget,
    });

    // Register UI extension points
    extensionService.addExtension({
      id: "media-setup-dialog",
      target: "panel",
      point: "plugin-setup-dialogs",
      component: MediaSetupDialog,
    });
  }

  async onEnable() {
    // Fired when the plugin is enabled via admin UI or CLI
  }

  async onDisable() {
    // Fired when the plugin is disabled
  }

  // Virtual App Router tree
  routeTree = async () => {
    return discoverRoutes(mediaAppDir, (relPath) =>
      import(`../src/app/${relPath}`),
    );
  };
}

export const plugin = new MediaManagerPlugin();
```

### Plugin status persistence

Plugin state is persisted in the database `plugins` table (`SystemPlugin` model) and managed through `IPluginRepository`:

- `id`: Unique plugin identifier matching `manifest.id`.
- `enabled`: Boolean flag determining whether the plugin's routes, widgets, and navigation items are rendered.
- `installed`: Boolean flag indicating whether the plugin's database migrations have executed.
- `deleted`: Boolean flag indicating whether the plugin was marked as removed.
- `system`: If `true`, the plugin is core infrastructure and cannot be disabled from the UI.
- `config`: JSON string payload holding runtime configuration settings.

## Ecosystem registry (`veap-registry.json`)

Official and community plugins are registered in `veap-registry.json` at the root of `apps/veap-docs`:

```json
{
  "id": "blog-plugin",
  "name": "Blog Plugin",
  "package": "@veap/blog-plugin",
  "version": "0.1.0",
  "category": "content",
  "featured": true,
  "hasMigrations": true
}
```

This registry file is the source of truth for official plugins and modular
traits across the ecosystem. It is consumed by:
1. The documentation website (`apps/veap-docs`) to power the marketplace and
   plugin catalog.
2. Commitlint tooling (`commitlint.config.mjs`) to resolve valid commit scopes.
3. Continuous integration workflows to discover plugin workspaces.

## Polymorphic ORM traits

ORM traits provide vertical database features across diverse models without altering their core tables:

```
┌──────────────────┐       ┌──────────────────────┐
│     Articles     │       │       Products       │
│  id, title, slug │       │  id, name, sku, price │
└─────────┬────────┘       └──────────┬───────────┘
          │                           │
          └─────────────┬─────────────┘
                        │
                        ▼
          ┌───────────────────────────┐
          │        Translations       │
          │ translatable_type, ..._id │
          │ locale, field, value      │
          └───────────────────────────┘
```

### Available traits

The framework includes four core traits that share this polymorphic design:

| Trait Package | Schema Strategy | Key Capabilities |
|---|---|---|
| `@veap/translatable` | Shared `translations` table (`translatable_type`, `translatable_id`, `locale`, `field`, `value`). | Stores localized attribute strings without adding language columns to parent tables. |
| `@veap/taggable` | Shared `tags` and `taggables` pivot table (`taggable_type`, `taggable_id`, `tag_id`). | Enables tagging any model with support for tag slugging and counts. |
| `@veap/categorizable` | Shared `categories` and `categorizables` pivot table. | Hierarchical category trees with parent-child nesting. |
| `@veap/commentable` | Shared `comments` table (`commentable_type`, `commentable_id`, `parent_id`). | Threaded user discussions and review ratings. |

### Applying traits to models

Traits are applied to `Model` subclasses either by extending the trait base class (`TranslatableModel`) or by composing the mixin function (`Translatable`):

```ts
import { Model } from "@veap/database";
import { Translatable } from "@veap/translatable";

class BaseArticle extends Model {
  static override table = "articles";
}

export class Article extends Translatable(BaseArticle) {
  static translatable = ["title", "content", "summary"];
}
```

## Maintainer rules for plugins and traits

1. **Keep plugins out of core kernel:** Plugins must depend on `@veap/kernel`, never vice-versa.
2. **Handle disabled plugins gracefully:** Virtual routing and widget slots must safely render empty fallbacks when a plugin's `enabled` flag is `false`.
3. **Use unique migration scopes:** Plugin migrations must use their own scope (`runMigrations(plugin.id, plugin.migrations)`) to avoid collisions with the host application's `"app"` migration batch.
4. **Preserve polymorphic indexes:** When altering trait schemas, ensure compound indexes on `(<morph>_type, <morph>_id)` are maintained to preserve query performance across large datasets.
