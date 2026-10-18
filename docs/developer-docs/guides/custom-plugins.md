# Authoring and customizing plugins

Veap lets you extend your application with modular plugins in two ways: scaffolding a new local plugin from scratch with `bun veap make:plugin`, or taking local ownership of an installed npm plugin with `bun veap eject`.

## Scaffolding a local plugin (`veap make:plugin`)

Run `bun veap make:plugin <name>` from your project root to scaffold a new workspace plugin inside `plugins/<name>-plugin/`:

```bash
bun veap make:plugin newsletter
```

The command creates three files (`package.json`, `tsconfig.json`, and `src/index.ts`), adds `"@veap/newsletter-plugin": "workspace:*"` to your root `package.json`, ensures `"plugins/*"` is listed in `workspaces`, and regenerates `lib/plugins.gen.ts`:

```ts
// plugins/newsletter-plugin/src/index.ts
import type { IPlugin } from "@veap/plugins";
import { createManifestFromPackageJson } from "@veap/plugins";
import pkg from "../package.json" with { type: "json" };

export class NewsletterPlugin implements IPlugin {
  manifest = createManifestFromPackageJson(pkg);

  async init(): Promise<void> {
    // Initialize plugin when the registry boots
  }

  async onEnable(): Promise<void> {
    // Called when the plugin is enabled
  }

  async onDisable(): Promise<void> {
    // Called when the plugin is disabled
  }
}

export default new NewsletterPlugin();
```

Because the generated plugin is a class, you can inject any service registered in the IoC container—such as `MenuService`, `WidgetService`, `ExtensionService`, or `AuthService`—directly into its lifecycle methods (`init`, `onMigrate`, `onEnable`, `onDisable`) using the `@Inject` parameter decorator from `@veap/kernel`:

```ts
import { AuthService } from "@veap/auth";
import { Inject } from "@veap/kernel";
import {
  createManifestFromPackageJson,
  ExtensionService,
  type IPlugin,
  MenuService,
  WidgetService,
} from "@veap/plugins";
import pkg from "../package.json" with { type: "json" };

export class NewsletterPlugin implements IPlugin {
  manifest = createManifestFromPackageJson(pkg);

  async init(
    @Inject(MenuService) menuService: MenuService,
    @Inject(WidgetService) widgetService: WidgetService,
    @Inject(ExtensionService) extensionService: ExtensionService,
    @Inject(AuthService) authService: AuthService,
  ): Promise<void> {
    menuService.addPublicItem({
      id: "newsletter-link",
      title: "Newsletter",
      url: "/newsletter",
      priority: 30,
    });
  }
}

export default new NewsletterPlugin();
```

## Contributing routes, extensions, and migrations

A single `IPlugin` implementation can bundle database schema migrations, virtual App Router routes (`routeTree` with `discoverRoutes`), UI extension slots (registered via `ExtensionService`), data hooks (`hooks`), and dynamic locale loaders (`locales`):

```tsx
// plugins/newsletter-plugin/src/index.ts
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { type Migration, Schema } from "@veap/database";
import { Inject } from "@veap/kernel";
import {
  createManifestFromPackageJson,
  ExtensionService,
  type IPlugin,
} from "@veap/plugins";
import { discoverRoutes } from "@veap/plugins/router";
import pkg from "../package.json" with { type: "json" };

const createSubscribersMigration: Migration = {
  name: "20261015_create_newsletter_subscribers",
  async up() {
    await Schema.create("newsletter_subscribers", (table) => {
      table.increments("id").primary();
      table.string("email").notNullable().unique();
      table.timestamps(true, true);
    });
  },
  async down() {
    await Schema.dropIfExists("newsletter_subscribers");
  },
};

export class NewsletterPlugin implements IPlugin {
  manifest = createManifestFromPackageJson(pkg);
  migrations = [createSubscribersMigration];

  async init(
    @Inject(ExtensionService) extensionService: ExtensionService,
  ): Promise<void> {
    extensionService.addExtension({
      id: "newsletter-footer-cta",
      target: "site:footer",
      point: "cta",
      priority: 50,
      component: () => (
        <a href="/newsletter" className="text-sm underline">
          Join the newsletter
        </a>
      ),
    });
  }

  routeTree = async () => {
    const appDir = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "app",
    );
    return discoverRoutes(appDir, (relPath) => import(`./app/${relPath}`));
  };

  hooks = [
    {
      point: "newsletter:subscriber:before_create",
      priority: 10,
      handler: async (data) => ({
        ...data,
        email: data.email.trim().toLowerCase(),
      }),
    },
  ];
}

export default new NewsletterPlugin();
```

## Taking ownership of an npm plugin (`veap eject`)

When you install an official or community plugin with `bun veap add @veap/blog-plugin` and later need to customize its React components, database models, or route handlers, run `bun veap eject`:

```bash
bun veap eject @veap/blog-plugin
```

`veap eject` clones the plugin's Git repository into `plugins/blog-plugin`, rewrites your `package.json` dependency to `"@veap/blog-plugin": "workspace:*"`, links the workspace package, and regenerates `lib/plugins.gen.ts` without changing any package import specifiers in your application.

## Packaging and publishing plugins

When your local plugin is ready to be shared with the community or published to npm:

### 1. Configure `package.json`

Ensure your plugin's `package.json` exports its main entry file and declares required framework dependencies:

```json
{
  "name": "@my-org/newsletter-plugin",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts"
  },
  "peerDependencies": {
    "@veap/kernel": "^0.1.0",
    "@veap/plugins": "^0.1.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0"
  }
}
```

### 2. Publish to npm

Log in to npm and publish your package:

```bash
# Verify contents before publishing
npm pack --dry-run

# Publish public package
npm publish --access public
```

### 3. Registering in the official Veap registry

To list your published plugin in the official Veap Marketplace (`veap.pl/plugins`), open a pull request on GitHub adding your plugin metadata to `apps/veap-docs/veap-registry.json`:

```json
{
  "id": "newsletter-plugin",
  "slug": "newsletter-plugin",
  "name": "Veap Newsletter",
  "package": "@my-org/newsletter-plugin",
  "version": "1.0.0",
  "category": "content",
  "type": "plugin",
  "description": "Email newsletter subscription and campaign management plugin.",
  "purpose": "Collects subscriber emails, manages double opt-in verification, and sends newsletters.",
  "installation": {
    "command": "bun veap add @my-org/newsletter-plugin",
    "steps": [
      "Run: `bun veap add @my-org/newsletter-plugin`",
      "The CLI registers the plugin in `lib/plugins.gen.ts`"
    ]
  },
  "repository": "https://github.com/my-org/newsletter-plugin"
}
```

