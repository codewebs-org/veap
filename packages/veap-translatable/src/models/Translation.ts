import { type CastType, Model, MorphMap } from "@veap/database";

export interface TranslationAttributes {
  id: string;
  translatableType: string;
  translatable_type?: string;
  translatableId: string;
  translatable_id?: string;
  locale: string;
  key: string;
  value: string | null;
  createdAt?: Date;
  created_at?: Date;
  updatedAt?: Date | null;
  updated_at?: Date | null;
}

export class Translation extends Model<TranslationAttributes> {
  static table = "translations";

  static casts: Record<string, CastType> = {
    createdAt: "datetime",
    created_at: "datetime",
    updatedAt: "datetime",
    updated_at: "datetime",
  };

  /**
   * Get the parent translatable model (e.g. BlogPost, BlogCategory).
   */
  translatable<T extends Model = Model>() {
    return this.morphTo<T>("translatable");
  }
}

// Register Translation in MorphMap
MorphMap.register({
  translation: Translation,
  translations: Translation,
});
