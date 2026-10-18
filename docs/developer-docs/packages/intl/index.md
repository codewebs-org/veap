# Internationalization (`@veap/intl`)

`@veap/intl` provides server and client localization for Next.js App Router applications. It supports ICU message formatting (`intl-messageformat`), automatic locale detection from cookies and `Accept-Language` headers (`COOKIE_STORE` and `REQUEST_CONTEXT`), and priority-ordered translation loaders so plugins and host applications can merge dictionaries seamlessly.

## Registering `IntlServiceProvider`

Register `IntlServiceProvider` from `@veap/intl/server` in your composition root (`lib/veap.ts`). You can pass custom `loaders` with a `priority` number so your application dictionaries override default package or plugin translations:

```ts
// lib/veap.ts
import { IntlServiceProvider } from "@veap/intl/server";
import { Application } from "@veap/kernel";

export const app = Application.configure()
  .use(
    (c) =>
      new IntlServiceProvider(c, {
        loaders: [
          {
            id: "app:locales",
            priority: 200,
            load: async (locale: string) => {
              if (locale === "de") {
                return (await import("../locales/de.json")).default;
              }
              return (await import("../locales/en.json")).default;
            },
          },
        ],
      }),
  )
  .create();
```

## Next steps

Continue exploring `@veap/intl`:

- [Formatting and components](./formatting-and-components.md) — Translate strings in React Server Components and Client Components using ICU message syntax.
