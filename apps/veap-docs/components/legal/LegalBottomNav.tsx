import Link from "next/link";
import React from "react";
import { LEGAL_DOCS_CONFIG } from "@/lib/legal-config";
import { LegalDocIconComponent } from "./icons";

interface LegalBottomNavProps {
  currentSlug: string;
}

export default function LegalBottomNav({ currentSlug }: LegalBottomNavProps) {
  const index = LEGAL_DOCS_CONFIG.findIndex(
    (item) => item.slug === currentSlug,
  );
  if (index === -1) return null;

  const prev = index > 0 ? LEGAL_DOCS_CONFIG[index - 1] : undefined;
  const next =
    index < LEGAL_DOCS_CONFIG.length - 1
      ? LEGAL_DOCS_CONFIG[index + 1]
      : undefined;

  return (
    <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/[0.06] pt-8 dark:border-white/[0.08]">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex w-full sm:w-auto flex-1 flex-col rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/80 p-4 transition-all hover:border-[#0ac5b2] hover:bg-white dark:border-white/[0.08] dark:bg-[#121212]/80 dark:hover:border-[#0ac5b2] dark:hover:bg-neutral-900"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            &larr; Previous Document
          </span>
          <div className="mt-1 flex items-center gap-2">
            <LegalDocIconComponent
              icon={prev.icon}
              className="size-4 text-[#0ac5b2]"
            />
            <span className="font-runde text-sm font-semibold text-neutral-900 transition-colors group-hover:text-[#0ac5b2] dark:text-white">
              {prev.title}
            </span>
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}

      {next ? (
        <Link
          href={next.href}
          className="group flex w-full sm:w-auto flex-1 flex-col items-end rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/80 p-4 text-right transition-all hover:border-[#0ac5b2] hover:bg-white dark:border-white/[0.08] dark:bg-[#121212]/80 dark:hover:border-[#0ac5b2] dark:hover:bg-neutral-900"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Next Document &rarr;
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="font-runde text-sm font-semibold text-neutral-900 transition-colors group-hover:text-[#0ac5b2] dark:text-white">
              {next.title}
            </span>
            <LegalDocIconComponent
              icon={next.icon}
              className="size-4 text-[#0ac5b2]"
            />
          </div>
        </Link>
      ) : (
        <div className="flex-1" />
      )}
    </div>
  );
}
