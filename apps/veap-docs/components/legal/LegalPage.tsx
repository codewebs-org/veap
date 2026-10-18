import React from "react";
import MarkdownRenderer from "@/components/markdown";
import { type LegalDoc, SUPPORT_EMAIL } from "@/lib/legal-config";
import LegalArticleToolbar from "./LegalArticleToolbar";
import LegalBottomNav from "./LegalBottomNav";
import LegalHero from "./LegalHero";
import LegalMobileDrawer from "./LegalMobileDrawer";
import LegalSidebar from "./LegalSidebar";

interface LegalPageProps {
  doc: LegalDoc;
  stars?: number | null;
}

export default function LegalPage({ doc, stars }: LegalPageProps) {
  return (
    <>
      {/* Dynamic Brand Hero with Squircle container & GooeyNavbar */}
      <LegalHero doc={doc} stars={stars} />

      {/* Main Content Layout with Sidebar & Article */}
      <main className="mx-auto w-full scroll-mt-16 p-1.5 md:p-2.5 my-8">
        {/* Mobile Navigation & Outline Drawer */}
        <LegalMobileDrawer doc={doc} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Sticky Desktop Sidebar */}
          <LegalSidebar doc={doc} />

          {/* Central Article Container */}
          <div className="lg:col-span-9 xl:col-span-9">
            <article
              className="rounded-[32px] sm:rounded-[40px] border border-black/[0.05] bg-white/90 p-6 sm:p-10 md:p-14 shadow-xs backdrop-blur-xs dark:border-white/[0.07] dark:bg-[#121212]/90"
              style={{ cornerShape: "squircle" } as React.CSSProperties}
            >
              {/* Article Top Toolbar (Actions, Slug, Updated timestamp) */}
              <LegalArticleToolbar slug={doc.slug} updated={doc.updated} />

              {/* Optional Intro Paragraph */}
              {doc.intro && (
                <p className="mt-8 text-base font-medium leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {doc.intro}
                </p>
              )}

              {/* Markdown Body Content */}
              <div className="mt-8">
                <MarkdownRenderer content={doc.content} />
              </div>

              {/* Previous / Next Document Navigation Cards */}
              <LegalBottomNav currentSlug={doc.slug} />

              {/* Legal Governance & Inquiries Notice */}
              <div
                className="mt-12 rounded-2xl border border-black/[0.04] bg-[#F5F5F7] p-5 text-xs text-muted-foreground dark:border-white/[0.05] dark:bg-neutral-900/50"
                style={{ cornerShape: "squircle" } as React.CSSProperties}
              >
                <p className="leading-relaxed">
                  This document is an integral component of the Veap open-source
                  governance and legal framework. For questions, licensing
                  verification, or security inquiries, please contact the Veap
                  Core Team at{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-[#0ac5b2] underline underline-offset-2 hover:text-[#00bd99]"
                  >
                    {SUPPORT_EMAIL}
                  </a>
                  .
                </p>
              </div>
            </article>
          </div>
        </div>
      </main>
    </>
  );
}
