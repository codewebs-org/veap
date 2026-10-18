import { isDatabaseInitialized } from "@veap/database";
import {
  ConfigService,
  type Container,
  logger,
  ServiceProvider,
} from "@veap/kernel";
import {
  SETTINGS_REPOSITORY,
  SETTINGS_SERVICE,
} from "../contracts/settings.repository.js";
import { runSettingsMigrations } from "../migrations/index.js";
import { ActiveRecordSettingsRepository } from "../repositories/setting.repository.js";
import { SettingsService } from "../services/settings.service.js";

export interface SettingsConfig {
  /**
   * Whether to automatically run settings database migrations during SettingsServiceProvider.boot().
   * Defaults to `true` when database connection is initialized.
   */
  autoMigrate?: boolean;
}

export class SettingsServiceProvider extends ServiceProvider {
  private config?: SettingsConfig;

  constructor(container: Container, config?: SettingsConfig) {
    super(container);
    this.config = config;
  }

  register(): void {
    this.container.register({
      token: SETTINGS_REPOSITORY,
      useClass: ActiveRecordSettingsRepository,
      singleton: true,
    });

    this.container.register({
      token: SettingsService,
      useClass: SettingsService,
      singleton: true,
    });

    this.container.register({
      token: SETTINGS_SERVICE,
      useFactory: (service: SettingsService) => service,
      inject: [SettingsService],
      singleton: true,
    });
  }

  async boot(): Promise<void> {
    const configService = this.container.has(ConfigService)
      ? await this.container.resolve(ConfigService)
      : undefined;

    const envAutoMigrate =
      configService?.get("SETTINGS_AUTO_MIGRATE") ??
      (typeof process !== "undefined"
        ? process.env.SETTINGS_AUTO_MIGRATE
        : undefined);

    const shouldAutoMigrate =
      this.config?.autoMigrate ??
      (envAutoMigrate !== undefined
        ? envAutoMigrate === "true" || envAutoMigrate === "1"
        : true);

    if (shouldAutoMigrate !== false && isDatabaseInitialized()) {
      try {
        await runSettingsMigrations();
      } catch (error: any) {
        logger.warn(
          "veap:settings",
          "Automatic settings migration failed or deferred:",
          error?.message || error,
        );
      }
    }
  }
}
