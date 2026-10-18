# Background tasks, queues, and distributed cache

In high-traffic applications, deferring heavy computations, external API calls, and email delivery outside the HTTP request lifecycle keeps response times fast and reliable. This guide covers asynchronous task execution, event-driven decoupling, worker queue architectures, and distributed caching in Veap.

## Request lifecycle and asynchronous tasks

In Next.js App Router applications, long-running asynchronous operations executed inside Server Actions or Route Handlers can delay HTTP responses or terminate prematurely when serverless functions exit. Next.js provides the `after()` API to schedule work that runs after the response is sent:

```ts
// app/actions/orders.ts
"use server";

import { after } from "next/server";
import { app } from "@/lib/veap";
import { sendMail } from "@veap/mail";

export async function placeOrder(orderData: FormData) {
  // 1. Process order within the active request
  const order = await saveOrderToDatabase(orderData);

  // 2. Schedule non-blocking work to run after response finishes
  after(async () => {
    await sendMail({
      to: order.customerEmail,
      subject: `Order Confirmation #${order.id}`,
      text: `Thank you for your order! Your confirmation code is ${order.code}.`,
    });
  });

  return { success: true, orderId: order.id };
}
```

## Decoupling with the kernel `EventBus`

`@veap/kernel` provides an in-memory `EventBus` (`Token<IEventBus>`) that lets different subsystems react to domain events without coupling business logic to infrastructure delivery:

```ts
// lib/services/order.service.ts
import { EVENT_BUS, type IEventBus, Inject } from "@veap/kernel";

export class OrderService {
  constructor(@Inject(EVENT_BUS) private bus: IEventBus) {}

  async completeOrder(order: any): Promise<void> {
    // Save order
    await order.save();

    // Publish domain event
    await this.bus.publish("order:completed", {
      orderId: order.id,
      amount: order.total,
      customerId: order.customerId,
    });
  }
}
```

Listeners subscribe to domain topics in a `ServiceProvider.boot()` method or plugin initializer:

```ts
// lib/providers/notification.provider.ts
import { EVENT_BUS, type IEventBus, ServiceProvider } from "@veap/kernel";
import { sendMail } from "@veap/mail";

export class NotificationServiceProvider extends ServiceProvider {
  register(): void {}

  async boot(): Promise<void> {
    const bus = this.container.resolve<IEventBus>(EVENT_BUS);

    bus.subscribe("order:completed", async (payload: any) => {
      await sendMail({
        to: "sales@example.com",
        subject: `New Order Received #${payload.orderId}`,
        text: `Order total: $${payload.amount}`,
      });
    });
  }
}
```

## Production queue architecture (BullMQ and Redis)

When your application scales beyond a single server or handles spikes of intensive jobs (such as image resizing, PDF invoice rendering, or batch webhook dispatching), we recommend delegating tasks to a dedicated Redis-backed queue like BullMQ.

### Defining a queue service provider

Encapsulate your queue client in a custom `ServiceProvider` and register it in `lib/veap.ts`:

```ts
// lib/providers/queue.provider.ts
import { ServiceProvider, type Token } from "@veap/kernel";
import { Queue } from "bullmq";

export interface IJobQueue {
  add(name: string, data: Record<string, any>): Promise<void>;
}

export const JOB_QUEUE: Token<IJobQueue> = Symbol.for("app:job-queue");

export class QueueServiceProvider extends ServiceProvider {
  private queue?: Queue;

  register(): void {
    const connection = {
      host: process.env.REDIS_HOST ?? "127.0.0.1",
      port: Number(process.env.REDIS_PORT ?? 6379),
    };

    this.queue = new Queue("veap-jobs", { connection });

    this.container.singleton<IJobQueue>(JOB_QUEUE, {
      add: async (name, data) => {
        await this.queue?.add(name, data, {
          attempts: 3,
          backoff: { type: "exponential", delay: 2000 },
        });
      },
    });
  }

  async shutdown(): Promise<void> {
    await this.queue?.close();
  }
}
```

### Running dedicated worker processes

Create a dedicated worker entry point in `workers/index.ts` that runs as a separate Node.js or Bun process:

```ts
// workers/index.ts
import { Worker } from "bullmq";
import { app } from "../lib/veap";
import { sendMail } from "@veap/mail";

await app.bootstrap();

const worker = new Worker(
  "veap-jobs",
  async (job) => {
    switch (job.name) {
      case "send-welcome-email":
        await sendMail({
          to: job.data.email,
          subject: "Welcome to Veap",
          text: `Welcome, ${job.data.username}!`,
        });
        break;
      default:
        console.warn(`Unknown job name: ${job.name}`);
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST ?? "127.0.0.1",
      port: Number(process.env.REDIS_PORT ?? 6379),
    },
  },
);

console.log("Worker listening for background jobs...");
```

Run this process alongside your Next.js application using Docker, PM2, or a Kubernetes worker deployment.

## Distributed caching with Redis or Upstash

By default, `@veap/kernel` registers `MemoryCacheProvider`, storing cached entries in process memory. In serverless or multi-container deployments where multiple replicas serve incoming requests, bind a distributed `ICacheProvider` to `CACHE_PROVIDER` so cached entries and invalidations (such as `@veap/settings`) synchronize across instances.

### Implementing `ICacheProvider`

Implement the `ICacheProvider` contract using your preferred Redis client (such as `ioredis` or `@upstash/redis`):

```ts
// lib/cache/redis-cache.provider.ts
import { CACHE_PROVIDER, type ICacheProvider, ServiceProvider } from "@veap/kernel";
import Redis from "ioredis";

export class RedisCacheAdapter implements ICacheProvider {
  constructor(private client: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as unknown as T;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const raw = typeof value === "string" ? value : JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, raw, "EX", ttlSeconds);
    } else {
      await this.client.set(key, raw);
    }
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async clear(): Promise<void> {
    await this.client.flushdb();
  }
}

export class DistributedCacheServiceProvider extends ServiceProvider {
  private redisClient?: Redis;

  register(): void {
    const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";
    this.redisClient = new Redis(redisUrl);

    this.container.singleton<ICacheProvider>(
      CACHE_PROVIDER,
      new RedisCacheAdapter(this.redisClient),
    );
  }

  async shutdown(): Promise<void> {
    await this.redisClient?.quit();
  }
}
```

### Registering in `lib/veap.ts`

Register `DistributedCacheServiceProvider` in your composition root before services that consume cache:

```ts
// lib/veap.ts
import { Application } from "@veap/kernel";
import { DatabaseServiceProvider } from "@veap/database";
import { SettingsServiceProvider } from "@veap/settings";
import { DistributedCacheServiceProvider } from "./cache/redis-cache.provider";

export const app = Application.configure()
  .use(new DistributedCacheServiceProvider())
  .use(DatabaseServiceProvider)
  .use(SettingsServiceProvider)
  .create();
```

Because `@veap/settings` resolves `CACHE_PROVIDER` from the container, all settings updates automatically invalidate across every connected instance.
