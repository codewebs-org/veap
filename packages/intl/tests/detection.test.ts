import {
  COOKIE_STORE,
  container,
  MemoryCookieStore,
  MemoryRequestContext,
  REQUEST_CONTEXT,
  VEAP_CONFIG,
} from "@veap/kernel";
import { beforeEach, describe, expect, it } from "vitest";
import { detectLocale, getCurrentLocale } from "../src/common/detection.js";
import { getTranslation } from "../src/react/translation-getter.js";

describe("Locale detection through kernel ports", () => {
  let cookieStore: MemoryCookieStore;
  let requestContext: MemoryRequestContext;

  beforeEach(() => {
    container.reset();
    cookieStore = new MemoryCookieStore();
    requestContext = new MemoryRequestContext();

    container.register({
      token: COOKIE_STORE,
      useValue: cookieStore,
    });

    container.register({
      token: REQUEST_CONTEXT,
      useValue: requestContext,
    });

    container.register({
      token: VEAP_CONFIG,
      useValue: {
        get: async () => ({
          intl: {
            cookie: "VEAP_LOCALE",
            default: "en",
            locales: ["en", "pl"],
          },
        }),
      },
    });
  });

  it("getCurrentLocale returns default locale when no cookie or header is present", async () => {
    const locale = await getCurrentLocale();
    expect(locale).toBe("en");
  });

  it("getCurrentLocale reads cookie from kernel COOKIE_STORE port", async () => {
    await cookieStore.set("VEAP_LOCALE", "pl");

    const locale = await getCurrentLocale();
    expect(locale).toBe("pl");
  });

  it("detectLocale resolves accepted language from kernel REQUEST_CONTEXT port", async () => {
    requestContext.setHeader("accept-language", "pl-PL,pl;q=0.9,en;q=0.8");

    const locale = await detectLocale(["en", "pl"], "en");
    expect(locale).toBe("pl");
  });

  it("getTranslation uses locale resolved from COOKIE_STORE", async () => {
    await cookieStore.set("VEAP_LOCALE", "pl");

    const { locale, t } = await getTranslation();
    expect(locale).toBe("pl");
    expect(typeof t).toBe("function");
  });
});
