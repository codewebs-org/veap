# `@veap/intl` API reference

`@veap/intl` provides internationalization, ICU message formatting (`intl-messageformat`), and automatic request locale negotiation for React Server Components and Client Components.

## Subpath exports

`@veap/intl` defines three entry points in `package.json`:

| Subpath | Description |
| :--- | :--- |
| `@veap/intl` | Core localization types, constants, and `IntlServiceProvider`. |
| `@veap/intl/server` | Server-only entry point exporting `IntlServiceProvider`, `getTranslation`, `getCurrentLocale`, and the server `<I18nProvider>`. |
| `@veap/intl/client` | Client-only entry point exporting `useTranslation` and the client `<I18nProvider>` context. |

## Server and client APIs

The table below lists the primary functions and components exported by `@veap/intl`:

| Symbol | Entry point | Signature / Props | Description |
| :--- | :--- | :--- | :--- |
| `IntlServiceProvider` | `@veap/intl/server` | `new IntlServiceProvider(container, options?)` | Registers translation loaders and locale negotiation services in the IoC container. |
| `getTranslation` | `@veap/intl/server` | `getTranslation(localeOverride?, timeZoneOverride?): Promise<{ t, text, date, relativeTime, locale, timeZone }>` | Resolves the active locale and returns formatters for messages (`t`), dates (`date`), and relative time (`relativeTime`). |
| `getCurrentLocale` | `@veap/intl/server` | `getCurrentLocale(): Promise<string>` | Negotiates the current request locale from `COOKIE_STORE` (`VEAP_LOCALE` by default) and `REQUEST_CONTEXT` (`Accept-Language`). |
| `I18nProvider` | `@veap/intl/server` | `<I18nProvider>{children}</I18nProvider>` | Async Server Component that loads the active locale's dictionary and hydrates client context. |
| `useTranslation` | `@veap/intl/client` | `useTranslation(): { t, text, date, relativeTime, locale, timeZone }` | Client hook returning ICU message, date, and relative time formatters for the active locale. |
| `useLocale` | `@veap/intl/client` | `useLocale(): string` | Client hook returning the active locale string. |
| `useSupportedLocales` | `@veap/intl/client` | `useSupportedLocales(): string[]` | Client hook returning the configured array of supported locales. |
