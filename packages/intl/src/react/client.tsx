"use client";

import * as React from "react";
import { createContext, useContext } from "react";
import type { AbstractIntlMessages } from "../common/types.js";
import { createTranslator } from "../services/translator.js";

type ContextType = {
  locale: string;
  locales: string[];
  messages: AbstractIntlMessages;
  timeZone?: string;
};

const CONTEXT_SYMBOL = Symbol.for("veap-intl-context");

const IntlContext =
  (globalThis as any)[CONTEXT_SYMBOL] ||
  createContext<ContextType | null>(null);

if (!(globalThis as any)[CONTEXT_SYMBOL]) {
  (globalThis as any)[CONTEXT_SYMBOL] = IntlContext;
}

export function I18nProvider({
  children,
  locale,
  locales = ["en"],
  messages,
  timeZone = process.env.NEXT_PUBLIC_INTL_TIMEZONE ||
    process.env.NEXT_PUBLIC_TIMEZONE,
}: React.PropsWithChildren<{
  locale: string;
  locales?: string[];
  messages: AbstractIntlMessages;
  timeZone?: string;
}>) {
  return React.createElement(
    IntlContext.Provider,
    { value: { locale, locales, messages, timeZone } },
    children,
  );
}

export function useLocale(): string {
  const context = useContext(IntlContext) as ContextType | null;
  if (!context) {
    throw new Error("useLocale must be used within I18nProvider");
  }
  return context.locale;
}

/**
 * Returns a list of all supported locales.
 */
export function useSupportedLocales(): string[] {
  const context = useContext(IntlContext) as ContextType | null;
  if (!context) {
    throw new Error("useSupportedLocales must be used within I18nProvider");
  }
  return context.locales;
}

/**
 * Returns the active default time zone.
 */
export function useTimeZone(): string | undefined {
  const context = useContext(IntlContext) as ContextType | null;
  if (!context) {
    throw new Error("useTimeZone must be used within I18nProvider");
  }
  return context.timeZone;
}

/**
 * Client-side hook for translations with IntelliSense support.
 */
export function useTranslation() {
  const context = useContext(IntlContext) as ContextType | null;
  if (!context) {
    throw new Error("useTranslation must be used within I18nProvider");
  }

  const { messages, locale, timeZone } = context;

  return createTranslator({ messages, locale, timeZone });
}

export const useTranslations = useTranslation;
