import { match } from "@formatjs/intl-localematcher";
import {
  app,
  COOKIE_STORE,
  type ICookieStore,
  type IHttpRequestContext,
  REQUEST_CONTEXT,
} from "@veap/kernel";
import Negotiator from "negotiator";
import { getIntlConfig } from "./config.js";

export async function detectLocale(
  supportedLocales: string[],
  defaultLocale: string,
): Promise<string> {
  try {
    const requestContext = await app<IHttpRequestContext>(REQUEST_CONTEXT);
    const acceptLanguage = await requestContext.getHeader("accept-language");

    if (!acceptLanguage) {
      return defaultLocale;
    }

    const languages = new Negotiator({
      headers: { "accept-language": acceptLanguage },
    }).languages();

    return match(languages, supportedLocales, defaultLocale);
  } catch (_e) {
    // Fallback for build time or environments where headers are unavailable
    return defaultLocale;
  }
}

export async function getCurrentLocale(): Promise<string> {
  const {
    cookie: cookieName,
    default: defaultLocale,
    locales,
  } = await getIntlConfig();

  try {
    const cookieStore = await app<ICookieStore>(COOKIE_STORE);
    const cookieValue = await cookieStore.get(cookieName);

    if (cookieValue && locales.includes(cookieValue)) {
      return cookieValue;
    }

    return await detectLocale(locales, defaultLocale);
  } catch (_e) {
    // Fallback for environments where cookies/headers are not available
    return defaultLocale;
  }
}
