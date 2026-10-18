# Veap + Hono Starter (`02-hono`)

A lightweight, high-performance web service template built on [Hono](https://hono.dev) and the [Veap Framework](https://veap.pl) core (`@veap/kernel`).

This starter combines Hono's minimalist HTTP routing with Veap's enterprise architecture: Inversion of Control (IoC) container, Service Providers, decoupled HTTP transport adapters, and lifecycle management.

## Features

- **Hono HTTP Router**: Minimal, fast, and standard Web Fetch API compliant.
- **Veap Kernel IoC**: Complete dependency injection container with transient, singleton, class, and value bindings.
- **Service Providers**: Modular `ServiceProvider` architecture (`register()` and `boot()` lifecycle phases).
- **Request Context & Cookie Store**: Hono adapters for `@veap/kernel`'s `COOKIE_STORE` and `REQUEST_CONTEXT` using `hono/context-storage`.
- **Universal Runtime**: Runs natively on Bun (`Bun.serve`) and Node.js (`@hono/node-server`).

## Project layout

```
02-hono/
├── src/
│   ├── index.ts               # Hono application, middleware, and route handlers
│   ├── veap.ts                # Veap composition root, bootstrap, and transport adapters
│   ├── providers/
│   │   └── app.provider.ts    # ServiceProvider registering application dependencies
│   └── services/
│       └── greeting.service.ts # Example domain service resolved from IoC container
├── tsconfig.json              # Strict TypeScript configuration (NodeNext)
├── veap.config.ts             # Veap framework configuration
└── package.json               # Package manifest and scripts
```

## Getting started

Install dependencies:

```bash
bun install
# or
npm install
```

Start the development server with live reload:

```bash
bun dev
# or
npm run dev
```

Build and run in production:

```bash
bun run build
bun start
```

## Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Greets the caller using `GreetingService` resolved from the Veap IoC container. |
| `GET` | `/api/greet/:name` | Parameterized greeting resolved from the Veap IoC container. |
| `GET` | `/health` | Health check endpoint returning kernel and framework status. |

## Learn more

- [Veap Documentation](https://veap.pl/docs)
- [Veap Fundamentals (IoC & Providers)](https://veap.pl/docs/fundamentals/ioc-and-providers)
- [Hono Documentation](https://hono.dev)
