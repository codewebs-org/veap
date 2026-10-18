import { type Schema } from "@veap/database";

export const name = "20260906000000_create_translations_table";

export async function up(db: any, schema: Schema) {
  if (!(await schema.hasTable("translations"))) {
    await schema.createTable("translations", (table) => {
      table.uuid("id").primaryKey();
      table.text("translatable_type").notNull();
      table.text("translatable_id").notNull();
      table.varchar("locale", 10).notNull();
      table.varchar("key", 100).notNull();
      table.text("value");
      table.timestamps();
      table.unique(["translatable_type", "translatable_id", "locale", "key"]);
    });

    // Create lookup index for fast querying by entity + locale
    await schema.raw(
      `CREATE INDEX IF NOT EXISTS "idx_translations_lookup" ON "translations" ("translatable_type", "translatable_id", "locale")`,
    );

    // Create index for search / filtering by key and locale
    await schema.raw(
      `CREATE INDEX IF NOT EXISTS "idx_translations_key_locale" ON "translations" ("locale", "key")`,
    );
  }
}

export async function down(_db: any, _schema: Schema) {
  // Shared polymorphic table: we intentionally do NOT drop the `translations` table
  // on plugin rollback, because multiple independent plugins (e.g. blog, news, pages)
  // share this table. Each plugin is responsible for cleaning up its own records.
}
