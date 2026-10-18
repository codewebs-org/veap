import { container } from "@veap/kernel";
import { INTL_MESSAGE_LOADERS } from "../common/constants.js";
import type {
  AbstractIntlMessages,
  MessageLoaderFn,
  MessageLoaderRecord,
} from "../common/types.js";
import { IntlService } from "./intl.service.js";

async function getService(): Promise<IntlService> {
  if (!container.has(INTL_MESSAGE_LOADERS)) {
    container.register({
      token: INTL_MESSAGE_LOADERS,
      useValue: [],
    });
  }
  if (!container.has(IntlService)) {
    container.register({
      token: IntlService,
      useClass: IntlService,
      singleton: true,
    });
  }
  return container.resolve(IntlService);
}

export async function registerMessages(
  locale: string,
  messages: any,
): Promise<void> {
  const service = await getService();
  service.registerMessages(locale, messages);
}

export async function registerMessageLoader(
  loader: MessageLoaderRecord | MessageLoaderFn,
  priority?: number,
): Promise<void> {
  const service = await getService();
  service.registerLoader(loader, priority);
}

export async function getMessages(
  locale: string,
  searchDirectories?: string[],
): Promise<AbstractIntlMessages> {
  const service = await getService();
  return await service.getMessages(locale, searchDirectories);
}
