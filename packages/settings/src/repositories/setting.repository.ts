import type { ISettingsRepository } from "../contracts/settings.repository.js";
import { Setting } from "../models/Setting.js";

/**
 * `ISettingsRepository` adapter backed by the `Setting` ActiveRecord model.
 */
export class ActiveRecordSettingsRepository implements ISettingsRepository {
  async get<T>(key: string): Promise<T | null> {
    return Setting.getValue<T>(key, null);
  }

  async set(key: string, value: unknown): Promise<void> {
    await Setting.setValue(key, value);
  }

  async delete(key: string): Promise<void> {
    await Setting.where("key", key).delete();
  }

  async clear(): Promise<void> {
    await Setting.query().delete();
  }

  async all(): Promise<Record<string, unknown>> {
    const settings = await Setting.all();
    const result: Record<string, unknown> = {};
    for (const s of settings) {
      const k = s.getAttribute("key");
      if (k) {
        result[k] = s.getAttribute("value");
      }
    }
    return result;
  }
}
