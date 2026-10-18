import { runMigrations } from "@veap/database";
import * as m0001 from "./0001_create_settings_table.js";

export const settingsMigrations = [m0001];

export async function runSettingsMigrations(): Promise<void> {
  await runMigrations("settings", settingsMigrations);
}

export default settingsMigrations;
