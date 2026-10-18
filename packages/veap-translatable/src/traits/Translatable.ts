import { type CastType, Model, MorphMap } from "@veap/database";
import {
  getDefaultLocale,
  getFallbackLocale,
  getLocale,
} from "../locale/manager.js";
import { Translation } from "../models/Translation.js";
import { TranslatableQueryBuilder } from "../scopes/translation-scopes.js";

export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Base TranslatableModel class that provides seamless multilingual
 * translation support using Veap's polymorphic morphMany relation.
 */
export class TranslatableModel<
  Attributes extends Record<string, any> = Record<string, any>,
> extends Model<Attributes> {
  /**
   * Array of attribute keys that should be treated as translatable.
   * E.g. static translatable = ["title", "slug", "content"];
   */
  static translatable: string[] = [];

  /**
   * In-memory map of staged translations waiting to be saved.
   * Key format: `${locale}:${key}`
   */
  private _stagedTranslations?: Map<string, string | null>;

  /**
   * In-memory cache of loaded translations.
   * Key format: `${locale}:${key}`
   */
  private _cachedTranslations?: Map<string, string | null>;

  protected get stagedTranslations(): Map<string, string | null> {
    if (!this._stagedTranslations) {
      this._stagedTranslations = new Map();
    }
    return this._stagedTranslations;
  }

  protected get cachedTranslations(): Map<string, string | null> {
    if (!this._cachedTranslations) {
      this._cachedTranslations = new Map();
    }
    return this._cachedTranslations;
  }

  /**
   * Static Query Builder entrypoint returning TranslatableQueryBuilder.
   */
  static override query<M extends Model>(this: {
    new (...args: any[]): M;
    table: string;
  }): TranslatableQueryBuilder<M> {
    return new TranslatableQueryBuilder<M>(this);
  }

  /**
   * Defines the polymorphic morphMany relation to Translation.
   */
  translations() {
    return this.morphMany(Translation, "translatable");
  }

  /**
   * Syncs eager-loaded translations from `this._relations.translations` into cache.
   */
  protected syncEagerLoadedTranslations(): void {
    const rel = this._relations?.translations;
    if (Array.isArray(rel)) {
      for (const item of rel) {
        if (!item) continue;
        const loc =
          (typeof item.getAttribute === "function"
            ? item.getAttribute("locale")
            : null) ?? item.locale;
        const keyName =
          (typeof item.getAttribute === "function"
            ? item.getAttribute("key")
            : null) ?? item.key;
        const val =
          (typeof item.getAttribute === "function"
            ? item.getAttribute("value")
            : null) ?? item.value;

        if (loc && keyName) {
          const key = `${loc}:${keyName}`;
          if (!this.stagedTranslations.has(key)) {
            this.cachedTranslations.set(key, val);
          }
        }
      }
    }
  }

  /**
   * Gets the translation of an attribute in a given locale.
   * Falls back to fallbackLocale, defaultLocale, or base model attribute if enabled.
   */
  getTranslation(
    field: string,
    locale?: string,
    fallback = true,
  ): string | null {
    this.syncEagerLoadedTranslations();
    const targetLocale = locale || getLocale();
    const targetKey = `${targetLocale}:${field}`;

    if (this.stagedTranslations.has(targetKey)) {
      return this.stagedTranslations.get(targetKey) ?? null;
    }
    if (this.cachedTranslations.has(targetKey)) {
      return this.cachedTranslations.get(targetKey) ?? null;
    }

    if (fallback) {
      const fallbackLoc = getFallbackLocale();
      if (fallbackLoc && fallbackLoc !== targetLocale) {
        const fbKey = `${fallbackLoc}:${field}`;
        if (this.stagedTranslations.has(fbKey)) {
          return this.stagedTranslations.get(fbKey) ?? null;
        }
        if (this.cachedTranslations.has(fbKey)) {
          return this.cachedTranslations.get(fbKey) ?? null;
        }
      }

      const defaultLoc = getDefaultLocale();
      if (
        defaultLoc &&
        defaultLoc !== targetLocale &&
        defaultLoc !== fallbackLoc
      ) {
        const defKey = `${defaultLoc}:${field}`;
        if (this.stagedTranslations.has(defKey)) {
          return this.stagedTranslations.get(defKey) ?? null;
        }
        if (this.cachedTranslations.has(defKey)) {
          return this.cachedTranslations.get(defKey) ?? null;
        }
      }

      // Check if attribute is stored in physical table column as fallback
      const baseVal = super.getAttribute(field);
      if (baseVal !== undefined && baseVal !== null) {
        return String(baseVal);
      }
    }

    return null;
  }

  /**
   * Sets the translation of an attribute for a specific locale.
   */
  setTranslation(
    field: string,
    locale: string,
    value: string | null | undefined,
  ): this {
    const val = value !== undefined ? value : null;
    const key = `${locale}:${field}`;
    this.stagedTranslations.set(key, val);
    this.cachedTranslations.set(key, val);
    return this;
  }

  /**
   * Gets translations for a field as `{ [locale]: value }` or
   * for all fields as `{ [field]: { [locale]: value } }`.
   */
  getTranslations(field?: string): any {
    this.syncEagerLoadedTranslations();

    if (field) {
      const result: Record<string, string | null> = {};

      for (const [locKey, val] of this.cachedTranslations.entries()) {
        const colonIdx = locKey.indexOf(":");
        const loc = locKey.slice(0, colonIdx);
        const k = locKey.slice(colonIdx + 1);
        if (k === field) {
          result[loc] = val;
        }
      }

      for (const [locKey, val] of this.stagedTranslations.entries()) {
        const colonIdx = locKey.indexOf(":");
        const loc = locKey.slice(0, colonIdx);
        const k = locKey.slice(colonIdx + 1);
        if (k === field) {
          result[loc] = val;
        }
      }

      return result;
    }

    const result: Record<string, Record<string, string | null>> = {};
    const modelClass = this.constructor as typeof TranslatableModel;
    const fields = modelClass.translatable || [];

    for (const f of fields) {
      result[f] = this.getTranslations(f);
    }

    return result;
  }

  /**
   * Sets translations for a given field across multiple locales.
   * E.g. post.setTranslations("title", { pl: "Tytuł", en: "Title" })
   */
  setTranslations(
    field: string,
    translations: Record<string, string | null | undefined>,
  ): this {
    for (const [loc, val] of Object.entries(translations)) {
      this.setTranslation(field, loc, val);
    }
    return this;
  }

  /**
   * Fills translations from a nested dictionary.
   * Accepts either:
   * - By field: `{ title: { pl: "...", en: "..." } }`
   * - By locale: `{ pl: { title: "..." }, en: { title: "..." } }`
   */
  fillTranslations(translations: Record<string, any>): this {
    if (!translations || typeof translations !== "object") {
      return this;
    }
    const modelClass = this.constructor as typeof TranslatableModel;
    const translatableFields = new Set(modelClass.translatable || []);

    for (const [keyOrLocale, data] of Object.entries(translations)) {
      if (!data || typeof data !== "object") continue;

      if (translatableFields.has(keyOrLocale)) {
        this.setTranslations(keyOrLocale, data);
      } else {
        const locale = keyOrLocale;
        for (const [field, value] of Object.entries(data)) {
          this.setTranslation(field, locale, value as any);
        }
      }
    }
    return this;
  }

  /**
   * Loads translations for this model instance from the database into cache.
   */
  async loadTranslations(locales?: string[]): Promise<this> {
    const pk = (this.constructor as typeof Model).primaryKey || "id";
    const id = this.getAttribute(pk);
    if (!id) return this;

    const query = this.translations().query();
    if (locales && locales.length > 0) {
      query.whereIn("locale", locales);
    }
    const items = await query.get();
    for (const item of items) {
      const loc =
        (typeof item.getAttribute === "function"
          ? item.getAttribute("locale")
          : null) ?? item.locale;
      const keyName =
        (typeof item.getAttribute === "function"
          ? item.getAttribute("key")
          : null) ?? item.key;
      const val =
        (typeof item.getAttribute === "function"
          ? item.getAttribute("value")
          : null) ?? item.value;
      if (loc && keyName) {
        this.cachedTranslations.set(`${loc}:${keyName}`, val);
      }
    }
    this.setRelation("translations", items);
    return this;
  }

  /**
   * Saves all staged translations into the `translations` table.
   */
  async saveTranslations(): Promise<void> {
    if (this.stagedTranslations.size === 0) {
      return;
    }

    const pk = (this.constructor as typeof Model).primaryKey || "id";
    const idValue = this.getAttribute(pk);
    if (!idValue) {
      return;
    }

    const translatableType = MorphMap.getMorphAlias(this);

    for (const [compositeKey, value] of Array.from(
      this.stagedTranslations.entries(),
    )) {
      const colonIdx = compositeKey.indexOf(":");
      const locale = compositeKey.slice(0, colonIdx);
      const key = compositeKey.slice(colonIdx + 1);

      if (value === null || value === undefined) {
        await Translation.query()
          .where("translatable_type", translatableType)
          .where("translatable_id", String(idValue))
          .where("locale", locale)
          .where("key", key)
          .forceDelete();
        this.cachedTranslations.delete(compositeKey);
      } else {
        await Translation.query().updateOrCreate(
          {
            translatableType,
            translatableId: String(idValue),
            locale,
            key,
          },
          {
            value: String(value),
          },
        );
        this.cachedTranslations.set(compositeKey, String(value));
      }
    }

    this.stagedTranslations.clear();
  }

  /**
   * Deletes all translations for this model instance.
   */
  async deleteTranslations(): Promise<void> {
    const pk = (this.constructor as typeof Model).primaryKey || "id";
    const idValue = this.getAttribute(pk);
    if (!idValue) {
      return;
    }

    const translatableType = MorphMap.getMorphAlias(this);
    await Translation.query()
      .where("translatable_type", translatableType)
      .where("translatable_id", String(idValue))
      .forceDelete();

    this.stagedTranslations.clear();
    this.cachedTranslations.clear();
  }

  /**
   * Lifecycle hook called automatically when model is saved.
   */
  async saved(): Promise<void> {
    await this.saveTranslations();
  }

  /**
   * Lifecycle hook called automatically when model is deleted.
   */
  async deleted(): Promise<void> {
    await this.deleteTranslations();
  }

  /**
   * Intercepts attribute retrieval. If attribute is declared translatable,
   * returns translated value for current locale.
   */
  override getAttribute(key: string): any {
    const modelClass = this.constructor as typeof TranslatableModel;
    if (modelClass.translatable && modelClass.translatable.includes(key)) {
      const translation = this.getTranslation(key);
      if (translation !== null && translation !== undefined) {
        return translation;
      }
    }
    return super.getAttribute(key);
  }

  /**
   * Intercepts attribute setting. If attribute is declared translatable,
   * stages translation for current locale (or multiple locales if object passed).
   */
  override setAttribute(key: string, value: any): this {
    const modelClass = this.constructor as typeof TranslatableModel;
    if (modelClass.translatable && modelClass.translatable.includes(key)) {
      if (
        value &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        this.setTranslations(key, value);
        return this;
      }
      this.setTranslation(key, getLocale(), value);
      return this;
    }
    return super.setAttribute(key, value);
  }

  /**
   * Serializes model to JSON, merging translated attributes for current locale.
   */
  override toJSON(): Record<string, any> {
    const json = super.toJSON();
    const modelClass = this.constructor as typeof TranslatableModel;
    if (modelClass.translatable) {
      for (const field of modelClass.translatable) {
        json[field] = this.getTranslation(field);
      }
    }
    return json;
  }
}

