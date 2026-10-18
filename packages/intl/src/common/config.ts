import { app, type IVeapConfigProvider, VEAP_CONFIG } from "@veap/kernel";
import { getVeapConfig } from "@veap/kernel/server";
import { DEFAULT_INTL_CONFIG } from "./constants.js";

/**
 * Loads the intl configuration by merging the defaults with values from veap.config.ts or container.
 * SERVER ONLY.
 */
export async function getIntlConfig() {
  let config: any = {};
  try {
    const configProvider = await app<IVeapConfigProvider>(VEAP_CONFIG);
    config = await configProvider.get();
  } catch {
    try {
      config = await getVeapConfig();
    } catch {
      config = {};
    }
  }

  return {
    cookie:
      process.env.VEAPCONFIG_INTL_COOKIE ||
      process.env.NEXT_PUBLIC_INTL_COOKIE ||
      config?.intl?.cookie ||
      DEFAULT_INTL_CONFIG.cookie,
    default:
      process.env.VEAPCONFIG_INTL_DEFAULT ||
      process.env.NEXT_PUBLIC_INTL_DEFAULT ||
      config?.intl?.default ||
      DEFAULT_INTL_CONFIG.default,
    locales: (process.env.VEAPCONFIG_INTL_LOCALES?.split(",") ||
      process.env.NEXT_PUBLIC_INTL_LOCALES?.split(",") ||
      config?.intl?.locales ||
      DEFAULT_INTL_CONFIG.locales) as string[],
    timeZone:
      process.env.VEAPCONFIG_INTL_TIMEZONE ||
      process.env.NEXT_PUBLIC_INTL_TIMEZONE ||
      process.env.NEXT_PUBLIC_TIMEZONE ||
      config?.intl?.timeZone ||
      process.env.TZ ||
      DEFAULT_INTL_CONFIG.timeZone,
  };
}

/**
 * Returns a list of all supported locales.
 * SERVER ONLY.
 */
export async function getSupportedLocales() {
  const config = await getIntlConfig();
  return config.locales;
}

/**
 * Returns the default locale.
 * SERVER ONLY.
 */
export async function getDefaultLocale() {
  const config = await getIntlConfig();
  return config.default;
}

/**
 * Returns the default time zone.
 * SERVER ONLY.
 */
export async function getDefaultTimeZone() {
  const config = await getIntlConfig();
  return config.timeZone;
}
