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

### Client-side widgets and interactive extension points

In interactive Client Components (`"use client"`), import `<ExtensionPointClient>` and `<WidgetAreaClient>` from `@veap/plugins/client`:

```tsx
"use client";

import { ExtensionPointClient, WidgetAreaClient } from "@veap/plugins/client";

export function ClientDashboard() {
  return (
    <div>
      <ExtensionPointClient target="user:profile" point="actions" />
      <WidgetAreaClient area="user:stats" />
    </div>
  );
}
```

### Dynamic breadcrumbs (`getPluginBreadcrumbs`)

The plugin router automatically generates breadcrumb hierarchies by traversing route nodes and navigation definitions:

```tsx
import { getPluginBreadcrumbs } from "@veap/plugins";

export default async function BreadcrumbsBar({ path }: { path: string }) {
  const crumbs = await getPluginBreadcrumbs(path);

  return (
    <nav className="flex space-x-2 text-sm text-muted-foreground">
      {crumbs.map((crumb, idx) => (
        <span key={idx}>
          {crumb.url ? <a href={crumb.url}>{crumb.label}</a> : crumb.label}
          {idx < crumbs.length - 1 && " / "}
        </span>
      ))}
    </nav>
  );
}
```

### Confirming sensitive actions (`useConfirmAction`)

The `useConfirmAction()` hook from `@veap/plugins/client` provides a standard confirmation prompt before executing high-risk Server Actions (such as deleting databases or revoking tokens):

```tsx
"use client";

import { useConfirmAction } from "@veap/plugins/client";
import { deleteWorkspaceAction } from "@/app/actions/workspace";

export function DeleteWorkspaceButton({ id }: { id: string }) {
  const confirm = useConfirmAction();

  const handleDelete = async () => {
    const result = await confirm({
      title: "Delete Workspace",
      description: "This will permanently delete all records. Are you sure?",
    });

    if (result.confirmed) {
      await deleteWorkspaceAction(id);
    }
  };

  return <button onClick={handleDelete}>Delete Workspace</button>;
}
```

If `@veap/action-confirm-plugin` is enabled, it presents a modal password/biometric challenge. If the plugin is disabled, it falls back to native browser confirmation.

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
