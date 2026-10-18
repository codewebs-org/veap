# Formatting and components

`@veap/intl` separates server-side translation resolution (`@veap/intl/server`) from client-side hooks (`@veap/intl/client`) while sharing the same ICU message syntax across both environments.

## Translating in React Server Components

In Server Components, Server Actions, or Route Handlers, call `getTranslation(namespace?)` or `getCurrentLocale()` from `@veap/intl/server`:

```tsx
// app/page.tsx
import { getTranslation } from "@veap/intl/server";
import { initializeSystem } from "@/lib/veap";

export default async function HomePage() {
  await initializeSystem();
  const { t, locale } = await getTranslation("common");

  return (
    <section>
      <h1>{t("hero.title", { framework: "Veap" })}</h1>
      <p>Active locale: {locale}</p>
    </section>
  );
}
```

## Translating in Client Components

Wrap your root `app/layout.tsx` with `<I18nProvider>` from `@veap/intl/server`. Inside Client Components (`"use client"`), call `useTranslation()` from `@veap/intl/client` to access formatting helpers, or `useLocale()` and `useSupportedLocales()` to inspect the active locale configuration:

```tsx
// components/greeting-card.tsx
"use client";

import { useLocale, useTranslation } from "@veap/intl/client";

export function GreetingCard({ count }: { count: number }) {
  const { t, date } = useTranslation();
  const locale = useLocale();

  return (
    <div className="flex items-center gap-4">
      <p>{t("common.notifications.unread_count", { count })}</p>
      <span className="text-sm text-muted-foreground">
        Locale: {locale} ({date(new Date(), { dateStyle: "short" })})
      </span>
    </div>
  );
}
```

To switch languages, set the `VEAP_LOCALE` cookie (or your custom `intl.cookie` name configured in `veap.config.ts`) and refresh or trigger router navigation.

## ICU message syntax

Because `@veap/intl` uses `intl-messageformat`, dictionary strings support named placeholders, plural rules, and select expressions:

```json
{
  "common": {
    "hero": {
      "title": "Build modular apps with {framework}"
    },
    "notifications": {
      "unread_count": "{count, plural, =0 {No unread messages} one {# unread message} other {# unread messages}}"
    }
  }
}
```
