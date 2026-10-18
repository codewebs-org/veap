import { AsyncLocalStorage } from "node:async_hooks";

const localeStorage = new AsyncLocalStorage<string>();

let globalDefaultLocale = "en";
let globalFallbackLocale = "en";
let globalCurrentLocale = "en";

export type LocaleResolver = () => string | null | undefined;
let customLocaleResolver: LocaleResolver | null = null;

/**
 * Registers a custom dynamic locale resolver (e.g. hooked into @veap/intl).
 */
export function setLocaleResolver(resolver: LocaleResolver | null): void {
  customLocaleResolver = resolver;
}

/**
 * Gets the current active locale.
 * Resolves from AsyncLocalStorage if inside a withLocale() scope,
 * then queries any registered custom/global locale resolver,
 * and finally falls back to the global current locale.
 */
export function getLocale(): string {
  const asyncLocale = localeStorage.getStore();
  if (asyncLocale) {
    return asyncLocale;
  }
  if (customLocaleResolver) {
    try {
      const resolved = customLocaleResolver();
      if (resolved) return resolved;
    } catch {}
  }
  const globalResolver = (globalThis as any).__VEAP_LOCALE_RESOLVER__;
  if (typeof globalResolver === "function") {
    try {
      const resolved = globalResolver();
      if (resolved) return resolved;
    } catch {}
  }
  return globalCurrentLocale;
}

/**
 * Asynchronously resolves the active locale, querying any async resolver
 * registered on globalThis (such as @veap/intl's request-scoped detector) if available.
 */
export async function resolveLocale(): Promise<string> {
  const syncLocale = getLocale();
  if (syncLocale && syncLocale !== globalDefaultLocale) {
    return syncLocale;
  }
  const globalAsyncResolver = (globalThis as any)
    .__VEAP_ASYNC_LOCALE_RESOLVER__;
  if (typeof globalAsyncResolver === "function") {
    try {
      const asyncLocale = await globalAsyncResolver();
      if (asyncLocale) return asyncLocale;
    } catch {}
  }
  return syncLocale;
}

/**
 * Sets the global current locale.
 */
export function setLocale(locale: string): void {
  if (locale && typeof locale === "string") {
    globalCurrentLocale = locale;
  }
}

/**
 * Gets the default locale.
 */
export function getDefaultLocale(): string {
  return globalDefaultLocale;
}

/**
 * Sets the default locale.
 */
export function setDefaultLocale(locale: string): void {
  if (locale && typeof locale === "string") {
    globalDefaultLocale = locale;
  }
}

/**
 * Gets the fallback locale when a translation in requested locale is missing.
 */
export function getFallbackLocale(): string {
  return globalFallbackLocale;
}

/**
 * Sets the fallback locale.
 */
export function setFallbackLocale(locale: string): void {
  if (locale && typeof locale === "string") {
    globalFallbackLocale = locale;
  }
}

/**
 * Executes a callback within a specific locale context.
 */
export async function withLocale<T>(
  locale: string,
  callback: () => T | Promise<T>,
): Promise<T> {
  return localeStorage.run(locale, callback);
}
