import type { Token } from "@veap/kernel";
import type { IntlService } from "../services/intl.service.js";

/**
 * Default configuration for the intl package.
 * These values are used if no configuration is provided in veap.config.ts.
 */
export const DEFAULT_INTL_CONFIG = {
  cookie: "VEAP_LOCALE",
  default: "en",
  locales: ["en"],
  timeZone: "UTC",
} as const;

export const COOKIE_NAME = DEFAULT_INTL_CONFIG.cookie;
export const DEFAULT_LOCALE = DEFAULT_INTL_CONFIG.default;
export const LOCALES = DEFAULT_INTL_CONFIG.locales;

export const INTL_MESSAGE_LOADERS = Symbol.for("veap:intl:message_loaders");
export const INTL_SERVICE: Token<IntlService> = Symbol.for("veap:intl:service");

export interface ILocaleResolver {
  getLocale(): Promise<string> | string;
}

export const LOCALE_RESOLVER: Token<ILocaleResolver> = Symbol.for(
  "veap:intl:locale-resolver",
);

export const IN_MS = {
  SECOND: 1_000,
  MINUTE: 60_000, // 60 * 1_000
  HOUR: 3_600_000, // 60 * 60 * 1_000
  DAY: 86_400_000, // 24 * 60 * 60 * 1_000
  WEEK: 604_800_000, // 7 * 24 * 60 * 60 * 1_000
  MONTH: 2_630_016_000, // 30.44 * 24 * 60 * 60 * 1_000
  YEAR: 31_556_736_000, // 365.24 * 24 * 60 * 60 * 1_000
};
