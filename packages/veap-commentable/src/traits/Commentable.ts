import { Model, ModelQueryBuilder, type MorphMany } from "@veap/database";
import { Comment } from "../models/Comment.js";

export type Constructor<T = {}> = new (...args: any[]) => T;

export interface ICommentableModel {
  comments(): MorphMany<any, Comment>;
  approvedComments(): Promise<Comment[]>;
  addComment(attributes: {
    content: string;
    authorId?: string | null;
    authorName?: string | null;
    authorEmail?: string | null;
    parentId?: string | null;
    status?: "pending" | "approved" | "spam" | "rejected" | "trash";
  }): Promise<Comment>;
}

export function mixinCommentableQueryMethods<T extends any>(builder: T): T {
  const b = builder as any;
  b.whereHasComments = function () {
    return this.whereHas("comments");
  };
  b.withComments = function () {
    return this.with("comments");
  };
  return builder;
}

export class CommentableQueryBuilder<
  M extends Model = any,
> extends ModelQueryBuilder<M> {
  constructor(modelClass: any, customKnexBuilder?: any) {
    super(modelClass, customKnexBuilder);
    mixinCommentableQueryMethods(this);
  }
  /**
   * Filter models having comments.
   */
  whereHasComments(): this {
    return this.whereHas("comments");
  }

  /**
   * Eager load comments.
   */
  withComments(): this {
    return this.with("comments");
  }
}

export type CommentableClass<TBase extends Constructor<Model>> = TBase & {
  query<M extends Model>(this: {
    new (...args: any[]): M;
    table: string;
  }): CommentableQueryBuilder<M>;
  new (...args: any[]): ICommentableModel;
};

/**
 * Mixin to add polymorphic commenting capabilities to any Model class.
 */
export function Commentable<TBase extends Constructor<Model>>(
  Base: TBase,
): CommentableClass<TBase> {
  const Mixed = class extends Base {
    static query<M extends Model>(this: {
      new (...args: any[]): M;
      table: string;
    }): any {
      const q = (Base as any).query
        ? (Base as any).query.call(this)
        : new CommentableQueryBuilder<M>(this);
      return mixinCommentableQueryMethods(q);
    }

    comments(): MorphMany<any, Comment> {
      return (this as any).morphMany(Comment, "commentable");
    }

    async approvedComments(): Promise<Comment[]> {
      return await (this as any)
        .comments()
        .query()
        .where("status", "approved")
        .get();
    }

    async addComment(attributes: {
      content: string;
      authorId?: string | null;
      authorName?: string | null;
      authorEmail?: string | null;
      parentId?: string | null;
      status?: "pending" | "approved" | "spam" | "rejected" | "trash";
    }): Promise<Comment> {
      const comment = new Comment();
      const morphClass = this.constructor as typeof Model;
      const morphType = morphClass.morphAlias || morphClass.table;
      comment.setAttribute("commentable_type", morphType);
      comment.setAttribute("commentable_id", (this as any).id);
      comment.setAttribute("content", attributes.content);
      comment.setAttribute("status", attributes.status ?? "approved");
      if (attributes.authorId)
        comment.setAttribute("author_id", attributes.authorId);
      if (attributes.authorName)
        comment.setAttribute("author_name", attributes.authorName);
      if (attributes.authorEmail)
        comment.setAttribute("author_email", attributes.authorEmail);
      if (attributes.parentId)
        comment.setAttribute("parent_id", attributes.parentId);
      await comment.save();
      return comment;
    }
  };

  return Mixed as any;
}

/**
 * Base CommentableModel class providing polymorphic commenting out of the box.
 */
export class CommentableModel<
  Attributes extends Record<string, any> = Record<string, any>,
> extends Model<Attributes> {
  static override query<M extends Model>(this: {
    new (...args: any[]): M;
    table: string;
  }): CommentableQueryBuilder<M> {
    return new CommentableQueryBuilder<M>(this);
  }

  comments(): MorphMany<this, Comment> {
    return (this as any).morphMany(Comment, "commentable");
  }

  async approvedComments(): Promise<Comment[]> {
    return await this.comments().query().where("status", "approved").get();
  }

  async addComment(attributes: {
    content: string;
    authorId?: string | null;
    authorName?: string | null;
    authorEmail?: string | null;
    parentId?: string | null;
    status?: "pending" | "approved" | "spam" | "rejected" | "trash";
  }): Promise<Comment> {
    const comment = new Comment();
    const morphClass = this.constructor as typeof Model;
    const morphType = morphClass.morphAlias || morphClass.table;
    comment.setAttribute("commentable_type", morphType);
    comment.setAttribute("commentable_id", this.id);
    comment.setAttribute("content", attributes.content);
    comment.setAttribute("status", attributes.status ?? "approved");
    if (attributes.authorId)
      comment.setAttribute("author_id", attributes.authorId);
    if (attributes.authorName)
      comment.setAttribute("author_name", attributes.authorName);
    if (attributes.authorEmail)
      comment.setAttribute("author_email", attributes.authorEmail);
    if (attributes.parentId)
      comment.setAttribute("parent_id", attributes.parentId);
    await comment.save();
    return comment;
  }
}
