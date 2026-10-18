import {
  Model,
  ModelQueryBuilder,
  MorphToMany,
  Relation,
} from "@veap/database";
import { Category } from "../models/Category.js";

export class MorphOneCategory<
  Parent extends Model = any,
  Related extends Model = any,
> extends Relation<Parent, Related> {
  private innerRelation: MorphToMany<Parent, Related>;

  constructor(
    parent: Parent,
    related: any,
    morphName: string,
    pivotTable: string,
    foreignPivotKey: string,
    relatedPivotKey: string,
    morphTypeColumn: string,
    localKey = (parent.constructor as typeof Model).primaryKey || "id",
    relatedKey = (related as typeof Model).primaryKey || "id",
  ) {
    super(parent, related, foreignPivotKey, localKey);
    this.innerRelation = new MorphToMany(
      parent,
      related,
      morphName,
      pivotTable,
      foreignPivotKey,
      relatedPivotKey,
      morphTypeColumn,
      localKey,
      relatedKey,
    );
  }

  query(): ModelQueryBuilder<Related> {
    return this.innerRelation.query();
  }

  async get(): Promise<Related | null> {
    const list = await this.innerRelation.get();
    return list[0] ?? null;
  }

  async match(parents: Parent[], relationName: string): Promise<void> {
    await this.innerRelation.match(parents, relationName);
    for (const parent of parents) {
      const list = parent.getRelation(relationName);
      if (Array.isArray(list)) {
        parent.setRelation(relationName, list[0] ?? null);
      }
    }
  }
}
export type Constructor<T = {}> = new (...args: any[]) => T;

export interface ICategorizableModel {
  categories(): MorphToMany<any, Category>;
  category(): MorphOneCategory<any, Category>;
  assignCategory(category: string | Category, locale?: string): Promise<this>;
  syncCategories(
    categories: (string | Category)[] | string | Category,
    locale?: string,
  ): Promise<this>;
  detachCategories(
    categories?: (string | Category)[] | string | Category,
    locale?: string,
  ): Promise<this>;
}

export async function resolveCategoryIds(
  categories: (string | Category)[] | string | Category,
  locale = "pl",
): Promise<string[]> {
  const list = Array.isArray(categories) ? categories : [categories];
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
        const cat = await Category.findOrCreateByName(item, undefined, locale);
        ids.push(cat.id);
      }
    } else if (typeof item === "object" && "id" in item) {
      ids.push((item as any).id);
    }
  }

  return Array.from(new Set(ids));
}

export function mixinCategorizableQueryMethods<T extends any>(builder: T): T {
  const b = builder as any;
  b.whereCategory = function (nameOrSlugOrId: string, locale?: string) {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        nameOrSlugOrId,
      );

    if (isUuid) {
      return this.whereHas("categories", (q: any) => {
        q.where("id", nameOrSlugOrId);
      });
    }

    return this.whereHas("categories", (q: any) => {
      q.whereHas("translations", (t: any) => {
        t.where((cond: any) => {
          cond.where("key", "name").where("value", nameOrSlugOrId);
          cond.orWhere("key", "slug").where("value", nameOrSlugOrId);
        });
        if (locale) {
          t.where("locale", locale);
        }
      });
    });
  };

  b.whereInCategories = function (
    namesOrSlugsOrIds: string[],
    locale?: string,
  ) {
    const uuids = namesOrSlugsOrIds.filter((x: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x),
    );
    const namesOrSlugs = namesOrSlugsOrIds.filter(
      (x: string) =>
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          x,
        ),
    );

    return this.whereHas("categories", (q: any) => {
      q.where((orGroup: any) => {
        if (uuids.length > 0) {
          orGroup.whereIn("id", uuids);
        }
        if (namesOrSlugs.length > 0) {
          orGroup.orWhereHas("translations", (t: any) => {
            t.whereIn("value", namesOrSlugs);
            if (locale) {
              t.where("locale", locale);
            }
          });
        }
      });
    });
  };

  b.withCategories = function () {
    return this.with("categories.translations");
  };
  return builder;
}

export class CategorizableQueryBuilder<
  M extends Model = any,
