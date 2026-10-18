# Modular plugin system (`@veap/plugins`)

`@veap/plugins` enables Veap applications to be extended with self-contained feature modules. A single plugin (`IPlugin`) can contribute virtual pages and API routes, UI extension slots, drag-and-drop dashboard widgets, navigation links, database migrations, translations, and event listeners.

## Registering `PluginsServiceProvider`

In your composition root (`lib/veap.ts`), register `PluginsServiceProvider` and pass your `siteLayout` component along with the plugin array (typically combining generated registry plugins from `lib/plugins.gen.ts` with any local host plugins):

```ts
// lib/veap.ts
import { DatabaseServiceProvider } from "@veap/database";
import { Application } from "@veap/kernel";
import { PluginsServiceProvider } from "@veap/plugins";
import { SiteLayout } from "../components/site-layout";
import { plugins } from "./plugins.gen";

export const app = Application.configure()
  .use(DatabaseServiceProvider)
  .use(
    (c) =>
      new PluginsServiceProvider(c, {
        siteLayout: SiteLayout,
        plugins,
      }),
  )
  .withPlugins(plugins)
  .create();
```

## Authoring a plugin (`IPlugin`)

Every plugin implements the `IPlugin` interface from `@veap/plugins`, declaring a `manifest` (typically built via `createManifestFromPackageJson(pkg)` or defined inline for local host plugins) along with optional lifecycle hooks (`init`, `onMigrate`, `onEnable`, `onDisable`) and feature definitions (`routeTree`, `migrations`, `hooks`, `locales`, and nested `plugins`). Navigation items, dashboard widgets, and UI extension points are registered programmatically via `MenuService`, `WidgetService`, and `ExtensionService` inside `init()`:

```tsx
// lib/announcements-plugin.tsx
import { Inject } from "@veap/kernel";
import {
  ExtensionService,
  type IPlugin,
  MenuService,
  WidgetService,
} from "@veap/plugins";

export class AnnouncementsPlugin implements IPlugin {
  manifest = {
    id: "announcements",
    name: "Site Announcements",
    version: "1.0.0",
    description:
      "Adds a public navigation link, a header banner slot, and a dashboard widget",
    system: true,
    enabled: true,
  };

  async init(
    @Inject(MenuService) menuService: MenuService,
    @Inject(WidgetService) widgetService: WidgetService,
    @Inject(ExtensionService) extensionService: ExtensionService,
  ) {
    menuService.addPublicItem({
      id: "nav-announcements",
      title: "Announcements",
      url: "/announcements",
      priority: 20,
    });

    widgetService.addWidget({
      id: "announcements-summary",
      name: "Latest Announcements",
      area: "dashboard-main",
      component: () => <div className="p-4 text-sm">No active alerts.</div>,
      priority: 15,
    });

    extensionService.addExtension({
      id: "announcements-banner",
      target: "site:header",
      point: "banner",
      priority: 10,
      component: () => (
        <div className="bg-primary/10 px-4 py-1.5 text-center text-xs font-medium">
          Veap 0.2 is now live!
        </div>
      ),
    });
  }
}

export const announcementsPlugin = new AnnouncementsPlugin();
```

## Next steps

Continue exploring `@veap/plugins`:

- [Virtual routing, extension points, and widgets](./routing-and-ui.md) — Mount `VeapRouter` catch-all routes, render `<ExtensionPoint>` and `<WidgetArea>` slots, and manage plugins with the `veap` CLI.
