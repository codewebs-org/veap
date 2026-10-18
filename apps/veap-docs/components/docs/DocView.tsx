import Link from "next/link";
import DocsMobileDrawer from "@/components/docs/DocsMobileDrawer";
import DocsRightSidebar from "@/components/docs/DocsRightSidebar";
import DocsSidebar from "@/components/docs/DocsSidebar";
import EarlyAccessBadge from "@/components/EarlyAccessBadge";
import GooeyNavbar from "@/components/GooeyNavbar";
import HeroIntro from "@/components/HeroIntro";
import MarkdownRenderer from "@/components/markdown";
import type { DocPageData, DocSection } from "@/lib/docs-data";
import { cn } from "@/lib/utils";

interface DocViewProps {
  doc: DocPageData;
  sections: DocSection[];
  stars?: number | null;
  isRoot?: boolean;
}

export default function DocView({
  doc,
  sections,
  stars,
  isRoot: isRootProp,
}: DocViewProps) {
  const isRoot = isRootProp ?? doc.slug === "";
  const nav = { prev: doc.prev, next: doc.next };

  return (
    <>
      {/* Top Banner with GooeyNavbar */}
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

          {/* Subtle Ambient Glow */}
          <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_75%_at_50%_-5%,rgba(10,197,178,0.10),transparent_60%)] dark:block" />

          {/* Header Content */}
          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 pb-16 pt-28 text-center sm:gap-4 sm:px-6">
            {isRoot ? (
              <HeroIntro
                headline="The Veap Documentation"
                sub={
                  doc.description ||
                  "Fourteen packages for Next.js 16 - kernel, ORM, auth, plugins, i18n, mail, settings, storage and four ORM traits. Start with installation, then follow the guides."
                }
                badge={<EarlyAccessBadge label="Docs Preview" />}
              >
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1.5 font-medium text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="text-[#0ac5b2]">[</span>
                    Browse topics below or select a chapter from the sidebar
                    <span className="text-[#0ac5b2]">]</span>
                  </span>
                </div>
              </HeroIntro>
            ) : (
              <HeroIntro
                headline={doc.title}
                sub={doc.description || ""}
                badge={
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Link
                        href="/docs"
                        className="hover:text-[#0ac5b2] transition-colors"
                      >
                        Docs
                      </Link>
                      {doc.breadcrumbs.map((crumb) => (
                        <span key={crumb} className="flex items-center gap-2">
                          <span>/</span>
                          <span className="text-neutral-700 dark:text-neutral-300 font-medium">
                            {crumb}
                          </span>
                        </span>
                      ))}
                    </div>

                    {/* Optional Status Pill (Stable, Early Access, Beta, Experimental, New) */}
                    {doc.frontmatter.status && (
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
                          doc.frontmatter.status.toLowerCase() === "stable"
                            ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : doc.frontmatter.status.toLowerCase() ===
                                "early access"
                              ? "border-[#0ac5b2]/30 bg-[#0ac5b2]/10 text-[#0ac5b2]"
                              : doc.frontmatter.status.toLowerCase() ===
                                    "beta" ||
                                  doc.frontmatter.status.toLowerCase() === "new"
                                ? "border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "border-purple-500/25 bg-purple-500/10 text-purple-600 dark:text-purple-400",
                        )}
                        style={
                          { cornerShape: "squircle" } as React.CSSProperties
                        }
                      >
                        <span
                          className={cn(
                            "size-1.5 rounded-full animate-pulse",
                            doc.frontmatter.status.toLowerCase() === "stable"
                              ? "bg-emerald-500"
                              : doc.frontmatter.status.toLowerCase() ===
                                  "early access"
                                ? "bg-[#0ac5b2]"
                                : doc.frontmatter.status.toLowerCase() ===
                                      "beta" ||
                                    doc.frontmatter.status.toLowerCase() ===
                                      "new"
                                  ? "bg-amber-500"
                                  : "bg-purple-500",
                          )}
                        />
                        {doc.frontmatter.status}
                      </span>
                    )}
                  </div>
                }
              >
                {/* Metadata Bar: Reading Time, Author, Last Updated */}
                <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                  {/* Reading Time */}
                  <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="size-3.5 opacity-70"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    {doc.readingTime}
                  </span>

                  {/* Author */}
                  {doc.frontmatter.author && (
                    <>
                      <span className="opacity-30">•</span>
                      <span className="inline-flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="size-3.5 opacity-70"
                        >
                          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {doc.frontmatter.author}
                      </span>
                    </>
                  )}

                  {/* Last Updated */}
                  {doc.frontmatter.lastUpdated && (
                    <>
                      <span className="opacity-30">•</span>
                      <span className="text-neutral-500 dark:text-neutral-400">
                        Updated {doc.frontmatter.lastUpdated}
                      </span>
                    </>
                  )}
                </div>
              </HeroIntro>
            )}
          </div>
        </div>
      </section>

      {/* Main Documentation Grid Layout */}
      <main className="mx-auto w-full scroll-mt-16 p-1.5 md:p-2.5 my-8">
        {/* Mobile Navigation Bar */}
        <DocsMobileDrawer
          currentTitle={doc.title}
          toc={doc.toc}
          sections={sections}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Sidebar (Desktop Navigation) */}
          <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
            <DocsSidebar sections={sections} />
          </aside>

          {/* Central Content Card */}
          <div
            className={cn(
              "lg:col-span-8",
              doc.toc && doc.toc.length > 0 ? "xl:col-span-6" : "xl:col-span-9",
            )}
          >
            <article
              className="rounded-3xl border border-black/4 bg-background p-6 dark:border-apple sm:p-10 shadow-sm"
              style={{ cornerShape: "squircle" } as React.CSSProperties}
            >
              {/* Document Body */}
              <MarkdownRenderer content={doc.content} currentFile={doc.file} />

              {/* Bottom Next / Previous Navigation */}
              <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/[0.06] pt-6 dark:border-neutral-800">
                {nav.prev?.href ? (
                  <Link
                    href={nav.prev.href}
                    className="group flex w-full sm:w-auto flex-col rounded-2xl border border-black/[0.06] bg-white p-4 transition-all hover:border-[#0ac5b2] dark:border-neutral-800 dark:bg-neutral-950/60 sm:min-w-[200px]"
                    style={{ cornerShape: "squircle" } as React.CSSProperties}
                  >
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      &larr; Previous
                    </span>
                    <span className="font-runde text-sm font-semibold text-neutral-900 group-hover:text-[#0ac5b2] dark:text-white transition-colors">
                      {nav.prev.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}

                {nav.next?.href ? (
                  <Link
                    href={nav.next.href}
                    className="group flex w-full sm:w-auto flex-col items-end rounded-2xl border border-black/[0.06] bg-white p-4 transition-all hover:border-[#0ac5b2] dark:border-neutral-800 dark:bg-neutral-950/60 sm:min-w-[200px] text-right"
                    style={{ cornerShape: "squircle" } as React.CSSProperties}
                  >
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      Next &rarr;
                    </span>
                    <span className="font-runde text-sm font-semibold text-neutral-900 group-hover:text-[#0ac5b2] dark:text-white transition-colors">
                      {nav.next.title}
                    </span>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </article>
          </div>

          {/* Right Sidebar (Desktop XL): On This Page Table of Contents */}
          {doc.toc && doc.toc.length > 0 && (
            <aside className="hidden xl:block xl:col-span-3">
              <DocsRightSidebar doc={doc} />
            </aside>
          )}
        </div>
      </main>

      {/* <Footer /> */}
    </>
  );
}
