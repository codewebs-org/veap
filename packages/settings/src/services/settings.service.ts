import {
  CACHE_PROVIDER,
  type ICacheProvider,
  Inject,
  Injectable,
} from "@veap/kernel";
import {
  type ISettingsRepository,
  type ISettingsService,
  SETTINGS_REPOSITORY,
} from "../contracts/settings.repository.js";

/**
 * Application service for reading and writing settings.
 *
 * It depends exclusively on ports (ICacheProvider, ISettingsRepository)
 * that are injected through the constructor.
 */
@Injectable()
export class SettingsService implements ISettingsService {
  constructor(
    @Inject(CACHE_PROVIDER) private cache: ICacheProvider,
    @Inject(SETTINGS_REPOSITORY) private repository: ISettingsRepository,
  ) {}

  /**
   * Get a setting value by key.
   * @param key Setting key (e.g., "system:page")
   * @param defaultValue Optional fallback value if the key does not exist
   * @returns Value as T or defaultValue / null
   */
  public async get<T>(
    key: string,
    defaultValue: T | null = null,
  ): Promise<T | null> {
    const cacheKey = `settings:${key}`;
    const cached = await this.cache.get<T>(cacheKey);
    if (cached !== null) return cached;

    const value = await this.repository.get<T>(key);
    if (value !== null) {
      await this.cache.set(cacheKey, value);
      return value;
    }
    return defaultValue;
  }

  /**
   * Check if a setting exists.
   * @param key Setting key
   */
  public async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null;
  }

  /**
   * Set a setting value.
   * @param key Setting key
   * @param value JSON value
   */
  public async set(key: string, value: unknown): Promise<void> {
    await this.repository.set(key, value);
    await this.cache.set(`settings:${key}`, value);
  }

  /**
   * Remove a setting by key.
   * @param key Setting key
   */
  public async remove(key: string): Promise<void> {
    await this.repository.delete(key);
    await this.cache.delete(`settings:${key}`);
  }

  /**
   * Clear all settings.
   */
  public async clear(): Promise<void> {
    await this.repository.clear();
    await this.cache.clear();
  }

  /**
   * Retrieve all settings as a key-value map.
   */
  public async all(): Promise<Record<string, unknown>> {
    if (this.repository.all) {
      return this.repository.all();
    }
    return {};
  }
}
