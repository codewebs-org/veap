import { Model, ModelQueryBuilder, type MorphToMany } from "@veap/database";
import { Tag } from "../models/Tag.js";

export type Constructor<T = {}> = new (...args: any[]) => T;

export interface ITaggableModel {
  tags(): MorphToMany<any, Tag>;
  attachTags(
    tags: (string | Tag)[] | string | Tag,
    locale?: string,
  ): Promise<this>;
  detachTags(
    tags?: (string | Tag)[] | string | Tag,
    locale?: string,
  ): Promise<this>;
  syncTags(
    tags: (string | Tag)[] | string | Tag,
    locale?: string,
  ): Promise<this>;
}

export async function resolveTagIds(
  tags: (string | Tag)[] | string | Tag,
  locale = "pl",
): Promise<string[]> {
  const list = Array.isArray(tags) ? tags : [tags];
  const ids: string[] = [];

  for (const item of list) {
    if (!item) continue;
    if (typeof item === "string") {
      const isUuid =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          item,
        );
      if (isUuid) {
        ids.push(item);
      } else {
        const tag = await Tag.findOrCreateByName(item, locale);
        ids.push(tag.id);
      }
    } else if (typeof item === "object" && "id" in item) {
      ids.push((item as any).id);
    }
  }

  return Array.from(new Set(ids));
}

export function mixinTaggableQueryMethods<T extends any>(builder: T): T {
  const b = builder as any;
  b.whereTag = function (nameOrSlug: string, locale?: string) {
    return this.whereHas("tags", (q: any) => {
      q.whereHas("translations", (t: any) => {
        t.where((cond: any) => {
          cond.where("key", "name").where("value", nameOrSlug);
          cond.orWhere("key", "slug").where("value", nameOrSlug);
        });
        if (locale) {
          t.where("locale", locale);
        }
      });
    });
  };
  b.whereAnyTag = function (namesOrSlugs: string[], locale?: string) {
    return this.whereHas("tags", (q: any) => {
      q.whereHas("translations", (t: any) => {
        t.whereIn("value", namesOrSlugs);
        if (locale) {
          t.where("locale", locale);
        }
      });
    });
  };
  b.whereAllTags = function (namesOrSlugs: string[], locale?: string) {
    for (const item of namesOrSlugs) {
      this.whereTag(item, locale);
    }
    return this;
  };
  b.withTags = function () {
    return this.with("tags.translations");
  };
  return builder;
}

export class TaggableQueryBuilder<
  M extends Model = any,
> extends ModelQueryBuilder<M> {
  constructor(modelClass: any, customKnexBuilder?: any) {
    super(modelClass, customKnexBuilder);
    mixinTaggableQueryMethods(this);
  }
  /**
   * Filter records that have a specific tag by name or slug.
   */
  whereTag(nameOrSlug: string, locale?: string): this {
    return this.whereHas("tags", (q) => {
      q.whereHas("translations", (t) => {
        t.where((cond: any) => {
          cond.where("key", "name").where("value", nameOrSlug);
          cond.orWhere("key", "slug").where("value", nameOrSlug);
        });
        if (locale) {
          t.where("locale", locale);
        }
      });
    });
  }

  /**
   * Filter records that have any of the specified tags.
   */
  whereAnyTag(namesOrSlugs: string[], locale?: string): this {
    return this.whereHas("tags", (q) => {
      q.whereHas("translations", (t) => {
        t.whereIn("value", namesOrSlugs);
        if (locale) {
          t.where("locale", locale);
        }
      });
    });
  }

  /**
   * Filter records that have all of the specified tags.
   */
  whereAllTags(namesOrSlugs: string[], locale?: string): this {
    for (const item of namesOrSlugs) {
      this.whereTag(item, locale);
    }
    return this;
  }

  /**
   * Eager load tags with their translations.
   */
  withTags(): this {
    return this.with("tags.translations");
  }
}

export type TaggableClass<TBase extends Constructor<Model>> = TBase & {
  query<M extends Model>(this: {
    new (...args: any[]): M;
    table: string;
  }): TaggableQueryBuilder<M>;
  new (...args: any[]): ITaggableModel;
};

/**
 * Mixin to add polymorphic tagging capabilities to any Model class.
 */
export function Taggable<TBase extends Constructor<Model>>(
  Base: TBase,
): TaggableClass<TBase> {
  const Mixed = class extends Base {
    static query<M extends Model>(this: {
      new (...args: any[]): M;
      table: string;
    }): any {
      const q = (Base as any).query
        ? (Base as any).query.call(this)
        : new TaggableQueryBuilder<M>(this);
      return mixinTaggableQueryMethods(q);
    }

    tags(): MorphToMany<any, Tag> {
      return (this as any).morphToMany(Tag, "taggable");
    }

    async attachTags(
      tags: (string | Tag)[] | string | Tag,
      locale = "pl",
    ): Promise<this> {
      const ids = await resolveTagIds(tags, locale);
      if (ids.length > 0) {
        await this.tags().attach(ids);
      }
      return this as any;
    }

    async detachTags(
      tags?: (string | Tag)[] | string | Tag,
      locale = "pl",
    ): Promise<this> {
      if (!tags) {
        await this.tags().detach();
      } else {
        const ids = await resolveTagIds(tags, locale);
        if (ids.length > 0) {
          await this.tags().detach(ids);
        }
      }
      return this as any;
    }

    async syncTags(
      tags: (string | Tag)[] | string | Tag,
      locale = "pl",
    ): Promise<this> {
      const ids = await resolveTagIds(tags, locale);
      await this.tags().sync(ids);
      return this as any;
    }
  };

  return Mixed as any;
}

/**
 * Base TaggableModel class providing polymorphic tagging out of the box.
 */
export class TaggableModel<
  Attributes extends Record<string, any> = Record<string, any>,
> extends Model<Attributes> {
  static override query<M extends Model>(this: {
    new (...args: any[]): M;
    table: string;
  }): TaggableQueryBuilder<M> {
    return new TaggableQueryBuilder<M>(this);
  }

  tags(): MorphToMany<this, Tag> {
    return (this as any).morphToMany(Tag, "taggable");
  }

  async attachTags(
    tags: (string | Tag)[] | string | Tag,
    locale = "pl",
  ): Promise<this> {
    const ids = await resolveTagIds(tags, locale);
    if (ids.length > 0) {
      await this.tags().attach(ids);
    }
    return this;
  }

  async detachTags(
    tags?: (string | Tag)[] | string | Tag,
    locale = "pl",
  ): Promise<this> {
    if (!tags) {
      await this.tags().detach();
    } else {
      const ids = await resolveTagIds(tags, locale);
      if (ids.length > 0) {
        await this.tags().detach(ids);
      }
    }
    return this;
  }

  async syncTags(
    tags: (string | Tag)[] | string | Tag,
    locale = "pl",
  ): Promise<this> {
    const ids = await resolveTagIds(tags, locale);
    await this.tags().sync(ids);
    return this;
  }
}
