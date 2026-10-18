import { getKnex, initDatabase, MorphMap, runMigrations } from "@veap/database";
import { translatableMigrations } from "@veap/translatable";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { taggableMigrations } from "../src/migrations/index.js";
import { Tag } from "../src/models/Tag.js";
import { TaggableModel } from "../src/traits/Taggable.js";

interface ArticleAttributes {
  id: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Article extends TaggableModel<ArticleAttributes> {
  static override table = "articles";
  static override morphAlias = "article";
}

describe("@veap/taggable", () => {
  beforeAll(async () => {
    const db = initDatabase({
      client: "better-sqlite3",
      connection: { filename: ":memory:" },
      useNullAsDefault: true,
    });

    // Create articles table for testing
    await db.schema.createTable("articles", (table: any) => {
      table.string("id").primary();
      table.string("title").notNullable();
      table.timestamps(true, true);
    });

    // Run translatable migrations (required by Tag)
    await runMigrations("translatable", translatableMigrations);

    // Run taggable migrations (tags, taggables pivot)
    await runMigrations("taggable", taggableMigrations);

    MorphMap.register({ article: Article, tag: Tag });
  });

  afterAll(async () => {
    const db = getKnex();
    await db.destroy();
  });

  it("creates and retrieves tags with translations", async () => {
    const tag = await Tag.findOrCreateByName("TypeScript", "en");
    expect(tag).toBeDefined();
    expect(tag.id).toBeDefined();
    expect(tag.getTranslation("name", "en")).toBe("TypeScript");
    expect(tag.getTranslation("slug", "en")).toBe("typescript");
  });

  it("attaches, filters and syncs tags on a model", async () => {
    const article = new Article();
    article.id = "art-100";
    article.title = "Modern TypeScript in 2026";
    await article.save();

    // Attach tags
    await article.attachTags(["TypeScript", "React"], "en");

    let tags = await article.tags().get();
    expect(tags.length).toBe(2);

    // Query with whereTag
    const matching = await Article.query().whereTag("TypeScript", "en").get();
    expect(matching.length).toBe(1);
    expect(matching[0].id).toBe("art-100");

    // Sync tags (replace with new set)
    await article.syncTags(["Next.js", "Bun"], "en");
    tags = await article.tags().get();
    expect(tags.length).toBe(2);

    // Detach all tags
    await article.detachTags();
    tags = await article.tags().get();
    expect(tags.length).toBe(0);
  });
});
