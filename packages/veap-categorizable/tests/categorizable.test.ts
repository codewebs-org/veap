import {
  getKnex,
  initDatabase,
  Model,
  MorphMap,
  runMigrations,
} from "@veap/database";
import { translatableMigrations } from "@veap/translatable";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { categorizableMigrations } from "../src/migrations/index.js";
import { Category } from "../src/models/Category.js";
import { CategorizableModel } from "../src/traits/Categorizable.js";

interface PostAttributes {
  id: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Post extends CategorizableModel<PostAttributes> {
  static override table = "posts";
  static override morphAlias = "post";
}

describe("@veap/categorizable", () => {
  beforeAll(async () => {
    const db = initDatabase({
      client: "better-sqlite3",
      connection: { filename: ":memory:" },
      useNullAsDefault: true,
    });

    // Create posts table for polymorphic testing
    await db.schema.createTable("posts", (table: any) => {
      table.string("id").primary();
      table.string("title").notNullable();
      table.timestamps(true, true);
    });

    // Run translatable migrations (required by Category)
    await runMigrations("translatable", translatableMigrations);

    // Run categorizable migrations (categories, categorizables pivot)
    await runMigrations("categorizable", categorizableMigrations);

    MorphMap.register({ post: Post, category: Category });
  });

  afterAll(async () => {
    const db = getKnex();
    await db.destroy();
  });

  it("creates and retrieves categories with translations and hierarchy", async () => {
    const tech = await Category.findOrCreateByName("Technology", null, "en");
    expect(tech).toBeDefined();
    expect(tech.id).toBeDefined();
    expect(tech.getTranslation("name", "en")).toBe("Technology");
    expect(tech.getTranslation("slug", "en")).toBe("technology");

    // Create subcategory
    const ai = await Category.findOrCreateByName(
      "Artificial Intelligence",
      tech.id,
      "en",
    );
    expect(ai).toBeDefined();
    expect(ai.getAttribute("parent_id")).toBe(tech.id);

    // Query parent relationship
    const parent = await ai.parent().get();
    expect(parent).not.toBeNull();
    expect(parent!.id).toBe(tech.id);

    // Query children relationship
    const children = await tech.children().get();
    expect(children.length).toBe(1);
    expect(children[0].id).toBe(ai.id);
  });

  it("attaches, checks, and detaches categories from a model", async () => {
    const post = new Post();
    post.id = "post-1";
    post.title = "Future of AI";
    await post.save();

    const tech = await Category.findOrCreateByName("Technology", null, "en");
    const ai = await Category.findOrCreateByName(
      "Artificial Intelligence",
      tech.id,
      "en",
    );

    // Assign categories to post
    await post.assignCategory(tech, "en");
    await post.assignCategory(ai, "en");

    const categories = await post.categories().get();
    expect(categories.length).toBe(2);

    // Detach one category
    await post.detachCategories(tech, "en");
    const remaining = await post.categories().get();
    expect(remaining.length).toBe(1);
    expect(remaining[0]?.id).toBe(ai.id);
  });
});
