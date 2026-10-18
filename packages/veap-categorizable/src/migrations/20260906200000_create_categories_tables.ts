import { type Schema } from "@veap/database";

export const name = "20260906200000_create_categories_tables";

export async function up(db: any, schema: Schema) {
  // 1. Universal categories table (supports hierarchical nesting via parent_id)
  if (!(await schema.hasTable("categories"))) {
    await schema.createTable("categories", (table) => {
      table.uuid("id").primaryKey();
      table.uuid("parent_id");
      table.timestamps();
    });

    await schema.raw(
      `CREATE INDEX IF NOT EXISTS "idx_categories_parent_id" ON "categories" ("parent_id")`,
    );
  }

  // 2. Polymorphic pivot table for categorizables
  if (!(await schema.hasTable("categorizables"))) {
    await schema.createTable("categorizables", (table) => {
      table.uuid("category_id").notNull();
      table.text("categorizable_id").notNull();
      table.text("categorizable_type").notNull();
      table.timestamp("created_at").defaultNow();
      table.unique(["category_id", "categorizable_id", "categorizable_type"]);
    });

    await schema.raw(
      `CREATE INDEX IF NOT EXISTS "idx_categorizables_lookup" ON "categorizables" ("categorizable_type", "categorizable_id")`,
    );
    await schema.raw(
      `CREATE INDEX IF NOT EXISTS "idx_categorizables_cat_id" ON "categorizables" ("category_id")`,
    );
  }
}

export async function down(_db: any, _schema: Schema) {
  // Shared polymorphic tables are preserved across individual plugin rollbacks
}
