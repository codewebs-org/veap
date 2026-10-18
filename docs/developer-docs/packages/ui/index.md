# UI component library (`@veap/ui`)

`@veap/ui` provides over 40 accessible React 19 components built on Radix UI primitives and styled with Tailwind CSS v4 design tokens and OKLCH color variables.

## Importing stylesheet tokens and `ThemeProvider`

Import `@veap/ui/globals.css` in your root `app/globals.css` stylesheet so Tailwind CSS v4 loads the shared design tokens and theme variables:

```css
/* app/globals.css */
@import "tailwindcss";
@import "@veap/ui/globals.css";
```

Wrap your root `app/layout.tsx` with `ThemeProvider` from `@veap/ui` (or `@veap/ui/providers`) to support light, dark, and system color modes:

```tsx
// app/layout.tsx
import { Toaster } from "@veap/ui/components/sonner";
import { ThemeProvider } from "@veap/ui/providers";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Next steps

Continue exploring `@veap/ui`:

- [Using UI components](./components.md) — Import cards, badges, buttons, forms, dialogs, and toast notifications from `@veap/ui`.
