import Link from "next/link";
import { cn } from "@/lib/utils";

const BENTO_CARD = cn(
  "group relative flex flex-col justify-between overflow-hidden rounded-[32px]",
  "border border-black/[0.06] bg-[#F5F5F7]/90 dark:border-white/[0.07] dark:bg-[#121212]/90 backdrop-blur-sm",
  "p-6 sm:p-8 transition-all duration-300 ease-out",
  "hover:-translate-y-1 hover:border-[#0ac5b2]/40 hover:bg-white hover:shadow-xl hover:shadow-[#0ac5b2]/5",
  "dark:hover:border-[#0ac5b2]/30 dark:hover:bg-[#17171a] dark:hover:shadow-[#0ac5b2]/5",
);

const PANEL = cn(
  "rounded-2xl border border-black/[0.04] bg-neutral-100/60 p-3.5 dark:border-white/[0.05] dark:bg-black/30",
);

const COMPARE_ROW = cn(
  "grid grid-cols-[1fr_4rem_5.5rem] items-center gap-3 rounded-xl",
  "border border-black/[0.05] bg-white px-3 py-2 text-xs dark:border-white/[0.06] dark:bg-neutral-900",
);

const PACKAGES: Array<[string, string, string]> = [
  ["Identity & RBAC", "DIY", "@veap/auth"],
  ["ORM & migrations", "DIY", "@veap/database"],
  ["Dependency injection", "DIY", "@veap/kernel"],
  ["Events & cache", "DIY", "@veap/kernel"],
  ["Plugins & widgets", "DIY", "@veap/plugins"],
  ["Localization", "DIY", "@veap/intl"],
  ["Mail delivery", "DIY", "@veap/mail"],
  ["Settings & storage", "DIY", "@veap/settings"],
];

const ADAPTERS: Array<[string, string]> = [
  ["DATABASE", "sqlite · postgres · mysql2"],
  ["MAIL_TRANSPORT", "smtp · console · custom"],
  ["STORAGE", "local · your provider"],
  ["CACHE_PROVIDER", "in-memory · your own"],
];

