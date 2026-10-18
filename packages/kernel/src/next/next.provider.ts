import { COOKIE_STORE, REQUEST_CONTEXT } from "../http/contracts.js";
import { ServiceProvider } from "../ioc/service-provider.js";
import { NextCookieStore, NextRequestContext } from "./next-http.js";

/**
 * Service provider that binds Next.js runtime adapters for cookies and request context.
 *
 * Applications built with Next.js can register this provider to enable
 * seamless access to Next.js `cookies()`, `headers()`, and `redirect()`.
 */
export class NextTransportServiceProvider extends ServiceProvider {
  register(): void {
    this.container.register({
      token: COOKIE_STORE,
      useClass: NextCookieStore,
      singleton: true,
    });

    this.container.register({
      token: REQUEST_CONTEXT,
      useClass: NextRequestContext,
      singleton: true,
    });
  }
}
