import { initDatabase } from "@veap/database";
import {
  Application,
  Container,
  container,
  MemoryCacheProvider,
} from "@veap/kernel";
import { beforeAll, describe, expect, it } from "vitest";
import {
  SETTINGS_REPOSITORY,
  SETTINGS_SERVICE,
} from "../src/contracts/index.js";
import { runSettingsMigrations } from "../src/migrations/index.js";
import { Setting } from "../src/models/index.js";
import { SettingsServiceProvider } from "../src/providers/index.js";
import { ActiveRecordSettingsRepository } from "../src/repositories/index.js";
import { SettingsService } from "../src/services/index.js";
import "../src/composition.js";

describe("@veap/settings", () => {
  let settingsService: SettingsService;
  let cache: MemoryCacheProvider;

  beforeAll(async () => {
    initDatabase({
      client: "better-sqlite3",
      connection: { filename: ":memory:" },
      useNullAsDefault: true,
    });

    // Run actual settings migrations
    await runSettingsMigrations();

    cache = new MemoryCacheProvider();
    const repository = new ActiveRecordSettingsRepository();
    settingsService = new SettingsService(cache, repository);
  });

  it("stores and retrieves settings via SettingsService", async () => {
    await settingsService.set("site_name", "Veap Application");

    const value = await settingsService.get<string>("site_name");
    expect(value).toBe("Veap Application");

    // Check that it cached the value
    const cached = await cache.get<string>("settings:site_name");
    expect(cached).toBe("Veap Application");
  });

  it("returns default fallback when setting does not exist", async () => {
    const fallback = await settingsService.get<string>(
      "missing_key",
      "default_value",
    );
    expect(fallback).toBe("default_value");

    const nonExistingNull = await settingsService.get<string>("non_existing");
    expect(nonExistingNull).toBeNull();
  });

  it("checks existence with has()", async () => {
    await settingsService.set("existing_flag", true);
    expect(await settingsService.has("existing_flag")).toBe(true);
    expect(await settingsService.has("missing_flag")).toBe(false);
  });

  it("stores structured JSON objects", async () => {
    const config = { theme: "dark", notifications: true, maxItems: 50 };
    await settingsService.set("app_config", config);

    const retrieved = await settingsService.get<typeof config>("app_config");
    expect(retrieved).toEqual(config);
  });

  it("retrieves all settings via all()", async () => {
    const allSettings = await settingsService.all();
    expect(allSettings).toBeDefined();
    expect(allSettings.site_name).toBe("Veap Application");
    expect(allSettings.existing_flag).toBe(true);
  });

  it("removes settings and clears cache entry", async () => {
    await settingsService.set("temporary_key", 12345);
    expect(await settingsService.get<number>("temporary_key")).toBe(12345);

    await settingsService.remove("temporary_key");

    expect(await settingsService.get<number>("temporary_key")).toBeNull();
    expect(await cache.get("settings:temporary_key")).toBeNull();
  });

  it("direct ActiveRecord model methods (getValue / setValue)", async () => {
    await Setting.setValue("direct_key", "direct_value");

    const val = await Setting.getValue("direct_key");
    expect(val).toBe("direct_value");

    const fallback = await Setting.getValue("non_existing", "default_fallback");
    expect(fallback).toBe("default_fallback");
  });

  it("clears all settings", async () => {
    await settingsService.clear();

    const siteName = await settingsService.get("site_name");
    expect(siteName).toBeNull();
  });

  it("registers strongly typed tokens in IoC container", async () => {
    const localContainer = new Container();
    localContainer.register({
      token: Symbol.for("veap:kernel:cache"),
      useValue: new MemoryCacheProvider(),
      singleton: true,
    });

    const provider = new SettingsServiceProvider(localContainer, {
      autoMigrate: false,
    });
    provider.register();

    expect(localContainer.has(SETTINGS_REPOSITORY)).toBe(true);
    expect(localContainer.has(SETTINGS_SERVICE)).toBe(true);
    expect(localContainer.has(SettingsService)).toBe(true);

    const resolvedService = await localContainer.resolve(SETTINGS_SERVICE);
    expect(resolvedService).toBeInstanceOf(SettingsService);
  });

  it("supports Application.configure().withSettings() builder syntax", async () => {
    await Application.shutdown();
    const app = Application.configure()
      .withSettings({ autoMigrate: false })
      .create();
    expect(app).toBeDefined();
    await app.bootstrap();

    const service = await container.resolve(SETTINGS_SERVICE);
    expect(service).toBeDefined();
  });
});
