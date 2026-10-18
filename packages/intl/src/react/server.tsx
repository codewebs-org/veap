import React, { type PropsWithChildren } from "react";
import { getIntlConfig } from "../common/config.js";
import { getCurrentLocale } from "../common/detection.js";
import { getMessages } from "../services/loader.js";
import { I18nProvider as ClientProvider } from "./client.js";

/**
 * Smart Server Component that handles locale detection and message loading automatically.
 */
export async function I18nProvider({ children }: PropsWithChildren) {
  const { default: defaultLocale, locales, timeZone } = await getIntlConfig();

  let locale: string;

  try {
    locale = await getCurrentLocale();
  } catch (_e) {
    // Fallback for build time or static generation
    locale = defaultLocale;
  }

  const messages = await getMessages(locale);

  return React.createElement(
    ClientProvider,
    { locale, locales, messages, timeZone },
    children,
  );
}
