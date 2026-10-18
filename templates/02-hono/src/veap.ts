import {
  Application,
  COOKIE_STORE,
  container,
  REQUEST_CONTEXT,
  ServiceProvider,
} from "@veap/kernel";
import { tryGetContext } from "hono/context-storage";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { AppServiceProvider } from "./providers/app.provider.js";

/**
 * Hono transport provider registering cookie and header adapters into IoC.
 * Uses hono/context-storage to access request context asynchronously.
 */
class HonoTransportServiceProvider extends ServiceProvider {
  override register(): void {
    this.container.register({
      token: COOKIE_STORE,
      useValue: {
        async get(name: string) {
          const c = tryGetContext();
          if (!c) return null;
          return getCookie(c, name) ?? null;
        },
        async set(name: string, value: string, options?: any) {
          const c = tryGetContext();
          if (!c) return;
          setCookie(c, name, value, {
            path: options?.path ?? "/",
            secure: options?.secure,
            httpOnly: options?.httpOnly,
            expires: options?.expires,
            sameSite: options?.sameSite
              ? ((options.sameSite.charAt(0).toUpperCase() +
                  options.sameSite.slice(1).toLowerCase()) as any)
              : undefined,
          });
        },
        async delete(name: string) {
          const c = tryGetContext();
          if (!c) return;
          deleteCookie(c, name);
        },
      },
      singleton: true,
    });

    this.container.register({
      token: REQUEST_CONTEXT,
      useValue: {
        async getHeader(name: string) {
          const c = tryGetContext();
          if (!c) return null;
          return c.req.header(name) ?? null;
        },
        redirect(url: string) {
          const c = tryGetContext();
          if (c) {
            c.redirect(url);
          }
          throw new Error(`Redirect to: ${url}`);
        },
      },
      singleton: true,
    });
  }
}

export const app = Application.configure()
  .use(HonoTransportServiceProvider)
  .use(AppServiceProvider)
  .create();

let bootstrapPromise: Promise<void> | null = null;

/**
 * Main system bootstrap function.
 * Boots modular services, runs startup lifecycle, and publishes system events.
 * Safe for concurrent invocations.
 */
export async function initializeSystem(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      await app.bootstrap();
    })().catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}

export { container };
