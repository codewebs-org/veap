import { type Container, ServiceProvider } from "@veap/kernel";
import {
  INTL_MESSAGE_LOADERS,
  INTL_SERVICE,
  LOCALE_RESOLVER,
} from "../common/constants.js";
import { getCurrentLocale } from "../common/detection.js";
import type { MessageLoaderFn, MessageLoaderRecord } from "../common/types.js";
import { IntlService } from "../services/intl.service.js";

export interface IntlProviderOptions {
  loaders?: (MessageLoaderRecord | MessageLoaderFn)[];
}

export class IntlServiceProvider extends ServiceProvider {
  constructor(
    container: Container,
    private readonly options: IntlProviderOptions = {},
  ) {
    super(container);
  }

  register(): void {
    this.container.register({
      token: INTL_MESSAGE_LOADERS,
      useValue: this.options.loaders || [],
    });

    this.container.register({
      token: IntlService,
      useClass: IntlService,
      inject: [INTL_MESSAGE_LOADERS],
      singleton: true,
    });

    this.container.register({
      token: INTL_SERVICE,
      useFactory: (service: IntlService) => service,
      inject: [IntlService],
      singleton: true,
    });

    this.container.register({
      token: LOCALE_RESOLVER,
      useValue: {
        getLocale: () => getCurrentLocale(),
      },
      singleton: true,
    });
  }

  async boot(): Promise<void> {
    (globalThis as any).__VEAP_ASYNC_LOCALE_RESOLVER__ = getCurrentLocale;
  }
}
