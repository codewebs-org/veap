import { type CastType, Model, MorphMap, type Relation } from "@veap/database";

export class DefaultCommentAuthor extends Model<Record<string, any>> {
  static override table = "users";
  static override morphAlias = "user";
}

export type CommentAuthorModel = {
  new (...args: any[]): Model<any>;
  table: string;
  morphAlias?: string;
};
let customAuthorModel: CommentAuthorModel | null = null;

export function setCommentAuthorModel(model: CommentAuthorModel | null): void {
  customAuthorModel = model;
}

export function getCommentAuthorModel(): CommentAuthorModel {
  if (customAuthorModel) return customAuthorModel;
  const morphed = MorphMap.getModel("user");
  if (morphed) return morphed;
  return DefaultCommentAuthor;
}

export interface CommentAttributes {
  id: string;
  commentableType: string;
  commentable_type?: string;
  commentableId: string;
  commentable_id?: string;
  authorId?: string | null;
  author_id?: string | null;
  authorName?: string | null;
  author_name?: string | null;
  authorEmail?: string | null;
  author_email?: string | null;
  parentId?: string | null;
  parent_id?: string | null;
  content: string;
  status: "pending" | "approved" | "spam" | "rejected" | "trash";
  createdAt?: Date;
  created_at?: Date;
  updatedAt?: Date | null;
  updated_at?: Date | null;
}

export class Comment extends Model<CommentAttributes> {
  static override table = "comments";
  static morphAlias = "comment";

  static casts: Record<string, CastType> = {
    authorId: "string",
    author_id: "string",
    parentId: "string",
    parent_id: "string",
    createdAt: "datetime",
    created_at: "datetime",
    updatedAt: "datetime",
    updated_at: "datetime",
  };

  /**
   * Parent comment in threaded hierarchy.
   */
  /**
   * Optional author of the comment (if authenticated user).
   */
  author(): Relation<Comment, any> {
    const authorModel = getCommentAuthorModel();
    return this.belongsTo(authorModel as any, "author_id");
  }

  parent(): Relation<Comment, Comment> {
    return this.belongsTo(Comment, "parent_id");
  }

  /**
   * Child replies to this comment.
   */
  replies(): Relation<Comment, Comment> {
    return this.hasMany(Comment, "parent_id");
  }

  /**
   * The owning polymorphic entity (e.g. BlogPost, Product, etc.).
   */
  commentable(): Relation<Comment, any> {
    return this.morphTo("commentable");
  }

  /**
   * Helper to create a reply to this comment.
   */
  async reply(attributes: {
    content: string;
    authorId?: string | null;
    authorName?: string | null;
    authorEmail?: string | null;
    status?: "pending" | "approved" | "spam" | "rejected" | "trash";
  }): Promise<Comment> {
    const reply = new Comment();
    reply.setAttribute(
      "commentable_type",
      this.getAttribute("commentable_type"),
    );
    reply.setAttribute("commentable_id", this.getAttribute("commentable_id"));
    reply.setAttribute("parent_id", this.id);
    reply.setAttribute("content", attributes.content);
    reply.setAttribute("status", attributes.status ?? "approved");
    if (attributes.authorId)
      reply.setAttribute("author_id", attributes.authorId);
    if (attributes.authorName)
      reply.setAttribute("author_name", attributes.authorName);
    if (attributes.authorEmail)
      reply.setAttribute("author_email", attributes.authorEmail);
    await reply.save();
    return reply;
  }
}

MorphMap.register({ comment: Comment });
