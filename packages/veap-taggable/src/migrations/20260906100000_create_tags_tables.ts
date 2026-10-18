import { type Schema } from "@veap/database";

export const name = "20260906100000_create_tags_tables";

export async function up(db: any, schema: Schema) {
  // 1. Universal tags table (translatable names & slugs live in translations table)
  if (!(await schema.hasTable("tags"))) {
    await schema.createTable("tags", (table) => {
      table.uuid("id").primaryKey();
      table.timestamps();
    });
  }

  // 2. Polymorphic pivot table for tags
  if (!(await schema.hasTable("taggables"))) {
    await schema.createTable("taggables", (table) => {
      table.uuid("tag_id").notNull();
      table.text("taggable_id").notNull();
      table.text("taggable_type").notNull();
      table.timestamp("created_at").defaultNow();
      table.unique(["tag_id", "taggable_id", "taggable_type"]);
    });

    await schema.raw(
      `CREATE INDEX IF NOT EXISTS "idx_taggables_lookup" ON "taggables" ("taggable_type", "taggable_id")`,
    );
    await schema.raw(
      `CREATE INDEX IF NOT EXISTS "idx_taggables_tag_id" ON "taggables" ("tag_id")`,
    );
  }
}

export async function down(_db: any, _schema: Schema) {
  // Shared polymorphic tables: do not drop table on single plugin rollback
  // as other independent plugins may also use tags.
}
