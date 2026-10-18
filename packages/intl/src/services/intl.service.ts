import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { Inject, Injectable } from "@veap/kernel";
import { INTL_MESSAGE_LOADERS } from "../common/constants.js";
import type {
  AbstractIntlMessages,
  MessageLoaderFn,
  MessageLoaderRecord,
} from "../common/types.js";
import { deepMerge } from "../common/utils.js";

@Injectable()
export class IntlService {
  private loaders: MessageLoaderRecord[] = [];
  private registeredMessages: Record<string, AbstractIntlMessages> = {};
  private coreLocales: Record<string, () => Promise<{ default: any }>> = {
    en: () => import("../locales/en.js"),
    pl: () => import("../locales/pl.js"),
  };

  constructor(
    @Inject(INTL_MESSAGE_LOADERS)
    initialLoaders: (MessageLoaderRecord | MessageLoaderFn)[] = [],
  ) {
    if (initialLoaders && Array.isArray(initialLoaders)) {
      for (const loader of initialLoaders) {
        this.registerLoader(loader);
      }
    }
  }

  public registerLoader(
    loader: MessageLoaderRecord | MessageLoaderFn,
    priority = 100,
  ): void {
    if (typeof loader === "function") {
      this.loaders.push({ priority, load: loader, loader });
    } else if (loader) {
      const fn = loader.load || loader.loader;
      if (typeof fn === "function") {
        this.loaders.push({
          id: loader.id,
          priority: loader.priority ?? priority,
          load: fn,
          loader: fn,
        });
      }
    }
    this.loaders.sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));
  }

  public registerMessages(locale: string, messages: any): void {
    if (!this.registeredMessages[locale]) {
      this.registeredMessages[locale] = {};
    }
    this.registeredMessages[locale] = deepMerge(
      this.registeredMessages[locale],
      messages,
    );
  }

  public async getMessages(
    locale: string,
    searchDirectories?: string[],
  ): Promise<AbstractIntlMessages> {
    const safeLocale = path
      .basename(locale || "")
      .replace(/[^a-zA-Z0-9_-]/g, "");
    if (!safeLocale) {
      return {};
    }
    let messages: AbstractIntlMessages = {};

    // 1. Core Veap locales (Priority 0)
    if (this.coreLocales[safeLocale]) {
      try {
        const coreDict = await this.coreLocales[safeLocale]();
        messages = deepMerge(messages, coreDict.default || coreDict);
      } catch (e) {
        console.error("[veap:Intl] Error loading core locale", e);
      }
    }

    // 2. Load File-system locales (Priority 50)
    const defaultDir = path.join(process.cwd(), "locales");
    const directoriesToScan = new Set<string>();
    if (searchDirectories) {
      for (const p of searchDirectories) directoriesToScan.add(p);
    }
    directoriesToScan.add(defaultDir);

    for (const dir of Array.from(directoriesToScan)) {
      const localeFile = path.join(dir, `${safeLocale}.json`);
      if (fsSync.existsSync(localeFile)) {
        try {
          const fileContent = await fs.readFile(localeFile, "utf-8");
          const jsonContent = JSON.parse(fileContent);
          messages = deepMerge(messages, jsonContent);
        } catch (err) {
          console.warn(
            `[veap:Intl] Failed to parse locale file at ${localeFile}:`,
            err,
          );
        }
      }
    }

    // 3. Registered Loaders (sorted by priority, e.g. plugins 100, app 200)
    for (const record of this.loaders) {
      try {
        const loadFn = record.load || record.loader;
        if (loadFn) {
          const loaded = await loadFn(safeLocale);
          if (loaded) {
            const dict = (loaded as any).default || loaded;
            messages = deepMerge(messages, dict);
          }
        }
      } catch (e) {
        console.error(
          `[veap:Intl] Error executing loader${record.id ? ` [${record.id}]` : ""}`,
          e,
        );
      }
    }

    // 4. Manually registered messages (highest priority)
    if (this.registeredMessages[safeLocale]) {
      messages = deepMerge(messages, this.registeredMessages[safeLocale]);
    }

    return messages;
  }
}
