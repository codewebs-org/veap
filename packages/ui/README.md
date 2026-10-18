
[![Version](https://img.shields.io/npm/v/@veap%2Fui?style=flat-square&color=181717&logo=npm&logoColor=959da5)](https://www.npmjs.com/package/@veap/ui)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?style=flat-square&logo=discord&logoColor=959da5)](https://discord.gg/qTkrCwpMW)

# @veap/ui

Accessible, composable component library and design system for [Veap](https://veap.pl) and Next.js applications.

## Overview

`@veap/ui` provides a collection of modern, accessible React components built on
top of Radix UI primitives and styled with Tailwind CSS v4. Designed for the
Veap ecosystem, it includes foundational atomic components as well as
high-level framework elements such as layout loaders, theme providers, and MDX
rendering helpers.

## Features

- **Accessible primitives**: Built on Radix UI, adhering to WAI-ARIA authoring
  practices.
- **Tailwind CSS v4 ready**: Ships with design tokens, CSS variables, and OKLCH
  color palettes supporting light and dark themes.
- **Framework integration**: Pre-built components for Veap navigation, user
  feedback, toast notifications (`sonner`), and icons (`@iconify/react`).
- **Full TypeScript support**: Strongly typed component props with CVA
  (Class Variance Authority) variants.

## Installation

Install `@veap/ui` alongside required peer dependencies in your project:

```bash
# Using bun
bun add @veap/ui @iconify/react lucide-react next react react-dom

# Using pnpm
pnpm add @veap/ui @iconify/react lucide-react next react react-dom

# Using npm
npm install @veap/ui @iconify/react lucide-react next react react-dom
```

## Setup Styles

Import the component library styles in your root CSS file (for example,
`app/globals.css`):

```css
@import "tailwindcss";
@import "@veap/ui/globals.css";
```

## Usage

Import components directly from `@veap/ui` or use dedicated entry points:

### Basic Component Example

```tsx
import { Button } from "@veap/ui";

export function Example() {
  return (
    <Button variant="default" size="default">
      Click me
    </Button>
  );
}
```

### Theme Provider Example

Wrap your root application tree with `ThemeProvider` to enable dark mode
support:

```tsx
import { ThemeProvider } from "@veap/ui";

export function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Available Components

`@veap/ui` includes more than 40 accessible components:

| Category | Components |
| --- | --- |
| **Actions & Triggers** | `Button`, `ButtonGroup`, `Toggle`, `ToggleGroup` |
| **Data Display** | `Avatar`, `Badge`, `Card`, `Table`, `Kbd`, `Separator`, `Empty` |
| **Feedback & Status** | `Alert`, `AlertDialog`, `Progress`, `Skeleton`, `Spinner`, `Sonner` |
| **Forms & Inputs** | `Checkbox`, `Field`, `Form`, `Input`, `InputGroup`, `InputOTP`, `Label`, `RadioGroup`, `Select`, `Slider`, `Switch`, `Textarea` |
| **Navigation & Menus** | `Breadcrumb`, `Command`, `ContextMenu`, `DropdownMenu`, `Menubar`, `NavigationMenu`, `Pagination`, `Sidebar`, `Tabs` |
| **Overlays & Popups** | `Dialog`, `Drawer`, `HoverCard`, `Popover`, `Sheet`, `Tooltip` |
| **Layout & Feedback** | `PageLoader`, `AccessDenied`, `ScrollFadeEffect`, `Logo` |

## Subpath Exports

The package provides organized entry points:

| Export Path | Content |
| --- | --- |
| `@veap/ui` | All core UI components, hooks, and utility functions (`cn`) |
| `@veap/ui/globals.css` | CSS tokens, color variables, and dark mode variant rules |
| `@veap/ui/providers` | `ThemeProvider` integration based on `next-themes` |
| `@veap/ui/logo` | Official Veap vector logo variants |
| `@veap/ui/shared/*` | Shared layout elements (`PageLoader`, `AccessDenied`) |
| `@veap/ui/components/*` | Direct imports for individual components |

## Documentation

For full guides, live examples, and framework integration patterns, visit:
- **Official Website**: [https://veap.pl](https://veap.pl)
- **Documentation**: [https://veap.pl/docs](https://veap.pl/docs)
- **GitHub Repository**: [https://github.com/veapjs/veap-ui](https://github.com/veapjs/veap-ui)

## License

MIT
