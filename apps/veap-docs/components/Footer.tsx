import Link from "next/link";
import { SUPPORT_EMAIL } from "@/lib/legal-config";
import { SITE_NAME, SITE_REPO } from "@/lib/site";
import { GithubLogo, XLogo } from "./logos";

const GITHUB_URL = SITE_REPO || "https://github.com/veapjs/veap";
const X_URL = "https://x.com/veapjs";

interface FooterLinkItem {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumn {
  title: string;
  links: FooterLinkItem[];
}

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Documentation",
    links: [
      { label: "Documentation Home", href: "/docs" },
      { label: "Installation", href: "/docs/getting-started/installation" },
      {
        label: "First Application",
        href: "/docs/getting-started/first-application",
      },
      {
        label: "Kernel & Lifecycle",
        href: "/docs/reference/packages/kernel",
      },
      { label: "Database & ORM", href: "/docs/packages/database" },
      { label: "Authentication & RBAC", href: "/docs/packages/auth" },
      { label: "Plugins & Routing", href: "/docs/packages/plugins" },
    ],
  },
  {
    title: "Ecosystem",
    links: [
      { label: "Official Plugins & ORM Traits", href: "/plugins" },
      { label: "Auth Plugin", href: "/plugins/auth-plugin" },
      { label: "Blog Plugin", href: "/plugins/blog-plugin" },
      { label: "Panel Plugin", href: "/plugins/panel-plugin" },
      {
        label: "ORM Traits Guide",
        href: "/docs/packages/orm-traits",
      },
      { label: "Plugin Authoring Guide", href: "/docs/guides/custom-plugins" },
    ],
  },
  {
    title: "Project",
    links: [
      // { label: "Sponsors & Partners", href: "/sponsors" },
      // { label: "Wall of Love", href: "/reviews" },
      {
        label: "GitHub Discussions",
        href: "https://github.com/veapjs/veap/discussions",
        external: true,
      },
      {
        label: "Releases & Changelog",
        href: "https://github.com/veapjs/veap/releases",
        external: true,
      },
      { label: "Contributing Guide", href: "/contributing" },
      { label: "Code of Conduct", href: "/code-of-conduct" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
      { label: "Security Policy", href: "/security-policy" },
      { label: "License", href: "/license" },
    ],
  },
];

const UTILITY_LINKS: FooterLinkItem[] = [
  { label: "sitemap", href: "/sitemap.xml" },
  { label: "robots.txt", href: "/robots.txt" },
  { label: "llms.txt", href: "/llms.txt" },
  { label: "llms-full.txt", href: "/llms-full.txt" },
  // { label: "Registry Schema", href: "/schema/registry.json" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mx-auto w-full p-1.5 md:p-2.5">
      <div
        className="relative mx-auto flex w-full flex-col overflow-hidden rounded-[45px] border border-black/[0.04] bg-[#F5F5F7] px-6 pt-12 pb-8 dark:border-transparent dark:border-apple dark:bg-[#121212] sm:px-10 sm:pt-16 sm:pb-10"
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      >
        {/* Ambient Dark Glow */}
        <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_75%_at_50%_100%,rgba(10,197,178,0.06),transparent_60%)] dark:block" />

        {/* Main Grid Content */}
        <div className="relative z-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          {/* Brand Column (Left) */}
          <div className="flex flex-col gap-4 lg:col-span-5">
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <img
                src="/logos/logo.svg"
                alt="Veap"
                className="size-7 dark:invert transition-transform duration-200 group-hover:scale-105"
              />
              <span className="font-runde text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                veap
              </span>
            </Link>

            <p className="max-w-sm text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              Fourteen MIT-licensed packages for Next.js 16 - kernel, ORM with
              migrations, auth, plugins with a virtual router, i18n, mail,
              settings, storage and four ORM traits - plus 15 official plugins.
              Pre-1.0 Early Access; the runtime stays stock Next.js.
            </p>

            {/* Quick Actions & Socials */}
            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs hover:border-[#0ac5b2] hover:text-[#0ac5b2] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 transition-colors"
                style={{ cornerShape: "squircle" } as React.CSSProperties}
              >
                <GithubLogo className="size-4" />
                <span>GitHub</span>
              </a>

              <a
                href={X_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs hover:border-[#0ac5b2] hover:text-[#0ac5b2] dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 transition-colors"
                style={{ cornerShape: "squircle" } as React.CSSProperties}
              >
                <XLogo className="size-3.5" />
                <span>@veapjs</span>
              </a>
            </div>
          </div>

          {/* Navigation Links Columns (Right) */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-3.5">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-neutral-900 dark:text-white">
                  {column.title}
                </span>
                <ul className="flex flex-col gap-2.5 text-xs">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noreferrer"
                          className="text-neutral-600 hover:text-[#0ac5b2] dark:text-neutral-400 dark:hover:text-[#0ac5b2] transition-colors"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-neutral-600 hover:text-[#0ac5b2] dark:text-neutral-400 dark:hover:text-[#0ac5b2] transition-colors"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar: Copyright, Legal & Utilities */}
        <div className="relative z-10 mt-12 flex flex-col items-center justify-between gap-4 border-t border-black/[0.06] pt-6 dark:border-white/[0.08] sm:flex-row text-xs text-neutral-500 dark:text-neutral-400">
          <p>
            &copy; {currentYear} {SITE_NAME} Team &middot; Released under the
            MIT License.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            {UTILITY_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="hover:text-[#0ac5b2] transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <span className="text-neutral-300 dark:text-neutral-700">
              &middot;
            </span>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="hover:text-[#0ac5b2] transition-colors"
            >
              Contact
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
