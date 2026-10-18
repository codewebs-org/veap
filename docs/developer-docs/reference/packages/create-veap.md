# `create-veap` CLI reference

`create-veap` is the standalone CLI initializer package invoked by `bun create veap`, `pnpm create veap`, `npm create veap`, and `yarn create veap` to scaffold new Veap + Next.js App Router projects.

## Binary and invocation

The package exposes a single binary entry point (`create-veap`) and accepts an optional positional project directory argument followed by CLI flags:

```bash
bun create veap [project-directory] [options]
```

## CLI options

All command-line flags parsed by `create-veap`:

| Flag | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `[project-directory]` | Positional string | `"veap-project"` | Target directory where the project is scaffolded. |
| `--name <name>` | `string` | `"veap-project"` | Explicit project name (overrides positional directory argument). |
| `--template <name>` | `string` | `"01-basic"` | Built-in starter template to copy from `templates/`. |
| `--choose` | `boolean` | `false` | Forces an interactive prompt to select from available built-in templates. |
| `--example <url>` | `string` | — | Clones and extracts a starter project directly from a GitHub repository URL or branch path. |
| `--skip-install` | `boolean` | `false` | Skips running `<packageManager> install` after copying template files. |
| `--help`, `-h` | `boolean` | `false` | Prints usage instructions and exits. |

## Environment detection and behavior

When executed, `create-veap` performs the following sequence:

1. **Package manager detection**: Reads `process.env.npm_config_user_agent` to detect `bun`, `pnpm`, `yarn`, or `npm`.
2. **Interactive fallback**: If no project name or `--name` is passed, prompts for the project directory using `@clack/prompts` and asks for confirmation before overwriting a non-empty directory.
3. **Package name normalization**: Validates and normalizes the target directory name into a valid `package.json` `name` field.
4. **Template or example extraction**: Copies the selected built-in template (such as `01-basic`) or downloads and extracts the GitHub repository specified via `--example`.
5. **Dependency installation**: Unless `--skip-install` is passed, spawns `<packageManager> install` in the newly created project directory and checks for newer versions of `create-veap`.
