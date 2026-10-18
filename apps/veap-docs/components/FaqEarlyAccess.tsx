import Link from "next/link";
import { cn } from "@/lib/utils";

const BENTO_CARD = cn(
  "group relative flex flex-col justify-between overflow-hidden rounded-[32px]",
  "border border-black/[0.06] bg-[#F5F5F7]/90 dark:border-white/[0.07] dark:bg-[#121212]/90 backdrop-blur-sm",
  "p-6 sm:p-8 transition-all duration-300 ease-out",
  "hover:-translate-y-1 hover:border-[#0ac5b2]/40 hover:bg-white hover:shadow-xl hover:shadow-[#0ac5b2]/5",
  "dark:hover:border-[#0ac5b2]/30 dark:hover:bg-[#17171a] dark:hover:shadow-[#0ac5b2]/5",
);

const FAQS: Array<{ q: string; a: React.ReactNode }> = [
  {
    q: "Is Veap a fork of Next.js?",
    a: (
      <>
        No. Veap is a set of MIT-licensed npm packages - {""}
        <code className="font-mono text-[11px]">@veap/kernel</code>,{" "}
        <code className="font-mono text-[11px]">@veap/database</code>,{" "}
        <code className="font-mono text-[11px]">@veap/auth</code> and the rest -
        that run on top of the stock Next.js 16 App Router. The dev server, the
        build and every rendering feature stay exactly as they are; you can
        verify that in the {""}
        <Link
          href="/docs/getting-started/nextjs-integration"
          className="text-[#0ac5b2] hover:underline"
        >
          comparison
        </Link>
        .
      </>
    ),
  },
  {
    q: "What does Early Access mean?",
    a: "Every package is still pre-1.0, so APIs can change between minor releases. Early Access users get the full package set, the official plugin registry and direct input on the roadmap in exchange for tolerating occasional breaking changes.",
  },
  {
    q: "Which databases, runtimes and package managers are supported?",
    a: "Any Knex-compatible database: SQLite through better-sqlite3 for zero-config development, PostgreSQL through pg for production, and MySQL through mysql2 if you install that driver yourself. Node 22 or newer is required, and the scaffolder detects bun, pnpm, npm or yarn - the whole flow runs on the package manager you already use.",
  },
  {
    q: "Can I adopt it partially in an existing Next.js app?",
    a: "That is the intended path. Each package is installed on its own and providers are registered in one server-only composition root, so you can start with just @veap/kernel and @veap/database and add auth, plugins, mail or storage later. Nothing is generated into your tree, and dropping a package means deleting its provider line.",
  },
  {
    q: "How do I install and manage plugins?",
    a: (
      <>
        Registry entries install with{" "}
        <code className="font-mono text-[11px]">
          bun veap add @veap/blog-plugin
        </code>
        , which also regenerates the plugins registry. Run{" "}
        <code className="font-mono text-[11px]">veap eject</code> to copy a
        plugin into <code className="font-mono text-[11px]">plugins/</code> when
        you want to own its source, and toggle it at runtime from the panel -
        status, migrations and widgets are persisted.
      </>
    ),
  },
  {
    q: "How does licensing work?",
    a: "The framework packages, the shared UI package and the official plugins are MIT licensed. Your plugins, templates and applications stay yours, with no runtime royalties or license keys.",
  },
  {
    q: "Where do I report bugs or request features?",
    a: "Open an issue in the repository or reach out through the sponsors page. Early Access feedback goes straight into the roadmap, and the changelog documents every release.",
  },
];

const EXTRAS: Array<[string, string]> = [
  ["MIT licensed", "Packages, UI and plugins"],
  ["Node 22+", "Bun, pnpm, npm or yarn"],
  ["SQLite → Postgres", "MySQL through mysql2"],
  ["Next.js 16.4 / React 19", "Stock runtime, no fork"],
  ["14 packages", "8 services, UI, CLI, 4 traits"],
  ["19 registry entries", "15 plugins + 4 ORM traits"],
];

export default function FaqEarlyAccess() {
  return (
    <>
      {/* Section Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#0ac5b2]/30 bg-[#0ac5b2]/10 px-4 py-1.5 text-xs font-semibold text-[#0ac5b2] backdrop-blur-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0ac5b2] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#0ac5b2]"></span>
          </span>
          <span className="font-runde tracking-wide">FAQ · Early Access</span>
        </div>

        <h2 className="max-w-3xl text-balance font-runde text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl md:text-5xl">
          Questions, Answered Plainly.
        </h2>

        <p className="max-w-2xl text-balance text-sm font-medium text-muted-foreground sm:text-base md:text-lg">
          The facts about packages, stability and licensing, without marketing
          gloss.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12 lg:gap-5">
        {/* FAQ accordion (7 cols) */}
        <div
          className={cn(BENTO_CARD, "md:col-span-12 lg:col-span-7")}
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#0ac5b2]/10 blur-3xl transition-opacity group-hover:opacity-100 dark:bg-[#0ac5b2]/15"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-2">
            {FAQS.map((item, index) => (
              <details
                key={item.q}
                open={index === 0}
                className="group rounded-xl border border-black/[0.05] bg-white px-4 py-3 open:border-[#0ac5b2]/30 dark:border-white/[0.06] dark:bg-neutral-900 dark:open:border-[#0ac5b2]/25"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-neutral-900 dark:text-white [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span className="font-mono text-[#0ac5b2] transition-transform duration-200 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Anything else? The docs cover every package in detail.
            </span>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0ac5b2] hover:underline"
            >
              <span>Read the Docs</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* At-a-glance card (5 cols) */}
        <div
          className={cn(BENTO_CARD, "md:col-span-12 lg:col-span-5")}
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0ac5b2]">
                At a Glance
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-amber-600 dark:text-amber-400">
                Pre-1.0
              </span>
            </div>

            <h3 className="mt-3 font-runde text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
              The Short Version
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              If you read nothing else: the runtime is standard Next.js, every
              package is MIT licensed, and the Veap layer can leave as easily as
              it arrived.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {EXTRAS.map(([title, note]) => (
              <div
                key={title}
                className="rounded-xl border border-black/[0.04] bg-white/80 p-2.5 dark:border-white/[0.05] dark:bg-neutral-900/80"
              >
                <span className="block text-[11px] font-semibold text-neutral-900 dark:text-white">
                  {title}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {note}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Want to shape the roadmap while it is young?
            </span>
            <Link
              href="/sponsors"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0ac5b2] hover:underline"
            >
              <span>Become a Sponsor</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
