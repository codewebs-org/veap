/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import React from "react";
import GooeyNavbar from "@/components/GooeyNavbar";
import HeroIntro from "@/components/HeroIntro";
import { LEGAL_DOCS_CONFIG, type LegalDoc } from "@/lib/legal-config";
import { cn } from "@/lib/utils";
import {
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  LegalDocIconComponent,
} from "./icons";

interface LegalHeroProps {
  doc: LegalDoc;
  stars?: number | null;
}

export default function LegalHero({ doc, stars }: LegalHeroProps) {
  return (
    <section className="relative w-full p-1.5 md:p-2.5">
      <div
        className="relative flex min-h-[min(56svh,38rem)] w-full items-center justify-center overflow-hidden rounded-[45px] border border-black/[0.04] bg-[#F5F5F7] dark:border-transparent dark:border-apple dark:bg-[#121212]"
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      >
        <GooeyNavbar stars={stars} />

        {/* Ambient Veap Watermark */}
        <img
          src="/logos/veap.svg"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-[68%] w-215 max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.05] [filter:brightness(0)] dark:opacity-[0.07] dark:[filter:brightness(0)_invert(1)]"
        />

        {/* Teal Ambient Radial Glow */}
        <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_75%_at_50%_-5%,rgba(10,197,178,0.12),transparent_60%)] dark:block" />

        {/* Center Content */}
        <div className="relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center gap-3 px-4 pb-16 pt-28 text-center sm:gap-4 sm:px-6">
          <HeroIntro
            headline={doc.title}
            sub={doc.description}
            badge={
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <div
                  className="inline-flex items-center gap-2 rounded-full border border-black/[0.08] bg-white/80 px-3.5 py-1 font-medium text-neutral-700 shadow-xs backdrop-blur-xs dark:border-white/[0.08] dark:bg-white/[0.04] dark:text-neutral-300"
                  style={{ cornerShape: "squircle" } as React.CSSProperties}
                >
                  <LegalDocIconComponent
                    icon={doc.meta.icon}
                    className="size-3.5 text-[#0ac5b2]"
                  />
                  <span>{doc.meta.category}</span>
                  <span className="opacity-30">•</span>
                  <span className="font-semibold text-[#0ac5b2]">
                    {doc.meta.badge}
                  </span>
                </div>
              </div>
            }
          >
            {/* Meta Row: Updated Date, Reading Time, Word Count */}
            <div className="mt-1 flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                <CalendarIcon className="size-3.5 opacity-70" />
                Updated {doc.updated}
              </span>
              <span className="opacity-30">•</span>
              <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                <ClockIcon className="size-3.5 opacity-70" />
                {doc.readingTime}
              </span>
              <span className="opacity-30">•</span>
              <span className="inline-flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                <FileTextIcon className="size-3.5 opacity-70" />
                {doc.wordCount.toLocaleString()} words
              </span>
            </div>

            {/* Document Switcher Pill Bar */}
            <div className="mt-7 flex flex-wrap items-center justify-center gap-1.5 max-w-2xl sm:max-w-3xl">
              {LEGAL_DOCS_CONFIG.map((item) => {
                const isActive = item.slug === doc.slug;
                return (
                  <Link
                    key={item.slug}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs transition-all duration-200",
                      isActive
                        ? "bg-neutral-900 font-semibold text-white shadow-sm dark:bg-white dark:text-neutral-950 scale-105 ring-2 ring-[#0ac5b2]/50 ring-offset-1 dark:ring-offset-neutral-900"
                        : "bg-white/70 text-neutral-600 hover:bg-white hover:text-neutral-900 dark:bg-neutral-900/60 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white border border-black/[0.04] dark:border-white/[0.06]",
                    )}
                    style={{ cornerShape: "squircle" } as React.CSSProperties}
                  >
                    <LegalDocIconComponent
                      icon={item.icon}
                      className={cn(
                        "size-3",
                        isActive
                          ? "text-[#0ac5b2] dark:text-[#0ac5b2]"
                          : "opacity-70",
                      )}
                    />
                    <span>{item.shortTitle}</span>
                  </Link>
                );
              })}
            </div>
          </HeroIntro>
        </div>
      </div>
    </section>
  );
}
