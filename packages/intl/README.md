[![CI](https://github.com/veapjs/veap-intl/actions/workflows/CI.yml/badge.svg)](https://github.com/veapjs/veap-intl/actions/workflows/CI.yml)
[![Release](https://github.com/veapjs/veap-intl/actions/workflows/RELEASE.yml/badge.svg)](https://github.com/veapjs/veap-intl/actions/workflows/RELEASE.yml)
[![Version](https://img.shields.io/npm/v/@veap%2Fintl?style=flat-square&color=181717&logo=npm&logoColor=959da5)](https://www.npmjs.com/package/@veap/intl)
[![Discord](https://img.shields.io/badge/Discord-join-5865F2?style=flat-square&logo=discord&logoColor=959da5)](https://discord.gg/qTkrCwpMW)

# @veap/intl

Internationalization, ICU message formatting, and request locale detection for
Veap and Next.js applications.

## Overview

`@veap/intl` provides a complete localization toolkit designed for modern Next.js
and React 19 architectures. It supports React Server Components (RSC) with zero
client bundle overhead, client-side dynamic switching, ICU message syntax
(pluralization, variables, formatting via `intl-messageformat`), and automated
locale negotiation from HTTP `Accept-Language` headers and cookies.

## Features

- **Full RSC & Client Support**: Seamless translation access in both Server
  Components (`getTranslation`) and Client Components (`useTranslation`).
- **ICU Message Syntax**: Dynamic variables, complex plural rules, numbers,
  and date formatting powered by `intl-messageformat`.
- **Automatic locale detection**: Intelligent locale negotiation based on
  request headers (`negotiator`), path segments, and cookies.
- **Strongly typed keys**: Type-safe dictionary structures and nested key
  traversal (for example, `t("auth.login.title")`).
- **IoC-integrated lifecycle**: `IntlServiceProvider` handles localization
  setup inside the Veap application builder.

## Installation

```bash
# Using bun
bun add @veap/intl @veap/kernel

# Using pnpm
pnpm add @veap/intl @veap/kernel

# Using npm
npm install @veap/intl @veap/kernel
```

## Usage

### Register in Application Builder

Include `IntlServiceProvider` in your application composition root:

```ts
import { Application } from "@veap/kernel";
import { IntlServiceProvider } from "@veap/intl/server";

export const app = Application.configure().use(IntlServiceProvider).create();
```

### Server Components

Fetch translations asynchronously in Next.js Server Components:

```tsx
import { getTranslation } from "@veap/intl/server";

export default async function HomePage() {
  const { t, locale } = await getTranslation("common");

  return (
    <main>
      <h1>{t("welcome.title", { name: "Developer" })}</h1>
      <p>{t("welcome.current_locale", { locale })}</p>
    </main>
  );
}
```

### Client Components

Use the `useTranslation` hook inside interactive client components:

```tsx
"use client";

import { useTranslation } from "@veap/intl/client";

export function CounterButton() {
  const { t, locale } = useTranslation("common");

  return (
    <div>
      <p>{t("actions.click_to_continue")}</p>
      <span>Current locale: {locale}</span>
    </div>
  );
}
```

### Root Layout Setup

Wrap your application with `I18nProvider`:

```tsx
import { I18nProvider } from "@veap/intl/server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  );
}
```

## Subpath Exports

| Export Path         | Content                                                                          |
| ------------------- | -------------------------------------------------------------------------------- |
| `@veap/intl`        | Core types, constants, and `IntlServiceProvider`                                 |
| `@veap/intl/server` | `getTranslation`, `getCurrentLocale`, `I18nProvider`, and `IntlServiceProvider`  |
| `@veap/intl/client` | `I18nProvider` (client context) and `useTranslation` hook                        |

## Documentation

For full guides and ICU translation formatting options, visit:

- **Official Website**: [https://veap.pl](https://veap.pl)
- **Documentation**: [https://veap.pl/docs](https://veap.pl/docs)
- **GitHub Repository**: [https://github.com/veapjs/veap-intl](https://github.com/veapjs/veap-intl)

## License

MIT
