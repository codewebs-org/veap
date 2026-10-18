import { type CastType, MorphMap, type Relation } from "@veap/database";
import { TranslatableModel } from "@veap/translatable";

export interface CategoryAttributes {
  id: string;
  parentId?: string | null;
  parent_id?: string | null;
  createdAt?: Date;
  created_at?: Date;
  updatedAt?: Date | null;
  updated_at?: Date | null;

  // Translatable attributes
  name?: string;
  slug?: string;
  description?: string | null;
}

export function slugifyCategory(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class Category extends TranslatableModel<CategoryAttributes> {
  static override table = "categories";
  static morphAlias = "category";
  static override translatable = ["name", "slug", "description"];

  static casts: Record<string, CastType> = {
    parentId: "string",
    parent_id: "string",
    createdAt: "datetime",
    created_at: "datetime",
    updatedAt: "datetime",
    updated_at: "datetime",
  };

  /**
   * Parent category relationship.
   */
  parent(): Relation<Category, Category> {
    return this.belongsTo(Category, "parent_id");
  }

  /**
   * Child categories relationship.
   */
  children(): Relation<Category, Category> {
    return this.hasMany(Category, "parent_id");
  }

  /**
   * Finds an existing Category by name or slug, or creates a new one.
   */
  static async findOrCreateByName(
    name: string,
    parentId?: string | null,
    locale = "pl",
  ): Promise<Category> {
    const cleanName = name.trim();
    const slug = slugifyCategory(cleanName);

    let query = this.query()
      .whereTranslation("name", cleanName, locale)
      .orWhereTranslation("slug", slug, locale);

    if (parentId !== undefined) {
      if (parentId === null) {
        query = query.whereNull("parent_id");
      } else {
        query = query.where("parent_id", parentId);
      }
    }

    const existing = await query.first();
    if (existing) {
      return existing;
    }

    const category = new Category();
    if (parentId) {
      category.setAttribute("parent_id", parentId);
    }
    category.fillTranslations({
      [locale]: {
        name: cleanName,
        slug,
      },
    });
    await category.save();
    return category;
  }
}

MorphMap.register({ category: Category });
