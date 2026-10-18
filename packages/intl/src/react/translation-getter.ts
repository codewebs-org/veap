import { getIntlConfig } from "../common/config.js";
import { getCurrentLocale } from "../common/detection.js";
import { getMessages } from "../services/loader.js";
import { createTranslator } from "../services/translator.js";

export async function getTranslation(
  localeOverride?: string,
  timeZoneOverride?: string,
) {
  const { default: defaultLocale, timeZone: defaultTimeZone } =
    await getIntlConfig();

  let locale = localeOverride;
  const timeZone = timeZoneOverride || defaultTimeZone;

  if (!locale) {
    try {
      locale = await getCurrentLocale();
    } catch (_e) {
      locale = defaultLocale;
    }
  }

  const activeLocale = locale || defaultLocale || "en";

  const messages = await getMessages(activeLocale);

  return createTranslator({ messages, locale: activeLocale, timeZone });
}
