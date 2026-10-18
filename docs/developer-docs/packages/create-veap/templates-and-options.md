# CLI options and template structure

`create-veap` supports non-interactive CLI flags for automated pipelines and generates a pre-configured Next.js 16 App Router workspace.

## Command-line options

Pass flags directly to `create-veap` for non-interactive or CI workflows:

| Option | Shorthand | Description |
| :--- | :--- | :--- |
| `--template <name>` | `-t <name>` | Selects the starter template (defaults to `01-basic`). |
| `--skip-install` | — | Copies and configures project files without running package installation. |
| `--help` | `-h` | Prints CLI usage instructions and available options. |

```bash
bun create veap my-app --template 01-basic --skip-install
```

## Package manager detection

`create-veap` inspects the `npm_config_user_agent` environment variable to detect whether you invoked it via `bun`, `pnpm`, `npm`, or `yarn`, and runs `<packageManager> install` automatically using the matching tool.

## Built-in templates

`create-veap` provides built-in starter templates for different application architectures:

### `01-basic` (Next.js App Router)

The default template sets up a ready-to-run Next.js 16 App Router workspace with React 19, TypeScript, and Tailwind CSS v4:

- **`lib/veap.ts`**: Application composition root (`Application.configure()...create()`) and the `initializeSystem()` bootstrap helper.
- **`instrumentation.ts`**: Next.js server startup hook (`register()`) guarded for the `nodejs` runtime.
- **`app/`**: Next.js App Router layout (`app/layout.tsx`), global Tailwind CSS v4 styles (`app/globals.css`), and starter landing page (`app/page.tsx`).
- **`.env`**: Pre-populated environment variable placeholders (`DATABASE_URL`, `NODE_ENV`).
- **`AGENTS.md`**: Contextual instructions for AI coding assistants working inside your project.

### `02-hono` (Hono microservice and REST API)

A lightweight API service starter pairing [Hono](https://hono.dev) with `@veap/kernel`:

- **`src/veap.ts`**: Veap composition root with Hono cookie and header transport adapters and bootstrap lifecycle.
- **`src/providers/app.provider.ts`**: Modular `ServiceProvider` binding application services into the IoC container.
- **`src/services/greeting.service.ts`**: Example domain service resolved from the IoC container.
- **`src/index.ts`**: Hono routing with `contextStorage()` middleware and universal runtime support (Node.js and Bun).

## Scaffolding from remote Git repositories (`--example`)

You can scaffold a new project using any public GitHub repository or monorepo subfolder as the starter template by passing `--example <url>`:

```bash
# Scaffold from a specific repository branch or directory
bun create veap my-app --example https://github.com/veapjs/veap/tree/main/templates/01-basic

# Scaffold from a community starter kit
bun create veap my-app --example https://github.com/username/my-custom-veap-starter
```

`create-veap` fetches the repository archive, extracts the directory contents into your target folder, updates the `package.json` project name, and runs your active package manager's install process.

## Authoring custom project templates

When creating reusable team starters or enterprise boilerplate templates:

1. **Structure standard files**: Include `package.json`, `tsconfig.json`, `next.config.ts`, `lib/veap.ts`, and an `.env.example` file.
2. **Exclude build artifacts and secrets**: Do not commit `node_modules/`, `.next/`, `bun.lock`, or private `.env` files to template repositories.
3. **Use standard peer dependencies**: Declare exact semver versions for `@veap/*` framework dependencies matching the current release.
4. **Provide onboarding instructions**: Include an `AGENTS.md` file and a `README.md` explaining environment variable requirements and initial migration steps (`bun veap migrate`).
