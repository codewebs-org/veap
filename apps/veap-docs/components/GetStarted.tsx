import Link from "next/link";
import CopyButton from "@/components/CopyButton";
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

const STEPS: Array<{
  num: string;
  title: string;
  code: string | null;
  note: string;
}> = [
  {
    num: "01",
    title: "Install the packages you need",
    code: "bun add @veap/kernel @veap/database",
    note: "Packages are independent and versioned separately. Drivers such as better-sqlite3, pg or mysql2 stay your choice.",
  },
  {
    num: "02",
    title: "Write the composition root",
    code: "src/server/veap.ts",
    note: "Application.configure().use(...).create() in one server-only module - register infrastructure before the providers that depend on it.",
  },
  {
    num: "03",
    title: "Boot before resolving services",
    code: "await ensureVeapBooted()",
    note: "Bootstrap runs once per process and is skipped in the browser and during next build, so builds never need a database.",
  },
];

export default function GetStarted() {
  return (
    <>
      {/* Section Header */}
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#0ac5b2]/30 bg-[#0ac5b2]/10 px-4 py-1.5 text-xs font-semibold text-[#0ac5b2] backdrop-blur-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0ac5b2] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#0ac5b2]"></span>
          </span>
          <span className="font-runde tracking-wide">Get Started</span>
        </div>

        <h2 className="max-w-3xl text-balance font-runde text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl md:text-5xl">
          Scaffold a Project, or Add Packages to Yours.
        </h2>

        <p className="max-w-2xl text-balance text-sm font-medium text-muted-foreground sm:text-base md:text-lg">
          There is no framework migration waiting for you: either let the
          scaffolder create a Next.js project with the Veap overlay, or install
          the packages into the app you already run.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-12 lg:gap-5">
        {/* Terminal card (7 cols) */}
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
                Quick Start
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                bun · pnpm · npm · yarn
              </span>
            </div>

            <h3 className="mt-3 font-runde text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
              Scaffold with create-veap
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              The initializer runs the official{" "}
              <code className="font-mono text-xs">create-next-app</code>
              (TypeScript, Tailwind, ESLint, React Compiler,{" "}
              <code className="font-mono text-xs">@/*</code> alias) and then
              layers the Veap application shell on top: bootstrap module, route
              pipeline, migrations, plugins registry, an{" "}
              <code className="font-mono text-xs">ENCRYPTION_KEY</code> in{" "}
              <code className="font-mono text-xs">.env</code> and{" "}
              <code className="font-mono text-xs">engines.node &gt;= 22</code>.
            </p>
          </div>

          {/* Terminal */}
          <div className="mt-6 rounded-xl border border-black/[0.04] bg-neutral-900 p-3 font-mono text-[11px] leading-relaxed text-neutral-300 dark:border-white/[0.05] dark:bg-black/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <span className="text-[#0ac5b2]">$</span> bun create veap my-app
              </div>
              <CopyButton
                value="bun create veap my-app"
                label="Copy command"
                className="text-neutral-500 hover:text-white"
              />
            </div>
            <div className="pl-4 text-neutral-500">
              create-next-app → Veap overlay → package-manager install
            </div>
            <div className="pt-1">
              <span className="text-[#0ac5b2]">$</span> cd my-app &amp;&amp; bun
              dev
            </div>
            <div className="pl-4 text-neutral-500">
              next dev on :3000 with the Veap shell in place
            </div>
            <div className="pt-2 text-neutral-500">
              ✓ Ready in 948ms · Local: http://localhost:3000
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-3 py-2 text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
            Documented caveat: the generated manifest still injects the
            monolithic-era <code className="font-mono">@veap/framework</code>{" "}
            entry point. Review the generated{" "}
            <code className="font-mono">package.json</code> against the package
            set you intend to use before installing.
          </div>

          <div className="mt-5 flex items-center justify-between pt-2">
            <span className="text-xs text-muted-foreground">
              Docker files are one flag away:{" "}
              <code className="font-mono">--docker</code>.
            </span>
            <Link
              href="/docs/packages/create-veap"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0ac5b2] hover:underline"
            >
              <span>CLI guide</span>
              <span>&rarr;</span>
            </Link>
          </div>
        </div>

        {/* Steps card (5 cols) */}
        <div
          className={cn(BENTO_CARD, "md:col-span-12 lg:col-span-5")}
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] font-semibold uppercase tracking-wider text-[#0ac5b2]">
                Existing Project
              </span>
              <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 font-mono text-[10px] font-medium text-blue-600 dark:text-blue-400">
                Additive
              </span>
            </div>

            <h3 className="mt-3 font-runde text-lg font-bold tracking-tight text-neutral-900 dark:text-white sm:text-xl">
              Install Packages, Wire One Root
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Nothing is generated into your tree by the packages themselves.
              You add dependencies, write the composition root once, and call a
              boot helper from server code.
            </p>
          </div>

          {/* Steps list */}
          <div className={cn(PANEL, "mt-6 flex flex-col gap-2")}>
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="rounded-xl border border-black/[0.05] bg-white px-3 py-2.5 text-xs dark:border-white/[0.06] dark:bg-neutral-900"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#0ac5b2]/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#0ac5b2]">
                    {step.num}
                  </span>
                  <span className="font-semibold text-neutral-900 dark:text-white">
                    {step.title}
                  </span>
                </div>
                {step.code && (
                  <div className="mt-1.5 truncate font-mono text-[11px] text-neutral-700 dark:text-neutral-300">
                    <span className="text-[#0ac5b2]">$</span> {step.code}
                  </div>
                )}
                <div className="mt-1 text-[10px] text-muted-foreground">
                  {step.note}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 pt-2">
            <span className="text-xs text-muted-foreground">
              SQLite for development, PostgreSQL for production.
            </span>
            <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href="/docs/getting-started/project-structure"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0ac5b2] hover:underline"
              >
                <span>Who owns which file</span>
                <span>&rarr;</span>
              </Link>
              <Link
                href="/docs/getting-started/first-application"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0ac5b2] hover:underline"
              >
                <span>First application</span>
                <span>&rarr;</span>
              </Link>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
