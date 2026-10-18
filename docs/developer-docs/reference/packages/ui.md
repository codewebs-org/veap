# `@veap/ui` API reference

`@veap/ui` is the shared React 19 + Tailwind CSS v4 component library and design system for Veap applications, built on Radix UI primitives and Class Variance Authority (CVA).

## Subpath exports

`@veap/ui` exposes individual component subpaths alongside its main entry points:

| Subpath | Description |
| :--- | :--- |
| `@veap/ui` | Barrel export of all UI components, hooks (`useIsMobile`), `ThemeProvider`, `Logo`, and the `cn` class-merging helper. |
| `@veap/ui/globals.css` | Tailwind CSS v4 design tokens, OKLCH light and dark theme variables, and base layer styles. |
| `@veap/ui/providers` | `ThemeProvider` wrapper around `next-themes`. |
| `@veap/ui/logo` | `Logo` vector component with theme-aware variants. |
| `@veap/ui/shared/*` | Shared layout feedback components (`@veap/ui/shared/page-loader`, `@veap/ui/shared/access-denied`, `@veap/ui/shared/scroll-fade-effect`). |
| `@veap/ui/components/*` | Direct imports for individual components (such as `@veap/ui/components/button`, `@veap/ui/components/dialog`, `@veap/ui/components/sonner`). |
| `@veap/ui/mdx` | Markdown and MDX component overrides (`useMDXComponents`). |

## Component catalog

The table below lists all components shipped in `@veap/ui` by category:

| Category | Components |
| :--- | :--- |
| **Actions & triggers** | `Button`, `ButtonGroup`, `Toggle`, `ToggleGroup` |
| **Data display** | `Avatar`, `Badge`, `Card`, `Table`, `Kbd`, `Separator`, `Empty` |
| **Feedback & status** | `Alert`, `AlertDialog`, `Progress`, `Skeleton`, `Spinner`, `Toaster` (`sonner`) |
| **Forms & inputs** | `Checkbox`, `Field`, `Form`, `Input`, `InputGroup`, `InputOTP`, `Label`, `RadioGroup`, `Select`, `Slider`, `Switch`, `Textarea` |
| **Navigation & menus** | `Breadcrumb`, `Command`, `ContextMenu`, `DropdownMenu`, `Menubar`, `NavigationMenu`, `Pagination`, `Sidebar`, `Tabs` |
| **Overlays & popups** | `Dialog`, `Drawer`, `HoverCard`, `Popover`, `Sheet`, `Tooltip` |
| **Layout & brand** | `PageLoader`, `AccessDenied`, `ScrollFadeEffect`, `Logo` |
