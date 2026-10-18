# Veap plugins

The `plugins/` directory contains official modular plugins for the Veap
ecosystem.

In the Veap framework architecture, plugins provide self-contained, domain-level
features that integrate into applications dynamically. While core packages under
`packages/` provide low-level infrastructure (such as the IoC container,
database ORM, and storage drivers), plugins implement user-facing capabilities,
virtual route trees, and administrative interfaces.

## Plugin architecture

Plugins in Veap implement the `IPlugin` interface defined in `@veap/plugins`
and provide modular extensions to host applications.

Each plugin can contribute:

- **Virtual routes:** Dynamic App Router route trees mounted at runtime into the
  host application.
- **UI extension points:** Dashboard widgets, navigation menu items, and dialog
  slots registered through `WidgetService`, `MenuService`, and `ExtensionService`.
- **Database migrations:** Isolated database schema migrations executed under a
  dedicated plugin scope.
- **Lifecycle management:** Runtime enable and disable hooks (`onEnable`,
  `onDisable`) managed via database records in the `plugins` table.

<!-- prettier-ignore -->
> [!NOTE]
> Plugins must depend on framework packages (such as `@veap/kernel` and
> `@veap/plugins`), but core framework packages never depend on plugins.

## Plugin directory layout

Each plugin follows a standard layout to ensure consistent build and packaging
behavior across the workspace:

```
plugins/<name>/
├── src/
│   ├── index.ts        # Primary entry point exporting the IPlugin instance
│   ├── client.ts       # Client-safe exports and React components (if applicable)
│   ├── migrations/     # Scoped database schema migrations
│   └── ui/             # React views, widgets, and extension components
├── dist/               # Compiled TypeScript outputs
├── package.json        # Workspace package manifest
└── tsconfig.json       # TypeScript configuration with Node types and JSX support
```

## Development and build commands

You can build and develop plugins using workspace filters or root scripts.

To compile all plugins:

```bash
bun run build:plugins
```

To build a specific plugin during development:

```bash
bun --filter '<plugin-name>' build
```

To watch for changes during development:

```bash
bun --filter './plugins/**' dev
```

## Related documentation

For more details on plugin lifecycle design, registration persistence, and
guidelines on writing modular features:

- [Plugins & Modular Traits Maintainer Notes](../docs/maintainer-notes/plugins-and-traits.md)
- [Architecture & Ecosystem Design](../docs/maintainer-notes/architecture.md)
- [Public Developer Documentation](https://veap.pl/docs)