export interface ITranslatableModel {
  translations(): any;
  getTranslation(
    field: string,
    locale?: string,
    fallback?: boolean,
  ): string | null;
  setTranslation(
    field: string,
    locale: string,
    value: string | null | undefined,
  ): this;
  getTranslations(field?: string): any;
  setTranslations(
    field: string,
    translations: Record<string, string | null | undefined>,
  ): this;
  fillTranslations(translations: Record<string, any>): this;
  loadTranslations(locales?: string[]): Promise<this>;
  saveTranslations(): Promise<void>;
  deleteTranslations(): Promise<void>;
}

export type TranslatableClass<TBase extends Constructor<Model>> = TBase & {
  translatable: string[];
  query<M extends Model>(this: {
    new (...args: any[]): M;
    table: string;
  }): TranslatableQueryBuilder<M>;
  new (...args: any[]): ITranslatableModel;
};

/**
 * Mixin to add translatable functionality to any class extending Model.
 */
export function Translatable<TBase extends Constructor<Model>>(
  Base: TBase,
): TranslatableClass<TBase> {
  const Mixed = class extends Base {
    static translatable: string[] = [];

    private _stagedTranslations?: Map<string, string | null>;
    private _cachedTranslations?: Map<string, string | null>;

    protected get stagedTranslations(): Map<string, string | null> {
      if (!this._stagedTranslations) {
        this._stagedTranslations = new Map();
      }
      return this._stagedTranslations;
    }

    protected get cachedTranslations(): Map<string, string | null> {
      if (!this._cachedTranslations) {
        this._cachedTranslations = new Map();
      }
      return this._cachedTranslations;
    }

    static query<M extends Model>(this: {
      new (...args: any[]): M;
      table: string;
    }): TranslatableQueryBuilder<M> {
      return new TranslatableQueryBuilder<M>(this);
    }

    translations() {
      return this.morphMany(Translation, "translatable");
    }

    protected syncEagerLoadedTranslations(): void {
      const rel = (this as any)._relations?.translations;
      if (Array.isArray(rel)) {
        for (const item of rel) {
          if (item && item.locale && item.key) {
            const key = `${item.locale}:${item.key}`;
            if (!this.stagedTranslations.has(key)) {
              this.cachedTranslations.set(key, item.value);
            }
          }
        }
      }
    }

    getTranslation(
      field: string,
      locale?: string,
      fallback = true,
    ): string | null {
      this.syncEagerLoadedTranslations();
      const targetLocale = locale || getLocale();
      const targetKey = `${targetLocale}:${field}`;

      if (this.stagedTranslations.has(targetKey)) {
        return this.stagedTranslations.get(targetKey) ?? null;
      }
      if (this.cachedTranslations.has(targetKey)) {
        return this.cachedTranslations.get(targetKey) ?? null;
      }

      if (fallback) {
        const fallbackLoc = getFallbackLocale();
        if (fallbackLoc && fallbackLoc !== targetLocale) {
          const fbKey = `${fallbackLoc}:${field}`;
          if (this.stagedTranslations.has(fbKey)) {
            return this.stagedTranslations.get(fbKey) ?? null;
          }
          if (this.cachedTranslations.has(fbKey)) {
            return this.cachedTranslations.get(fbKey) ?? null;
          }
        }

        const defaultLoc = getDefaultLocale();
        if (
          defaultLoc &&
          defaultLoc !== targetLocale &&
          defaultLoc !== fallbackLoc
        ) {
          const defKey = `${defaultLoc}:${field}`;
          if (this.stagedTranslations.has(defKey)) {
            return this.stagedTranslations.get(defKey) ?? null;
          }
          if (this.cachedTranslations.has(defKey)) {
            return this.cachedTranslations.get(defKey) ?? null;
          }
        }

        const baseVal = (this as any)._attributes?.[field];
        if (baseVal !== undefined && baseVal !== null) {
          return String(baseVal);
        }
      }

      return null;
    }

    setTranslation(
      field: string,
      locale: string,
      value: string | null | undefined,
    ): this {
      const val = value !== undefined ? value : null;
      const key = `${locale}:${field}`;
      this.stagedTranslations.set(key, val);
      this.cachedTranslations.set(key, val);
      return this;
    }

    getTranslations(field?: string): any {
      this.syncEagerLoadedTranslations();

      if (field) {
        const result: Record<string, string | null> = {};
        for (const [locKey, val] of this.cachedTranslations.entries()) {
          const colonIdx = locKey.indexOf(":");
          const loc = locKey.slice(0, colonIdx);
          const k = locKey.slice(colonIdx + 1);
          if (k === field) {
            result[loc] = val;
          }
        }
        for (const [locKey, val] of this.stagedTranslations.entries()) {
          const colonIdx = locKey.indexOf(":");
          const loc = locKey.slice(0, colonIdx);
          const k = locKey.slice(colonIdx + 1);
          if (k === field) {
            result[loc] = val;
          }
        }
        return result;
      }

      const result: Record<string, Record<string, string | null>> = {};
      const modelClass = this.constructor as any;
      const fields = modelClass.translatable || [];
      for (const f of fields) {
        result[f] = (this as any).getTranslations(f);
      }
      return result;
    }

    setTranslations(
      field: string,
      translations: Record<string, string | null | undefined>,
    ): this {
      for (const [loc, val] of Object.entries(translations)) {
        this.setTranslation(field, loc, val);
      }
      return this;
    }

    fillTranslations(translations: Record<string, any>): this {
      if (!translations || typeof translations !== "object") {
        return this;
      }
      const modelClass = this.constructor as any;
      const translatableFields = new Set(modelClass.translatable || []);

      for (const [keyOrLocale, data] of Object.entries(translations)) {
        if (!data || typeof data !== "object") continue;

        if (translatableFields.has(keyOrLocale)) {
          this.setTranslations(keyOrLocale, data);
        } else {
          const locale = keyOrLocale;
          for (const [field, value] of Object.entries(data)) {
            this.setTranslation(field, locale, value as any);
          }
        }
      }
      return this;
    }

    async loadTranslations(locales?: string[]): Promise<this> {
      const pk = (this.constructor as typeof Model).primaryKey || "id";
      const id = (this as any).getAttribute(pk);
      if (!id) return this;

      const query = (this as any).translations().query();
      if (locales && locales.length > 0) {
        query.whereIn("locale", locales);
      }
      const items = await query.get();
      for (const item of items) {
        const key = `${item.locale}:${item.key}`;
        this.cachedTranslations.set(key, item.value);
      }
      (this as any).setRelation("translations", items);
      return this;
    }

    async saveTranslations(): Promise<void> {
      if (this.stagedTranslations.size === 0) {
        return;
      }

      const pk = (this.constructor as typeof Model).primaryKey || "id";
      const idValue = (this as any).getAttribute(pk);
      if (!idValue) {
        return;
      }

      const translatableType = MorphMap.getMorphAlias(this);

      for (const [compositeKey, value] of Array.from(
        this.stagedTranslations.entries(),
      )) {
        const colonIdx = compositeKey.indexOf(":");
        const locale = compositeKey.slice(0, colonIdx);
        const key = compositeKey.slice(colonIdx + 1);

        if (value === null || value === undefined) {
          await Translation.query()
            .where("translatable_type", translatableType)
            .where("translatable_id", String(idValue))
            .where("locale", locale)
            .where("key", key)
            .forceDelete();
          this.cachedTranslations.delete(compositeKey);
        } else {
          await Translation.query().updateOrCreate(
            {
              translatableType,
              translatableId: String(idValue),
              locale,
              key,
            },
            {
              value: String(value),
            },
          );
          this.cachedTranslations.set(compositeKey, String(value));
        }
      }

      this.stagedTranslations.clear();
    }

    async deleteTranslations(): Promise<void> {
      const pk = (this.constructor as typeof Model).primaryKey || "id";
      const idValue = (this as any).getAttribute(pk);
      if (!idValue) {
        return;
      }

      const translatableType = MorphMap.getMorphAlias(this);
      await Translation.query()
        .where("translatable_type", translatableType)
        .where("translatable_id", String(idValue))
        .forceDelete();

      this.stagedTranslations.clear();
      this.cachedTranslations.clear();
    }

    async saved(): Promise<void> {
      await this.saveTranslations();
    }

    async deleted(): Promise<void> {
      await this.deleteTranslations();
    }

    override getAttribute(key: string): any {
      const modelClass = this.constructor as any;
      if (modelClass.translatable && modelClass.translatable.includes(key)) {
        const translation = this.getTranslation(key);
        if (translation !== null && translation !== undefined) {
          return translation;
        }
      }
      return super.getAttribute(key);
    }

    override setAttribute(key: string, value: any): this {
      const modelClass = this.constructor as any;
      if (modelClass.translatable && modelClass.translatable.includes(key)) {
        if (
          value &&
          typeof value === "object" &&
          !Array.isArray(value) &&
          !(value instanceof Date)
        ) {
          this.setTranslations(key, value);
          return this;
        }
        this.setTranslation(key, getLocale(), value);
        return this;
      }
      return super.setAttribute(key, value);
    }

    override toJSON(): Record<string, any> {
      const json = super.toJSON();
      const modelClass = this.constructor as any;
      if (modelClass.translatable) {
        for (const field of modelClass.translatable) {
          json[field] = this.getTranslation(field);
        }
      }
      return json;
    }
  };
  return Mixed as any;
}
