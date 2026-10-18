import Link from "next/link";
import React from "react";
import TableOfContents from "@/components/markdown/TableOfContents";
import {
  LEGAL_DOCS_CONFIG,
  type LegalDoc,
  SUPPORT_EMAIL,
} from "@/lib/legal-config";
import { cn } from "@/lib/utils";
import { GithubLogo } from "../logos";
import { LegalDocIconComponent, MailIcon } from "./icons";

interface LegalSidebarProps {
  doc: LegalDoc;
}

export default function LegalSidebar({ doc }: LegalSidebarProps) {
  const contactEmail =
    doc.slug === "security-policy" ? "security@veap.pl" : SUPPORT_EMAIL;

  return (
    <aside className="hidden lg:block lg:col-span-3 xl:col-span-3">
      <div className="sticky top-8 flex flex-col gap-5 max-h-[calc(100vh-4rem)] overflow-y-auto pr-2 pb-8">
        {/* Document Navigation Card */}
        <div
          className="rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/80 p-4 dark:border-white/[0.07] dark:bg-[#121212]/80 backdrop-blur-xs"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <div className="mb-2.5 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            All Legal Documents
          </div>
          <nav className="flex flex-col gap-0.5">
            {LEGAL_DOCS_CONFIG.map((item) => {
              const isActive = item.slug === doc.slug;
              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors",
                    isActive
                      ? "bg-[#0ac5b2]/10 font-semibold text-[#0ac5b2]"
                      : "text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white",
                  )}
                  style={{ cornerShape: "squircle" } as React.CSSProperties}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    <LegalDocIconComponent
                      icon={item.icon}
                      className={cn(
                        "size-3.5 shrink-0",
                        isActive ? "text-[#0ac5b2]" : "opacity-60",
                      )}
                    />
                    <span className="truncate">{item.title}</span>
                  </span>
                  {isActive && (
                    <span className="size-1.5 rounded-full bg-[#0ac5b2] shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Table of Contents */}
        {doc.headings.length > 0 && <TableOfContents headings={doc.headings} />}

        {/* Questions & Contact Card */}
        <div
          className="rounded-2xl border border-black/[0.06] bg-white/90 p-4 dark:border-white/[0.07] dark:bg-[#121212]/90 backdrop-blur-xs"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-900 dark:text-white mb-1.5">
            <MailIcon className="size-3.5 text-[#0ac5b2]" />
            <span>Questions or Inquiries?</span>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Our team is available to assist with legal, security, and
            contribution questions.
          </p>
          <div className="mt-3 flex flex-col gap-2 pt-2 border-t border-black/[0.04] dark:border-white/[0.05]">
            <a
              href={`mailto:${contactEmail}`}
              className="inline-flex items-center gap-2 text-xs font-medium text-[#0ac5b2] hover:underline"
            >
              <span className="truncate">{contactEmail}</span>
            </a>
            <a
              href="https://github.com/veapjs/veap"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
            >
              <GithubLogo className="size-3 shrink-0" />
              <span>GitHub Community &rarr;</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
