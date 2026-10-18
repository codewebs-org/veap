import { getKnex, initDatabase, MorphMap, runMigrations } from "@veap/database";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { commentableMigrations } from "../src/migrations/index.js";
import { Comment } from "../src/models/Comment.js";
import { CommentableModel } from "../src/traits/Commentable.js";

interface ArticleAttributes {
  id: string;
  title: string;
  createdAt?: Date;
  updatedAt?: Date;
}

class Article extends CommentableModel<ArticleAttributes> {
  static override table = "articles";
  static override morphAlias = "article";
}

describe("@veap/commentable", () => {
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

    // Run commentable migrations (comments table)
    await runMigrations("commentable", commentableMigrations);

    MorphMap.register({ article: Article, comment: Comment });
  });

  afterAll(async () => {
    const db = getKnex();
    await db.destroy();
  });

  it("adds and queries polymorphic comments on a model", async () => {
    const article = new Article();
    article.id = "art-500";
    article.title = "Architecture Discussion";
    await article.save();

    const c1 = await article.addComment({
      content: "First comment on article",
      authorName: "Alice",
      status: "approved",
    });

    expect(c1).toBeDefined();
    expect(c1.id).toBeDefined();
    expect(c1.getAttribute("content")).toBe("First comment on article");
    expect(c1.getAttribute("author_name")).toBe("Alice");
    expect(c1.getAttribute("status")).toBe("approved");

    const comments = await article.comments().get();
    expect(comments.length).toBe(1);
    expect(comments[0].id).toBe(c1.id);

    const approved = await article.approvedComments();
    expect(approved.length).toBe(1);
  });

  it("supports threaded hierarchical comments (parent/replies)", async () => {
    const article = await Article.find("art-500");
    expect(article).not.toBeNull();

    const rootComments = await article!.comments().get();
    const parentComment = rootComments[0]!;

    const reply = await article!.addComment({
      content: "Replying to Alice",
      authorName: "Bob",
      parentId: parentComment.id,
      status: "approved",
    });

    expect(reply.getAttribute("parent_id")).toBe(parentComment.id);

    // Query replies from parent
    const replies = await parentComment.replies().get();
    expect(replies.length).toBe(1);
    expect(replies[0].id).toBe(reply.id);

    // Query parent from reply
    const parent = await reply.parent().get();
    expect(parent).not.toBeNull();
    expect(parent!.id).toBe(parentComment.id);
  });

  it("filters models with whereHasComments query builder scope", async () => {
    const articlesWithComments = await Article.query().whereHasComments().get();
    expect(articlesWithComments.length).toBe(1);
    expect(articlesWithComments[0].id).toBe("art-500");

    // Create an empty article without comments
    const emptyArticle = new Article();
    emptyArticle.id = "art-empty";
    emptyArticle.title = "Empty Article";
    await emptyArticle.save();

    const allArticles = await Article.all();
    expect(allArticles.length).toBe(2);

    const onlyWithComments = await Article.query().whereHasComments().get();
    expect(onlyWithComments.length).toBe(1);
    expect(onlyWithComments[0].id).toBe("art-500");
  });
});
