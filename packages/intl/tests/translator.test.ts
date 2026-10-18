import { describe, expect, it } from "vitest";
import {
  coerceDate,
  createTranslator,
  getNestedMessage,
} from "../src/services/translator.js";

describe("createTranslator (@veap/intl)", () => {
  const messages = {
    common: {
      welcome: "Welcome, {name}!",
      farewell: "Goodbye!",
      apples: "{count, plural, =0 {No apples} =1 {One apple} other {# apples}}",
    },
    "nav.home": "Home page",
  };

  it("translates simple keys", () => {
    const { t } = createTranslator({ locale: "en", messages });
    expect(t("common.farewell")).toBe("Goodbye!");
  });

  it("interpolates parameters", () => {
    const { t } = createTranslator({ locale: "en", messages });
    expect(t("common.welcome", { name: "John" })).toBe("Welcome, John!");
  });

  it("handles ICU pluralization", () => {
    const { t } = createTranslator({ locale: "en", messages });
    expect(t("common.apples", { count: 0 })).toBe("No apples");
    expect(t("common.apples", { count: 1 })).toBe("One apple");
    expect(t("common.apples", { count: 5 })).toBe("5 apples");
  });

  it("falls back to key when missing", () => {
    const { t } = createTranslator({ locale: "en", messages });
    expect(t("missing.key")).toBe("missing.key");
  });

  it("supports keys with literal dots in object properties", () => {
    expect(getNestedMessage(messages, "nav.home")).toBe("Home page");
    const { t } = createTranslator({ locale: "en", messages });
    expect(t("nav.home")).toBe("Home page");
  });

  it("formats dates using date() helper", () => {
    const { date } = createTranslator({
      locale: "en",
      messages,
      timeZone: "UTC",
    });
    const formatted = date(new Date("2026-10-11T12:00:00Z"));
    expect(formatted).toContain("2026");
    expect(formatted).toContain("Oct");
  });

  it("formats relative time correctly", () => {
    const { relativeTime } = createTranslator({
      locale: "en",
      messages,
      timeZone: "UTC",
    });
    const now = new Date("2026-10-11T12:00:00Z");

    const twoMinutesAgo = new Date("2026-10-11T11:58:00Z");
    expect(relativeTime(twoMinutesAgo, { now })).toBe("2 minutes ago");

    const twoHoursAgo = new Date("2026-10-11T10:00:00Z");
    expect(relativeTime(twoHoursAgo, { now })).toBe("2 hours ago");
  });

  it("validates invalid date inputs in coerceDate", () => {
    expect(() => coerceDate("not-a-real-date")).toThrow(
      /could not be parsed as a valid time/i,
    );
    expect(() => coerceDate(null as any)).toThrow(
      /expected Date, string, or number/i,
    );
  });
});
