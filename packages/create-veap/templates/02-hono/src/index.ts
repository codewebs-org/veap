import { serve } from "@hono/node-server";
import { logger } from "@veap/kernel";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { GreetingService } from "./services/greeting.service.js";
import { container, initializeSystem } from "./veap.js";

// Ensure Veap application and service providers are bootstrapped
await initializeSystem();

export const app = new Hono();

// Enable request context storage for Hono
app.use("*", contextStorage());

// Global response timing middleware
app.use("*", async (c, next) => {
  const start = Date.now();
  await next();
  c.header("X-Response-Time", `${Date.now() - start}ms`);
});

// Root endpoint: resolves GreetingService from the Veap IoC container
app.get("/", async (c) => {
  const greetingService = await container.resolve(GreetingService);
  return c.json(greetingService.greet("World"));
});

// Parameterized greeting endpoint
app.get("/api/greet/:name", async (c) => {
  const name = c.req.param("name");
  const greetingService = await container.resolve(GreetingService);
  return c.json(greetingService.greet(name));
});

// Health check endpoint
app.get("/health", (c) => {
  return c.json({
    status: "ok",
    framework: "Hono",
    kernel: "@veap/kernel",
    timestamp: new Date().toISOString(),
  });
});

const port = Number(process.env.PORT) || 3000;

// Universal runtime support (Node.js & Bun)
if (typeof (globalThis as any).Bun === "undefined") {
  serve(
    {
      fetch: app.fetch,
      port,
    },
    (info) => {
      logger.info(
        "hono:server",
        `Server running at http://localhost:${info.port}`,
      );
    },
  );
} else {
  logger.info(
    "hono:server",
    `Server running (Bun) at http://localhost:${port}`,
  );
}

export default {
  port,
  fetch: app.fetch,
};
