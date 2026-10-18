import { ApplicationBuilder } from "@veap/kernel";
import {
  type SettingsConfig,
  SettingsServiceProvider,
} from "./providers/settings.provider.js";

declare module "@veap/kernel" {
  interface ApplicationBuilder {
    /**
     * Registers the SettingsServiceProvider into the application.
     */
    withSettings(config?: SettingsConfig): this;
  }

  interface VeapConfig {
    /**
     * Configuration options for @veap/settings.
     */
    settings?: SettingsConfig;
  }
}

ApplicationBuilder.prototype.withSettings = function (
  this: ApplicationBuilder,
  config?: SettingsConfig,
): ApplicationBuilder {
  return this.use((c) => new SettingsServiceProvider(c, config));
};