> extends ModelQueryBuilder<M> {
  constructor(modelClass: any, customKnexBuilder?: any) {
    super(modelClass, customKnexBuilder);
    mixinCategorizableQueryMethods(this);
  }
  /**
   * Filter records belonging to a category by name, slug or id.
   */
  whereCategory(nameOrSlugOrId: string, locale?: string): this {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        nameOrSlugOrId,
      );

    if (isUuid) {
      return this.whereHas("categories", (q) => {
        q.where("id", nameOrSlugOrId);
      });
    }

    return this.whereHas("categories", (q) => {
      q.whereHas("translations", (t) => {
        t.where((cond: any) => {
          cond.where("key", "name").where("value", nameOrSlugOrId);
          cond.orWhere("key", "slug").where("value", nameOrSlugOrId);
        });
        if (locale) {
          t.where("locale", locale);
        }
      });
    });
  }

  /**
   * Filter records belonging to any of the specified categories.
   */
  whereInCategories(namesOrSlugsOrIds: string[], locale?: string): this {
    const uuids = namesOrSlugsOrIds.filter((x) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x),
    );
    const namesOrSlugs = namesOrSlugsOrIds.filter(
      (x) =>
        !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          x,
        ),
    );

    return this.whereHas("categories", (q) => {
      q.where((orGroup: any) => {
        if (uuids.length > 0) {
          orGroup.whereIn("id", uuids);
        }
        if (namesOrSlugs.length > 0) {
          orGroup.orWhereHas("translations", (t: any) => {
            t.whereIn("value", namesOrSlugs);
            if (locale) {
              t.where("locale", locale);
            }
          });
        }
      });
    });
  }

  /**
   * Eager load categories with their translations.
   */
  withCategories(): this {
    return this.with("categories.translations");
  }
}

export type CategorizableClass<TBase extends Constructor<Model>> = TBase & {
  query<M extends Model>(this: {
    new (...args: any[]): M;
    table: string;
  }): CategorizableQueryBuilder<M>;
  new (...args: any[]): ICategorizableModel;
};

/**
 * Mixin to add polymorphic categorization capabilities to any Model class.
 */
export function Categorizable<TBase extends Constructor<Model>>(
  Base: TBase,
): CategorizableClass<TBase> {
  const Mixed = class extends Base {
    static query<M extends Model>(this: {
      new (...args: any[]): M;
      table: string;
    }): any {
      const q = (Base as any).query
        ? (Base as any).query.call(this)
        : new CategorizableQueryBuilder<M>(this);
      return mixinCategorizableQueryMethods(q);
    }

    categories(): MorphToMany<any, Category> {
      return (this as any).morphToMany(Category, "categorizable");
    }

    category(): MorphOneCategory<any, Category> {
      return new MorphOneCategory(
        this as any,
        Category,
        "categorizable",
        "categorizables",
        "categorizable_id",
        "category_id",
        "categorizable_type",
      );
    }

    async assignCategory(
      category: string | Category,
      locale = "pl",
    ): Promise<this> {
      const ids = await resolveCategoryIds(category, locale);
      if (ids.length > 0) {
        await (this as any).categories().attach(ids);
      }
      return this as any;
    }

    async syncCategories(
      categories: (string | Category)[] | string | Category,
      locale = "pl",
    ): Promise<this> {
      const ids = await resolveCategoryIds(categories, locale);
      await (this as any).categories().sync(ids);
      return this as any;
    }

    async detachCategories(
      categories?: (string | Category)[] | string | Category,
      locale = "pl",
    ): Promise<this> {
      if (!categories) {
        await (this as any).categories().detach();
      } else {
        const ids = await resolveCategoryIds(categories, locale);
        if (ids.length > 0) {
          await (this as any).categories().detach(ids);
        }
      }
      return this as any;
    }
  };

  return Mixed as any;
}

/**
 * Base CategorizableModel class providing polymorphic categorization out of the box.
 */
export class CategorizableModel<
  Attributes extends Record<string, any> = Record<string, any>,
> extends Model<Attributes> {
  static override query<M extends Model>(this: {
    new (...args: any[]): M;
    table: string;
  }): CategorizableQueryBuilder<M> {
    return new CategorizableQueryBuilder<M>(this);
  }

  categories(): MorphToMany<this, Category> {
    return (this as any).morphToMany(Category, "categorizable");
  }

  category(): MorphOneCategory<this, Category> {
    return new MorphOneCategory(
      this as any,
      Category,
      "categorizable",
      "categorizables",
      "categorizable_id",
      "category_id",
      "categorizable_type",
    );
  }

  async assignCategory(
    category: string | Category,
    locale = "pl",
  ): Promise<this> {
    const ids = await resolveCategoryIds(category, locale);
    if (ids.length > 0) {
      await this.categories().attach(ids);
    }
    return this;
  }

  async syncCategories(
    categories: (string | Category)[] | string | Category,
    locale = "pl",
  ): Promise<this> {
    const ids = await resolveCategoryIds(categories, locale);
    await this.categories().sync(ids);
    return this;
  }

  async detachCategories(
    categories?: (string | Category)[] | string | Category,
    locale = "pl",
  ): Promise<this> {
    if (!categories) {
      await this.categories().detach();
    } else {
      const ids = await resolveCategoryIds(categories, locale);
      if (ids.length > 0) {
        await this.categories().detach(ids);
      }
    }
    return this;
  }
}