export default function WhyVeap() {
  return (
    <>
      {/* Section Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#0ac5b2]/30 bg-[#0ac5b2]/10 px-4 py-1.5 text-xs font-semibold text-[#0ac5b2] backdrop-blur-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0ac5b2] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#0ac5b2]" />
          </span>
          <span className="font-runde tracking-wide">Why Veap</span>
        </div>

        <h2 className="max-w-3xl text-balance font-runde text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl md:text-5xl">
          The Application Pieces Next.js Leaves to You.
        </h2>

        <p className="max-w-2xl text-balance text-sm font-medium text-muted-foreground sm:text-base md:text-lg">
          Veap is not a framework that replaces your renderer. It is a set of
          independent packages - lifecycle, ORM, auth, events, plugins, i18n,
          mail, settings, storage - that you install into the app you already
          have.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12 lg:gap-5">
        {/* CARD 1: Package completeness comparison (7 cols) */}
        <div
          className={cn(BENTO_CARD, "md:col-span-12 lg:col-span-7")}
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <div
            className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[#0ac5b2]/10 blur-3xl transition-opacity group-hover:opacity-100 dark:bg-[#0ac5b2]/15"
            aria-hidden="true"
          />

          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0ac5b2]">
                Package Completeness
              </span>
              <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-amber-600 dark:text-amber-400">
                Pick and choose
              </span>
            </div>

            <h3 className="mt-3 font-runde text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
              Stop Rebuilding the Same Eight Things
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Every project needs identity, persistence, events and delivery.
              Veap publishes each concern as a package with a documented entry
              point, so you install the ones you use instead of assembling them
              from scratch.
            </p>
          </div>

          {/* Comparison Table */}
          <div className={cn(PANEL, "mt-6 flex flex-col gap-1.5")}>
            <div className="grid grid-cols-[1fr_4rem_5.5rem] items-center gap-3 px-1 pb-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Concern</span>
              <span className="text-center">DIY</span>
              <span className="text-center text-[#0ac5b2]">Package</span>
            </div>
            {PACKAGES.map(([concern, diy, pkg]) => (
              <div key={concern} className={COMPARE_ROW}>
                <span className="truncate font-medium text-neutral-900 dark:text-white">
                  {concern}
                </span>
                <span className="text-center font-mono text-[10px] text-muted-foreground">
                  {diy}
                </span>
                <span className="text-center font-mono text-[10px] font-semibold text-[#0ac5b2]">
                  {pkg}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Fourteen packages: eight runtime services, shared UI, the
              create-veap CLI and four ORM traits - all pre-1.0.
            </span>
            <Link
              href="/docs/reference/packages/kernel"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0ac5b2] hover:underline"
            >
              <span>Package reference</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* CARD 2: Additive layer, no lock-in (5 cols) */}
        <div
          className={cn(BENTO_CARD, "md:col-span-12 lg:col-span-5")}
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0ac5b2]">
                Additive by Design
              </span>
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-blue-600 dark:text-blue-400">
                No lock-in
              </span>
            </div>

            <h3 className="mt-3 font-runde text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
              Next.js Stays Next.js
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Next.js keeps owning route discovery, layouts, request APIs and
              the build. Veap services are resolved from server-only modules,
              Route Handlers and Server Actions.
            </p>
          </div>

          {/* Layer Stack Visual */}
          <div className={cn(PANEL, "mt-6 flex flex-col gap-2")}>
            <div className="flex items-center justify-between rounded-xl border border-black/[0.05] bg-white px-3 py-2.5 text-xs dark:border-white/[0.06] dark:bg-neutral-900">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Your Application
                </span>
                <span className="ml-2 hidden text-neutral-500 dark:text-neutral-400 sm:inline">
                  routes · RSC · domain logic
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-[#0ac5b2]/40 bg-[#0ac5b2]/15 px-3 py-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full bg-[#0ac5b2]" />
                <span className="font-semibold text-[#0ac5b2]">
                  Veap packages
                </span>
                <span className="hidden text-neutral-700 dark:text-neutral-300 sm:inline">
                  providers · services · ports
                </span>
              </div>
              <span className="rounded-md bg-[#0ac5b2]/20 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0ac5b2]">
                additive
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-black/[0.05] bg-white px-3 py-2.5 text-xs dark:border-white/[0.06] dark:bg-neutral-900">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-white">
                  Next.js App Router
                </span>
                <span className="ml-2 hidden text-neutral-500 dark:text-neutral-400 sm:inline">
                  stock build and rendering
                </span>
              </div>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                untouched
              </span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Install one package or all of them. `next dev` never changes.
            </span>
            <Link
              href="/docs/getting-started/nextjs-integration"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0ac5b2] hover:underline"
            >
              <span>Next.js integration</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* CARD 3: No imposed filesystem (6 cols) */}
        <div
          className={cn(BENTO_CARD, "md:col-span-12 lg:col-span-6")}
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0ac5b2]">
                No Imposed Layout
              </span>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-purple-600 dark:text-purple-400">
                Your structure
              </span>
            </div>

            <h3 className="mt-3 font-runde text-lg font-bold tracking-tight text-neutral-900 dark:text-white sm:text-xl">
              A Package Ecosystem, Not a Skeleton
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Veap does not emit or require a folder convention. The layout
              below is a suggestion from the docs: keep route UI in the App
              Router and server composition in one server-only module.
            </p>
          </div>

          {/* Suggested structure (not enforced) */}
          <div className="mt-4 rounded-xl border border-black/[0.04] bg-neutral-900 p-3 font-mono text-[11px] leading-relaxed text-neutral-300 dark:border-white/[0.05] dark:bg-black/40">
            <div className="text-neutral-500">my-app/</div>
            <div>
              ├── <span className="text-blue-400">app/</span>
              <span className="text-neutral-500"> Next.js routes &amp; UI</span>
            </div>
            <div>
              ├──{" "}
              <span className="text-[#0ac5b2]">src/veap/application.ts</span>
              <span className="text-neutral-500"> server-only</span>
            </div>
            <div>
              ├── <span className="text-purple-400">src/features/</span>
              <span className="text-neutral-500"> your services</span>
            </div>
            <div>
              └── <span className="text-amber-400">migrations/</span>
              <span className="text-neutral-500"> if your app owns them</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Boundaries come from server-only modules and `client` / `server`
              entry points, not from folder names.
            </span>
            <Link
              href="/docs/getting-started/project-structure"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0ac5b2] hover:underline"
            >
              <span>Project structure</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* CARD 4: Swappable infrastructure (6 cols) */}
        <div
          className={cn(BENTO_CARD, "md:col-span-12 lg:col-span-6")}
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0ac5b2]">
                Swappable Infrastructure
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                Ports &amp; adapters
              </span>
            </div>

            <h3 className="mt-3 font-runde text-lg font-bold tracking-tight text-neutral-900 dark:text-white sm:text-xl">
              Adapters, Not Rewrites
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Drivers and transports sit behind contracts resolved from the
              container. Swap SQLite for Postgres, SMTP for the console
              transport or the local disk for your own storage provider in
              configuration.
            </p>
          </div>

          {/* Adapter Rows Visual */}
          <div className={cn(PANEL, "mt-4 flex flex-col gap-2")}>
            {ADAPTERS.map(([port, adapters]) => (
              <div
                key={port}
                className="flex items-center justify-between rounded-xl border border-black/[0.05] bg-white px-3 py-2 font-mono text-[11px] dark:border-white/[0.06] dark:bg-neutral-900"
              >
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {port}
                </span>
                <span className="text-muted-foreground">{adapters}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Database and mail drivers stay optional peer dependencies.
            </span>
            <Link
              href="/docs/packages/database"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0ac5b2] hover:underline"
            >
              <span>Database guide</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
