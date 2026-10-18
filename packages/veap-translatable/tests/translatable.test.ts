import { getKnex, initDatabase, MorphMap, runMigrations } from "@veap/database";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  getDefaultLocale,
  getLocale,
  setFallbackLocale,
  setLocale,
} from "../src/locale/manager.js";
import { translatableMigrations } from "../src/migrations/index.js";
import { Translation } from "../src/models/Translation.js";
import { TranslatableModel } from "../src/traits/Translatable.js";

interface ArticleAttributes {
  id: string;
  slug: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Article extends TranslatableModel<ArticleAttributes> {
  static override table = "articles";
  static override morphAlias = "article";
  static override translatable = ["title", "content"];
}

describe("@veap/translatable", () => {
  beforeAll(async () => {
    const db = initDatabase({
      client: "better-sqlite3",
      connection: { filename: ":memory:" },
      useNullAsDefault: true,
    });

    // Create articles table for testing
    await db.schema.createTable("articles", (table: any) => {
      table.string("id").primary();
      table.string("slug").notNullable();
      table.timestamps(true, true);
    });

    // Run translatable migrations using migration runner
    await runMigrations("translatable", translatableMigrations);
  });

  beforeEach(() => {
    setLocale("en");
    setFallbackLocale("en");
  });

  afterAll(async () => {
    const db = getKnex();
    await db.destroy();
  });

  it("manages locale state correctly", () => {
    expect(getDefaultLocale()).toBe("en");
    expect(getLocale()).toBe("en");

    setLocale("pl");
    expect(getLocale()).toBe("pl");

    setLocale("de");
    expect(getLocale()).toBe("de");
  });

  it("saves and retrieves polymorphic translations", async () => {
    const article = new Article();
    article.id = "art-1";
    article.slug = "first-post";
    article.setTranslation("title", "en", "Welcome to Veap");
    article.setTranslation("title", "pl", "Witaj w Veap");
    article.setTranslation("content", "en", "Veap is modern framework");
    article.setTranslation("content", "pl", "Veap to nowoczesny framework");

    await article.save();

    // Verify stored translations in database
    const translations = await Translation.query()
      .where("translatableId", "art-1")
      .get();
    expect(translations.length).toBe(4);

    // Fetch article back from database
    const loaded = await Article.find("art-1");
    expect(loaded).not.toBeNull();

    expect(loaded!.getTranslation("title", "en")).toBe("Welcome to Veap");
    expect(loaded!.getTranslation("title", "pl")).toBe("Witaj w Veap");
    expect(loaded!.getTranslation("content", "en")).toBe(
      "Veap is modern framework",
    );
    expect(loaded!.getTranslation("content", "pl")).toBe(
      "Veap to nowoczesny framework",
    );
  });

  it("respects active locale and fallbacks", async () => {
    const article = await Article.find("art-1");
    expect(article).not.toBeNull();

    setLocale("pl");
    expect(article!.getTranslation("title")).toBe("Witaj w Veap");

    setLocale("en");
    expect(article!.getTranslation("title")).toBe("Welcome to Veap");

    // When translation is missing in German, fallback to English
    setLocale("de");
    setFallbackLocale("en");
    expect(article!.getTranslation("title")).toBe("Welcome to Veap");
  });

  it("supports query builder whereTranslation filter", async () => {
    const results = await Article.query()
      .whereTranslation("title", "Witaj w Veap", "pl")
      .get();

    expect(results.length).toBe(1);
    expect(results[0].id).toBe("art-1");

    const emptyResults = await Article.query()
      .whereTranslation("title", "Nonexistent", "pl")
      .get();
    expect(emptyResults.length).toBe(0);
  });
});
