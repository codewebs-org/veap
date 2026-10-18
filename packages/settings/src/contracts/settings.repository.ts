import type { Token } from "@veap/kernel";

/**
 * Settings persistence port.
 */
export interface ISettingsRepository {
  get<T>(key: string): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  all?(): Promise<Record<string, unknown>>;
}

/**
 * Injection token for the settings repository port.
 */
export const SETTINGS_REPOSITORY: Token<ISettingsRepository> = Symbol.for(
  "veap:settings:repository",
);

/**
 * Forward type reference for SettingsService in IoC tokens.
 */
export interface ISettingsService {
  get<T>(key: string, defaultValue?: T | null): Promise<T | null>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  has(key: string): Promise<boolean>;
  all(): Promise<Record<string, unknown>>;
}

/**
 * Injection token for the settings application service.
 */
export const SETTINGS_SERVICE: Token<ISettingsService> = Symbol.for(
  "veap:settings:service",
);
