import type { VeapConfig as _VeapConfig } from "@veap/kernel";

/**
 * Common date type that can be coerced to a Date object.
 */
export type CoercibleDate = Date | string | number;

/**
 * veap internal format representation.
 */
export type IntlMessageFormat = string | any[];

/**
 * Recursive message dictionary.
 */
export type AbstractIntlMessages = {
  [key: string]:
    | string
    | AbstractIntlMessages
    | ((...args: any[]) => string | AbstractIntlMessages);
};

export type LocaleMessages = Record<string, AbstractIntlMessages>;

/**
 * Shape of veap.config.ts intl section.
 */
export interface IntlConfig {
  default: string;
  locales: string[];
  cookie: string;
  timeZone?: string;
}

declare module "@veap/kernel" {
  interface VeapConfig {
    intl?: Partial<IntlConfig>;
  }
}

/**
 * Global interface that can be augmented by apps/plugins to provide
 * strong typing for messages across veap.
 *
 * Example:
 * declare module "@veap/intl" {
 *   interface IntlMessages {
 *     common: typeof import("./locales/en/common.json");
 *   }
 * }
 */
export interface IntlMessages {}

/**
 * Translation loader function for dynamic/pluggable message sources.
 */
export type MessageLoaderFn = (
  locale: string,
) =>
  | Promise<AbstractIntlMessages | null | undefined>
  | AbstractIntlMessages
  | null
  | undefined;

/**
 * Structured loader registration entry.
 */
export interface MessageLoaderRecord {
  /**
   * Unique identifier of this loader (e.g. "core", "auth", "plugin:orders", "app").
   */
  id?: string;
  /**
   * Loading function for the specified locale.
   */
  load?: MessageLoaderFn;
  /**
   * Alias for load function.
   */
  loader?: MessageLoaderFn;
  /**
   * Merge priority (lower values loaded first, higher values override lower values).
   * Default: 100.
   * Core: 0.
   * Application: 200+.
   */
  priority?: number;
}

/**
 * Recursive type to get all nested keys joined by dots.
 */
export type NestedKeyOf<ObjectType> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

/**
 * Gets translation keys for a specific namespace or all keys if none is provided.
 */
export type TranslationKeys<N = undefined> = N extends keyof IntlMessages
  ? NestedKeyOf<IntlMessages[N]> | (string & {})
  : NestedKeyOf<IntlMessages> | (string & {});

/**
 * Supported date formats.
 */
export type DateFormat = "short" | "medium" | "long" | "full";

/**
 * Supported time formats.
 */
export type TimeFormat = "short" | "medium" | "long" | "full";
