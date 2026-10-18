import { type CastType, MorphMap } from "@veap/database";
import { TranslatableModel } from "@veap/translatable";

export interface TagAttributes {
  id: string;
  createdAt?: Date;
  created_at?: Date;
  updatedAt?: Date | null;
  updated_at?: Date | null;

  // Translatable attributes
  name?: string;
  slug?: string;
  description?: string | null;
}

export function slugifyTag(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export class Tag extends TranslatableModel<TagAttributes> {
  static override table = "tags";
  static morphAlias = "tag";
  static override translatable = ["name", "slug", "description"];

  static casts: Record<string, CastType> = {
    createdAt: "datetime",
    created_at: "datetime",
    updatedAt: "datetime",
    updated_at: "datetime",
  };

  /**
   * Finds an existing Tag by name or slug, or creates a new one.
   */
  static async findOrCreateByName(name: string, locale = "pl"): Promise<Tag> {
    const cleanName = name.trim();
    const slug = slugifyTag(cleanName);

    const existing = await this.query()
      .whereTranslation("name", cleanName, locale)
      .orWhereTranslation("slug", slug, locale)
      .first();

    if (existing) {
      return existing;
    }

    const tag = new Tag();
    tag.fillTranslations({
      [locale]: {
        name: cleanName,
        slug,
      },
    });
    await tag.save();
    return tag;
  }
}

MorphMap.register({ tag: Tag });
