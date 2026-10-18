import {
  getKnex,
  type Model,
  ModelQueryBuilder,
  MorphMap,
} from "@veap/database";
import { getLocale } from "../locale/manager.js";

export class TranslatableQueryBuilder<
  M extends Model = any,
> extends ModelQueryBuilder<M> {
  constructor(modelClass: any, customKnexBuilder?: any) {
    super(modelClass, customKnexBuilder);
    this.withTranslations();
  }

  /**
   * Filter records where translation matches given value.
   * If locale is provided, restricts to that locale; otherwise matches across any locale.
   */
  whereTranslation(key: string, value: any, locale?: string): this {
    return this.whereHas("translations", (q) => {
      q.where("key", key).where("value", value);
      if (locale) {
        q.where("locale", locale);
      }
    });
  }

  /**
   * Filter records where translation matches given pattern (LIKE/ILIKE).
   */
  whereTranslationLike(key: string, value: string, locale?: string): this {
    return this.whereHas("translations", (q) => {
      q.where("key", key).whereLike("value", value);
      if (locale) {
        q.where("locale", locale);
      }
    });
  }

  /**
   * Filter records where translation matches in OR condition.
   */
  orWhereTranslation(key: string, value: any, locale?: string): this {
    return this.orWhereHas("translations", (q) => {
      q.where("key", key).where("value", value);
      if (locale) {
        q.where("locale", locale);
      }
    });
  }

  /**
   * Filter records where translation matches pattern in OR condition.
   */
  orWhereTranslationLike(key: string, value: string, locale?: string): this {
    return this.orWhereHas("translations", (q) => {
      q.where("key", key).whereLike("value", value);
      if (locale) {
        q.where("locale", locale);
      }
    });
  }

  /**
   * Filter records where translation matches one of the given values.
   */
  whereTranslationIn(key: string, values: any[], locale?: string): this {
    return this.whereHas("translations", (q) => {
      q.where("key", key).whereIn("value", values);
      if (locale) {
        q.where("locale", locale);
      }
    });
  }

  /**
   * Eager load translations.
   */
  withTranslations(): this {
    if (!this.eagerRelations.includes("translations")) {
      this.with("translations");
    }
    return this;
  }

  /**
   * Disable automatic eager loading of translations.
   */
  withoutTranslations(): this {
    this.eagerRelations = this.eagerRelations.filter(
      (r) => r !== "translations",
    );
    return this;
  }

  /**
   * Orders results by the translated value of a field in a given locale.
   */
  orderByTranslation(
    key: string,
    direction: "asc" | "desc" = "asc",
    locale?: string,
  ): this {
    const targetLocale = locale || getLocale();
    const morphType = MorphMap.getMorphAlias(this.modelClass);
    const parentTable = this.modelClass.table;
    const pk = this.modelClass.primaryKey || "id";
    const knex = getKnex();

    const sub = knex("translations")
      .select("value")
      .where("translatable_type", morphType)
      .where("locale", targetLocale)
      .whereRaw(
        `CAST("translations"."translatable_id" AS TEXT) = CAST("${parentTable}"."${pk}" AS TEXT)`,
      )
      .limit(1);

    this.knexBuilder.orderBy(sub, direction);
    return this;
  }
}
