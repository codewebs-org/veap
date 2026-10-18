import type { Schema } from "@veap/database";

export const name = "0001_create_settings_table";

export async function up(_db: any, schema: Schema) {
  await schema.createTable("settings", (table) => {
    table.text("id").primaryKey();
    table.text("key").notNull().unique();
    table.json("value").notNull();
    table.timestamp("updated_at").defaultNow();
  });
}

export async function down(_db: any, schema: Schema) {
  await schema.dropTableIfExists("settings");
}
