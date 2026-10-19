import { Application } from "@veap/kernel";
import { NextTransportServiceProvider } from "@veap/kernel/next";

export const app = Application.configure()
  .use(NextTransportServiceProvider)
  .create();

let bootstrapPromise: Promise<void> | null = null;

/**
 * Main system bootstrap function.
 * Boots modular services, runs migrations, and seeds demo data.
 * Safe for concurrent invocations across layouts, pages, and server actions.
 */
export async function initializeSystem(): Promise<void> {
  if (!bootstrapPromise) {
    bootstrapPromise = (async () => {
      return await app.bootstrap();
    })().catch((err) => {
      bootstrapPromise = null;
      throw err;
    });
  }
  return bootstrapPromise;
}
