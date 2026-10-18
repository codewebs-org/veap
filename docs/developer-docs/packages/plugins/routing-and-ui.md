# Virtual routing, extension points, and widgets

`@veap/plugins` provides `VeapRouter` for serving virtual page and API routes, `<ExtensionPoint>` and `<WidgetArea>` components for injecting plugin UI into host layouts, and CLI commands for installing, scaffolding, and ejecting plugins.

## Virtual routing (`VeapRouter`)

To let active plugins serve pages and REST endpoints without modifying your `app/` directory every time a plugin is added or toggled, mount two thin catch-all forwarders in Next.js:

1. **Page forwarder (`app/[...catchAll]/page.tsx`)**: Builds the route tree with `buildRouteTree(true)` and renders `await VeapRouter({ tree, path, searchParams })`.
2. **API forwarder (`app/api/[...catchAll]/route.ts`)**: Builds the route tree and dispatches incoming requests with `handleVeapApiRequest(request, { tree, path, searchParams })` or custom `runApiPipeline()`.

Any physical route file you place in `app/` takes precedence over virtual plugin routes at the same path.

## UI extension points and widget areas

Host layouts and pages expose named slots where enabled plugins can inject React components or customizable dashboard widgets:

```tsx
// Server Component slot rendering
import { ExtensionPoint, WidgetArea } from "@veap/plugins/server";

export async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <ExtensionPoint target="site:header" point="banner" />
      <main>{children}</main>
      <WidgetArea area="admin:dashboard" />
    </div>
  );
}
```

## Managing plugins from the CLI

`PluginsServiceProvider` registers six CLI commands in `@veap/kernel/cli` for managing plugins and regenerating `lib/plugins.gen.ts`:

```bash
# List all registered plugins and their status
bun veap list-plugins

# Install a plugin package and regenerate lib/plugins.gen.ts
bun veap add @veap/blog-plugin

# Scaffold a new local plugin in plugins/<name>-plugin
bun veap make:plugin newsletter

# Eject an npm plugin into plugins/blog-plugin as a local workspace package
bun veap eject @veap/blog-plugin

# Rescan package.json and regenerate lib/plugins.gen.ts
bun veap plugins:sync
```
