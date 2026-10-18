# `@veap/plugins` API reference

`@veap/plugins` provides the modular plugin contract (`IPlugin`), virtual page and API routing (`VeapRouter`), server and client UI extension slots (`ExtensionPoint`, `ExtensionPointClient`), customizable dashboard widgets (`WidgetArea`, `WidgetAreaClient`), and CLI plugin management commands.

## Subpath exports

`@veap/plugins` exposes eight entry points in `package.json`:

| Subpath | Description |
| :--- | :--- |
| `@veap/plugins` | Core plugin types (`IPlugin`, `PluginManifest`), `PluginsServiceProvider`, extension and widget services, and `.withPlugins()` builder extension. |
| `@veap/plugins/server` | Server-side React components (`ExtensionPoint`, `WidgetArea`) and plugin registry services. |
| `@veap/plugins/client` | Client-side React components and hooks (`ExtensionPointClient`, `WidgetAreaClient`, `WidgetComposer`, `useConfirmAction`). |
| `@veap/plugins/actions` | Server Actions for enabling/disabling plugins and saving user widget layouts. |
| `@veap/plugins/router` | `VeapRouter` virtual page and API route dispatcher. |
| `@veap/plugins/models` | Active Record models (`SystemPlugin`, `SystemUserWidget`). |
| `@veap/plugins/migrations` | Knex migrations for `system_plugins` and `system_user_widgets` tables. |
| `@veap/plugins/cli` | CLI command classes (`ListPluginsCommand`, `AddPluginCommand`, `RemovePluginCommand`, `EjectPluginCommand`, `MakePluginCommand`, `PluginsSyncCommand`) and programmatic helpers (`addPlugin`, `removePlugin`, `ejectPlugin`, `generatePlugin`, `regeneratePluginsRegistry`). |

## The `IPlugin` contract

Every Veap plugin exports an object implementing `IPlugin`:

| Property / Hook | Type | Description |
| :--- | :--- | :--- |
| `manifest` | `PluginManifest` | Required metadata (`id`, `name`, `version`, `description?`, `enabled?`, `system?`, `hasSetup?`, `dependencies?`, `extends?`, `author?`), typically created via `createManifestFromPackageJson(pkg)`. |
| `init?(...args)` | `(...args: any[]) => Promise<void> \| void` | Lifecycle hook called every time the plugin registry initializes for an enabled plugin. Supports `@Inject(token)` parameter injection on class plugins. |
| `onMigrate?(...args)` | `(...args: any[]) => Promise<void> \| void` | Lifecycle hook called after migrations complete during initial plugin installation. Supports `@Inject(token)` parameter injection. |
| `onEnable?(...args)` | `(...args: any[]) => Promise<void> \| void` | Lifecycle hook called when the plugin is enabled (receives `context` and supports `@Inject(token)` parameter injection). |
| `onDisable?(...args)` | `(...args: any[]) => Promise<void> \| void` | Lifecycle hook called when the plugin is disabled. Supports `@Inject(token)` parameter injection. |
| `migrations?` | `Migration[]` | Database migrations executed automatically when the plugin is enabled and rolled back when disabled. |
| `routeTree?` | `RouteNode \| (() => Promise<RouteNode> \| RouteNode)` | App Router-style route tree definition, typically built via `discoverRoutes(appDir, loader)`. |
| `hooks?` | `PluginHook[]` | Filter/transform hooks (`{ point, handler, priority? }`) invoked via `applyPluginFilters(point, data, context)`. |
| `locales?` | `Record<string, () => Promise<{ default: any }>>` | Dynamic locale dictionary loaders merged into `@veap/intl`. |
| `plugins?` | `IPlugin[]` | Nested sub-plugins registered recursively alongside the parent plugin. |

## Navigation management (`MenuService`)

Plugins register navigation links programmatically via `MenuService` (typically injected into `init(@Inject(MenuService) menuService: MenuService)`):

- **`menuService.addPublicItem(item, pluginId?)`**: Registers a public site navigation item.
- **`menuService.addAdminItem(groupId, item, pluginId?)`**: Registers a navigation item in an admin panel sidebar group.
- **`menuService.addSettingsItem(groupId, item, pluginId?)`**: Registers a navigation item in a settings sidebar group.
- **`menuService.addGroup(section, group, pluginId?)`**: Registers or updates an admin or settings navigation group (`title`, `priority`, `items`).
- **`menuService.register(navigation, pluginId?)`**: Bulk-registers `public`, `admin`, and `settings` navigation definitions.

## Dashboard widgets (`WidgetService`)

Plugins register dashboard widgets programmatically via `WidgetService` (typically injected into `init(@Inject(WidgetService) widgetService: WidgetService)`):

- **`widgetService.addWidget(widget, pluginId?)`**: Registers a single `PluginWidget` (`{ id, name, area, component, priority?, defaultColSpan?, defaultRowSpan?, roles?, permissions? }`).
- **`widgetService.addWidgets(widgets, pluginId?)`**: Registers multiple `PluginWidget` definitions.
- **`widgetService.register(widgetOrWidgets, pluginId?)`**: Registers a single widget or an array of widgets.
- **`widgetService.getWidgets(area, context?)`**: Resolves enabled widgets for `area`, filtered by roles and permissions and sorted by priority.

## UI extension points (`ExtensionService`)

Plugins register UI extension components programmatically via `ExtensionService` (typically injected into `init(@Inject(ExtensionService) extensionService: ExtensionService)`):

- **`extensionService.addExtension(extension, pluginId?)`**: Registers a single `PluginExtension` (`{ id, target, point, component, priority?, roles?, permissions? }`) injected into `<ExtensionPoint>` slots.
- **`extensionService.addExtensions(extensions, pluginId?)`**: Registers multiple `PluginExtension` definitions.
- **`extensionService.register(extensionOrExtensions, pluginId?)`**: Registers a single extension or an array of extensions.
- **`extensionService.getExtensions(target, point, includeDisabled?, context?)`**: Resolves extensions for `(target, point)`, filtered by roles and permissions and sorted by priority.
- **`extensionService.hasExtension(target, point?)`**: Checks whether any enabled plugin registers an extension matching `target` (and optional `point`).

## Virtual routing (`VeapRouter`)

`@veap/plugins/router` dispatches incoming Next.js catch-all requests to matching plugin routes:

- **`discoverRoutes(appDir, importFn)`**: Scans a plugin's `src/app/` directory and constructs a `RouteNode` tree for `IPlugin.routeTree`.
- **`VeapRouter({ tree, path, searchParams })`**: Async React Server Component used in `app/[...catchAll]/page.tsx` to match and render plugin pages nested within matching layout chains.
- **`handleVeapApiRequest(request, { tree, path, searchParams })`**: Dispatches API requests in `app/api/[...catchAll]/route.ts`, resolving plugin route handlers, running middleware pipelines, and enforcing RBAC permissions.
- **`buildRouteTree(includeDynamic?: boolean)`**: Scans and constructs the unified hierarchical `RouteTree` from all active plugins.

