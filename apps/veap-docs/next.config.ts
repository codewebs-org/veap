import type { NextConfig } from "next";

/**
 * The documentation was reorganised when Veap split into domain packages and
 * `docs/developer-docs` became the single source. These redirects keep the
 * previously published URLs (marketing pages, search results, bookmarks)
 * working. Keep the destinations in sync with `docs/developer-docs/meta.json`.
 */
const DOCS_REDIRECTS: Array<{ source: string; destination: string }> = [
  { source: "/docs/overview", destination: "/docs" },
  { source: "/docs/getting-started/introduction", destination: "/docs" },

  { source: "/docs/kernel", destination: "/docs/reference/packages/kernel" },
  {
    source: "/docs/kernel/application",
    destination: "/docs/fundamentals/lifecycle",
  },
  {
    source: "/docs/kernel/ioc-container",
    destination: "/docs/fundamentals/dependency-injection",
  },
  {
    source: "/docs/kernel/service-providers",
    destination: "/docs/fundamentals/service-providers",
  },
  { source: "/docs/kernel/events", destination: "/docs/fundamentals/events" },
  {
    source: "/docs/kernel/error-handling",
    destination: "/docs/fundamentals/errors-and-results",
  },
  {
    source: "/docs/kernel/cache",
    destination: "/docs/reference/packages/kernel",
  },
  {
    source: "/docs/kernel/http-security",
    destination: "/docs/advanced/security",
  },

  { source: "/docs/database", destination: "/docs/guides/database" },
  {
    source: "/docs/database/models",
    destination: "/docs/guides/database/models-and-queries",
  },
  {
    source: "/docs/database/relations",
    destination: "/docs/guides/database/relations",
  },
  {
    source: "/docs/database/queries-and-scopes",
    destination: "/docs/guides/database/models-and-queries",
  },
  {
    source: "/docs/database/transactions",
    destination: "/docs/guides/database/transactions",
  },
  {
    source: "/docs/database/migrations",
    destination: "/docs/guides/database/migrations",
  },

  { source: "/docs/auth", destination: "/docs/guides/authentication" },
  {
    source: "/docs/auth/sessions",
    destination: "/docs/guides/authentication/sessions",
  },
  {
    source: "/docs/auth/users",
    destination: "/docs/guides/authentication/setup",
  },
  {
    source: "/docs/auth/rbac",
    destination: "/docs/guides/authentication/rbac",
  },
  {
    source: "/docs/auth/email-and-reset",
    destination: "/docs/guides/authentication/recovery",
  },
  {
    source: "/docs/auth/extensibility",
    destination: "/docs/reference/packages/auth",
  },

  { source: "/docs/plugins", destination: "/docs/guides/plugins" },
  {
    source: "/docs/plugins/creating-plugins",
    destination: "/docs/guides/plugins/authoring",
  },
  {
    source: "/docs/plugins/plugin-routing",
    destination: "/docs/guides/plugins/routing",
  },
  {
    source: "/docs/plugins/extensions-and-widgets",
    destination: "/docs/reference/plugins/widgets",
  },
  {
    source: "/docs/plugins/hooks",
    destination: "/docs/guides/plugins/lifecycle",
  },

  { source: "/docs/mail", destination: "/docs/guides/email" },
  { source: "/docs/storage", destination: "/docs/guides/storage" },
  { source: "/docs/settings", destination: "/docs/guides/settings" },
  { source: "/docs/intl", destination: "/docs/guides/internationalization" },
  {
    source: "/docs/configuration/configuration",
    destination: "/docs/guides/environment-and-configuration",
  },
  {
    source: "/docs/configuration/environment-variables",
    destination: "/docs/guides/environment-and-configuration",
  },
  { source: "/docs/cli", destination: "/docs/guides/cli" },
  { source: "/docs/console", destination: "/docs/guides/cli" },
  { source: "/docs/create-veap", destination: "/docs/guides/create-veap" },

  { source: "/docs/guides", destination: "/docs/guides/database" },
  {
    source: "/docs/guides/first-plugin",
    destination: "/docs/guides/plugins/authoring",
  },
  {
    source: "/docs/guides/native-applications",
    destination: "/docs/fundamentals/architecture",
  },
  {
    source: "/docs/guides/database-setup",
    destination: "/docs/guides/database/configuration",
  },
  {
    source: "/docs/guides/crud",
    destination: "/docs/guides/database/models-and-queries",
  },
  {
    source: "/docs/guides/authentication",
    destination: "/docs/guides/authentication/setup",
  },
  {
    source: "/docs/guides/gate-plugins",
    destination: "/docs/guides/plugins/dependencies",
  },
  {
    source: "/docs/guides/custom-adapters",
    destination: "/docs/guides/storage/custom-provider",
  },
  { source: "/docs/guides/testing", destination: "/docs/advanced/testing" },
  {
    source: "/docs/guides/cookbook",
    destination: "/docs/tutorials/content-app",
  },

  { source: "/docs/advanced", destination: "/docs/advanced/testing" },
  {
    source: "/docs/advanced/production",
    destination: "/docs/advanced/runtime-compatibility",
  },
  {
    source: "/docs/advanced/veap-vs-nextjs",
    destination: "/docs/getting-started/nextjs-integration",
  },
  {
    source: "/docs/getting-started/veap-vs-nextjs",
    destination: "/docs/getting-started/nextjs-integration",
  },
  {
    source: "/docs/advanced/custom-providers",
    destination: "/docs/guides/storage/custom-provider",
  },
  {
    source: "/docs/deployment/production",
    destination: "/docs/advanced/runtime-compatibility",
  },
  {
    source: "/docs/troubleshooting",
    destination: "/docs/advanced/troubleshooting",
  },
];

const nextConfig: NextConfig = {
  async rewrites() {
    return [];
  },
  async redirects() {
    return [
      ...DOCS_REDIRECTS.map((redirect) => ({
        ...redirect,
        permanent: true,
      })),
      {
        source: "/security",
        destination: "/security-policy",
        permanent: true,
      },
      {
        source: "/contributing-guide",
        destination: "/contributing",
        permanent: true,
      },
      {
        source: "/contribute",
        destination: "/contributing",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
