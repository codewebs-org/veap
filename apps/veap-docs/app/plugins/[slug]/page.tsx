import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CodeBlock from "@/components/CodeBlock";
import CopyButton from "@/components/CopyButton";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import HeroIntro from "@/components/HeroIntro";
import MarkdownRenderer from "@/components/markdown";
import { fetchStarCount } from "@/lib/github";
import {
  CATEGORY_LABELS,
  getAllPluginSlugs,
  getPluginBySlug,
  plugins,
} from "@/lib/plugins";
import { pluginPageMetadata } from "@/lib/seo";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllPluginSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const plugin = getPluginBySlug(slug);
  if (!plugin) return {};
  return pluginPageMetadata(plugin.href);
}

export default async function PluginDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const plugin = getPluginBySlug(slug);

  if (!plugin) {
    notFound();
  }

  const stars = await fetchStarCount();
  const categoryLabel = CATEGORY_LABELS[plugin.category] || plugin.category;

  return (
    <>
      <section className="relative w-full p-1.5 md:p-2.5">
        <div
          className="relative flex min-h-[min(78svh,50rem)] w-full items-center justify-center overflow-hidden rounded-[45px] border border-black/[0.04] bg-[#F5F5F7] dark:border-transparent dark:border-apple dark:bg-[#121212]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <GooeyNavbar stars={stars} />
          <img
            src="/logos/veap.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[68%] w-215 max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.05] [filter:brightness(0)] dark:opacity-[0.07] dark:[filter:brightness(0)_invert(1)]"
          />
          {/* Background Ambient Glow */}
          <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_75%_at_50%_-5%,rgba(10,197,178,0.10),transparent_60%)] dark:block" />

          {/* Header Content */}
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 pb-16 pt-28 text-center sm:gap-4 sm:px-6">
            <HeroIntro
              headline={plugin.name}
              sub={plugin.description}
              badge={
                <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                  <Link
                    href="/plugins"
                    className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-[#0ac5b2] transition-colors"
                  >
                    <span>&larr;</span> All Plugins
                  </Link>
                  <span className="text-muted-foreground">/</span>
                  <span className="rounded-full bg-black/5 px-2.5 py-0.5 font-medium text-foreground dark:bg-white/10">
                    {categoryLabel}
                  </span>
                  <span className="text-muted-foreground">/</span>
                  <span className="text-foreground/80 font-mono">
                    v{plugin.version}
                  </span>
                  {plugin.status === "official" && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#0ac5b2]/30 bg-[#0ac5b2]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#0ac5b2]"
                      style={{ cornerShape: "squircle" } as React.CSSProperties}
                    >
                      <span className="size-1.5 rounded-full bg-[#0ac5b2] animate-pulse" />
                      Official
                    </span>
                  )}
                  {plugin.isNew && (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
                      style={{ cornerShape: "squircle" } as React.CSSProperties}
                    >
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      New
                    </span>
                  )}
                </div>
              }
            >
              <div className="mt-2 flex flex-col items-center gap-3">
                {/* Installation Box Bar */}
                <div
                  className="flex w-full max-w-md items-center justify-between gap-2 rounded-2xl border border-black/[0.08] bg-white p-1.5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90"
                  style={{ cornerShape: "squircle" } as React.CSSProperties}
                >
                  <code className="truncate pl-3 font-mono text-xs sm:text-sm text-neutral-800 dark:text-neutral-200">
                    {plugin.installation.command}
                  </code>
                  <CopyButton
                    value={plugin.installation.command}
                    label="Copy"
                  />
                </div>

                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 font-medium text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="text-[#0ac5b2]">[</span>
                    See clean architecture layers, Knex migrations &
                    configuration below
                    <span className="text-[#0ac5b2]">]</span>
                  </span>
                </div>
              </div>
            </HeroIntro>
          </div>
        </div>
      </section>

      {/* Main Details Section */}
      <main className="mx-auto w-full scroll-mt-16 p-1.5 md:p-2.5 my-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left / Main Column (2/3) */}
          <div className="flex flex-col gap-8 lg:col-span-2">
            {/* Purpose & Overview */}
            <section
              className="rounded-[32px] border border-black/[0.04] bg-[#F5F5F7] p-6 dark:border-apple dark:bg-[#121212] sm:p-8"
              style={{ cornerShape: "squircle" } as React.CSSProperties}
            >
              <h2 className="font-runde text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
                Purpose & Overview
              </h2>
              <div className="mt-4 leading-relaxed text-neutral-600 dark:text-neutral-300 text-base sm:text-lg">
                <MarkdownRenderer content={plugin.purpose} />
              </div>
            </section>

            {/* Installation & Configuration */}
            <section
              className="rounded-[32px] border border-black/[0.04] bg-[#F5F5F7] p-6 dark:border-apple dark:bg-[#121212] sm:p-8"
              style={{ cornerShape: "squircle" } as React.CSSProperties}
            >
              <h2 className="font-runde text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
                Installation & Setup
              </h2>

              <div className="mt-6 flex flex-col gap-6">
                {/* Step 1 */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#0ac5b2] font-mono text-xs font-bold text-white">
                      1
                    </span>
                    <h3 className="font-runde text-base font-semibold text-neutral-900 dark:text-white">
                      Install the package
                    </h3>
                  </div>
                  <CodeBlock
                    code={plugin.installation.command}
                    language="bash"
                    className="mt-1"
                  />
                </div>

                {/* Step 2 */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-6 items-center justify-center rounded-full bg-[#0ac5b2] font-mono text-xs font-bold text-white">
                      2
                    </span>
                    <h3 className="font-runde text-base font-semibold text-neutral-900 dark:text-white">
                      {plugin.type === "template"
                        ? "Register template in lib/veap.ts"
                        : plugin.category === "orm"
                          ? "Apply trait to your domain Model"
                          : "Register in lib/veap.ts (or auto via lib/plugins.gen.ts)"}
                    </h3>
                  </div>
                  <CodeBlock
                    code={plugin.usage}
                    language="typescript"
                    filename={
                      plugin.type === "template"
                        ? "lib/veap.ts"
                        : plugin.category === "orm"
                          ? "models/YourModel.ts"
                          : "lib/veap.ts"
                    }
                    className="mt-1"
                  />
                </div>

                {/* Step 3: Migrations if applicable */}
                {plugin.hasMigrations && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="flex size-6 items-center justify-center rounded-full bg-[#0ac5b2] font-mono text-xs font-bold text-white">
                        3
                      </span>
                      <h3 className="font-runde text-base font-semibold text-neutral-900 dark:text-white">
                        Start application
                      </h3>
                    </div>
                    <CodeBlock
                      code="bun dev"
                      language="bash"
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Migrations run automatically on boot via
                      MigrationServiceProvider.
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Keep in Mind / Best Practices */}
            {plugin.keepInMind && plugin.keepInMind.length > 0 && (
              <section
                className="rounded-[32px] border border-black/[0.04] bg-[#F5F5F7] p-6 dark:border-apple dark:bg-[#121212] sm:p-8"
                style={{ cornerShape: "squircle" } as React.CSSProperties}
              >
                <div className="flex items-center gap-2.5">
                  <span className="rounded-xl bg-[#0ac5b2]/10 p-2 text-[#0ac5b2]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="size-5"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </span>
                  <h2 className="font-runde text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl">
                    Keep in mind
                  </h2>
                </div>

                <ul className="mt-5 flex flex-col gap-3">
                  {plugin.keepInMind.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 rounded-2xl border border-black/[0.04] bg-white p-4 text-sm leading-relaxed text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                    >
                      <span className="mt-0.5 size-2 shrink-0 rounded-full bg-[#0ac5b2]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Right Column / Metadata Sidebar (1/3) */}
          <div className="flex flex-col gap-6">
            {/* Dependencies Card */}
            <div
              className="flex flex-col rounded-[32px] border border-black/[0.04] bg-[#F5F5F7] p-6 dark:border-apple dark:bg-[#121212]"
              style={{ cornerShape: "squircle" } as React.CSSProperties}
            >
              <h3 className="font-runde text-base font-semibold text-neutral-900 dark:text-white">
                Dependencies
              </h3>

              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Veap Kernel
                  </span>
                  <p className="mt-1 font-mono text-sm text-neutral-800 dark:text-neutral-200">
                    @veap/kernel ({plugin.dependencies.core})
                  </p>
                </div>

                {plugin.dependencies.veap.length > 0 && (
                  <div>
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Required Veap Plugins
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {plugin.dependencies.veap.map((depSlug) => {
                        const targetPlugin = plugins.find(
                          (p) => p.slug === depSlug || p.id === depSlug,
                        );
                        return targetPlugin ? (
                          <Link
                            key={depSlug}
                            href={targetPlugin.href}
                            className="rounded-lg border border-black/[0.06] bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:border-[#0ac5b2] hover:text-[#0ac5b2] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300 transition-colors"
                          >
                            @{depSlug} &rarr;
                          </Link>
                        ) : (
                          <span
                            key={depSlug}
                            className="rounded-lg border border-black/[0.06] bg-white px-2.5 py-1 text-xs text-muted-foreground dark:border-neutral-800 dark:bg-neutral-950"
                          >
                            @{depSlug}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {plugin.dependencies.packages.length > 0 && (
                  <div>
                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      NPM Packages
                    </span>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {plugin.dependencies.packages.map((pkgName) => (
                        <span
                          key={pkgName}
                          className="rounded-lg border border-black/[0.06] bg-white px-2 py-1 font-mono text-xs text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                        >
                          {pkgName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Authors & Maintainers */}
            <div
              className="flex flex-col rounded-[32px] border border-black/[0.04] bg-[#F5F5F7] p-6 dark:border-apple dark:bg-[#121212]"
              style={{ cornerShape: "squircle" } as React.CSSProperties}
            >
              <h3 className="font-runde text-base font-semibold text-neutral-900 dark:text-white">
                Authors & Maintainers
              </h3>

              <div className="mt-4 flex flex-col gap-3">
                {plugin.authors.map((author, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-neutral-900 dark:text-white">
                        {author.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {author.role}
                      </p>
                    </div>
                    {author.url && (
                      <a
                        href={author.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#0ac5b2] hover:underline"
                      >
                        Profile &rarr;
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Links & Repository */}
            <div
              className="flex flex-col rounded-[32px] border border-black/[0.04] bg-[#F5F5F7] p-6 dark:border-apple dark:bg-[#121212]"
              style={{ cornerShape: "squircle" } as React.CSSProperties}
            >
              <h3 className="font-runde text-base font-semibold text-neutral-900 dark:text-white">
                Links & Source
              </h3>

              <div className="mt-4 flex flex-col gap-2.5 text-xs font-medium">
                {plugin.contact.repository && (
                  <a
                    href={plugin.contact.repository}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-black/[0.04] bg-white p-3 hover:border-[#0ac5b2] hover:text-[#0ac5b2] dark:border-neutral-800 dark:bg-neutral-950 transition-colors"
                  >
                    <span>Source Code</span>
                    <span>&rarr;</span>
                  </a>
                )}
                {plugin.contact.issues && (
                  <a
                    href={plugin.contact.issues}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-black/[0.04] bg-white p-3 hover:border-[#0ac5b2] hover:text-[#0ac5b2] dark:border-neutral-800 dark:bg-neutral-950 transition-colors"
                  >
                    <span>Issue Tracker</span>
                    <span>&rarr;</span>
                  </a>
                )}
                <div className="flex items-center justify-between rounded-xl border border-black/[0.04] bg-white p-3 text-muted-foreground dark:border-neutral-800 dark:bg-neutral-950">
                  <span>License</span>
                  <span className="font-mono uppercase text-foreground">
                    {plugin.license}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
