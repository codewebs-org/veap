import { type Schema } from "@veap/database";

export const name = "20260906300000_create_comments_table";

export async function up(db: any, schema: Schema) {
  // Universal polymorphic threaded comments table
  if (!(await schema.hasTable("comments"))) {
    await schema.createTable("comments", (table) => {
      table.uuid("id").primaryKey();
      table.text("commentable_type").notNull();
      table.text("commentable_id").notNull();
      table.uuid("author_id");
      table.text("author_name");
      table.text("author_email");
      table.uuid("parent_id");
      table.text("content").notNull();
      table.text("status").notNull().default("approved");
      table.timestamps();
    });

    await schema.raw(
      `CREATE INDEX IF NOT EXISTS "idx_comments_lookup" ON "comments" ("commentable_type", "commentable_id")`,
    );
    await schema.raw(
      `CREATE INDEX IF NOT EXISTS "idx_comments_parent_id" ON "comments" ("parent_id")`,
    );
    await schema.raw(
      `CREATE INDEX IF NOT EXISTS "idx_comments_status" ON "comments" ("status")`,
    );
  }
}

export async function down(_db: any, _schema: Schema) {
  // Shared polymorphic comments table is preserved across individual plugin rollbacks
}
