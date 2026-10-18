# Installation and scaffolding

You can start a new Veap project in seconds using the official `create-veap` scaffolding CLI, or install individual `@veap/*` packages into an existing Next.js application.

## Prerequisites

Before installing Veap, verify that your development environment meets the following requirements:

- **Node.js 24+** or **Bun 1.2+** (Bun is recommended for workspace scripts and the `veap` CLI).
- **Next.js 15 or 16** with the App Router and **React 19** when building full-stack web applications.
- For SQLite development (`better-sqlite3`), standard C/C++ build tools if prebuilt binaries are unavailable for your operating system.

## Scaffold a new project with `create-veap`

The fastest way to create a new application is with `create-veap`. It initializes a ready-to-run Next.js App Router project preconfigured with `@veap/kernel`, Tailwind CSS v4, TypeScript, `lib/veap.ts`, and `instrumentation.ts`.

Run the initializer with your preferred package manager:

```bash
# Using Bun (recommended)
bun create veap my-app

# Using pnpm
pnpm create veap my-app

# Using npm
npm create veap my-app
```

When run in an interactive terminal without flags, `create-veap` prompts you for the project directory name and template selection.

### CLI options

Pass command-line flags to `create-veap` for non-interactive setups or custom templates:

| Flag | Description |
| --- | --- |
| `--name <name>` | Specify the project name up front, skipping the interactive name prompt. |
| `--template <name>` | Select a built-in template (for example, `01-basic`). |
| `--example <url>` | Scaffold from a GitHub repository URL or branch subfolder instead of a built-in template. |
| `--choose` | Force interactive template selection even when a default template is available. |
| `--skip-install` | Generate project files without running package installation. |
| `--help`, `-h` | Print usage information and available flags. |

For example, to scaffold a project non-interactively using the `01-basic` template:

```bash
bun create veap my-app --template 01-basic
```

Once scaffolding finishes, start the development server:

```bash
cd my-app
bun dev
```

## Add Veap to an existing Next.js project

If you already have a Next.js App Router project, you can install `@veap/kernel` and only the feature packages you need.

### 1. Install `@veap/kernel`

Every Veap package builds on top of `@veap/kernel`:

```bash
bun add @veap/kernel
```

### 2. Install optional feature packages

Install additional packages based on your application's requirements:

```bash
# Database ORM + SQLite driver (or pg / mysql2)
bun add @veap/database better-sqlite3

# Authentication, sessions, and RBAC
bun add @veap/auth

# Plugin engine, virtual router, and UI extension points
bun add @veap/plugins

# Internationalization, mail, settings, storage, and UI components
bun add @veap/intl @veap/mail @veap/settings @veap/storage @veap/ui
```

<!-- prettier-ignore -->
> [!NOTE]
> `@veap/database` declares database drivers (`better-sqlite3`, `pg`, `mysql2`) as optional peer dependencies. Install the driver that matches your `DB_CLIENT` configuration.

### 3. Enable TypeScript decorator metadata

If you use the `@Injectable()` and `@Inject()` decorators from `@veap/kernel`, ensure `experimentalDecorators` is enabled in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Next steps

Now that your packages are installed, configure your application composition root:

- [Your first application](./first-application.md) — create `lib/veap.ts`, register service providers, and boot the container.
- [Next.js integration](./nextjs-integration.md) — connect `lib/veap.ts` to Next.js `instrumentation.ts`, Server Components, and Server Actions.
