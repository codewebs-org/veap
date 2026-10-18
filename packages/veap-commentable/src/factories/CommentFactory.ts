import { faker } from "@faker-js/faker";
import { Factory } from "@veap/database";
import { Comment } from "../models/Comment.js";

export class CommentFactory extends Factory<Comment> {
  constructor() {
    super(Comment);
  }

  definition() {
    return {
      content: faker.lorem.paragraph(1),
      status: "approved",
      created_at: faker.date.recent({ days: 14 }),
    };
  }

  forCommentable(target: any, type?: string): this {
    const isModel = target && typeof target === "object" && "id" in target;
    const targetId = isModel ? target.id : target;
    const resolvedType =
      type ||
      (isModel
        ? (target.constructor as any).morphAlias ||
          target.constructor.name.toLowerCase()
        : "post");
    return this.state({
      commentable_id: targetId,
      commentable_type: resolvedType,
    });
  }

  pending(): this {
    return this.state({ status: "pending" });
  }

  approved(): this {
    return this.state({ status: "approved" });
  }

  spam(): this {
    return this.state({ status: "spam" });
  }
}

export const createCommentFactory = () => new CommentFactory();

Factory.register(Comment, CommentFactory);
