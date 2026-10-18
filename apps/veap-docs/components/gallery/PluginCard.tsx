"use client";

import Link from "next/link";
import type { VeapPlugin } from "@/lib/plugins";
import { CATEGORY_LABELS } from "@/lib/plugins";
import { cn } from "@/lib/utils";

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    aria-hidden="true"
  >
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-3 w-3 text-[#0ac5b2]"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function PluginCard({
  item,
  large = false,
  className,
}: {
  item: VeapPlugin;
  large?: boolean;
  className?: string;
}) {
  const categoryLabel = CATEGORY_LABELS[item.category] || item.category;

  return (
    <Link
      href={item.href}
      className={cn(
        "group flex flex-col justify-between rounded-[32px] border border-black/[0.04] bg-[#F5F5F7] p-2 transition-all duration-200 ease-out hover:border-black/10 dark:border-apple dark:bg-[#121212] dark:hover:border-neutral-700 dark:hover:bg-[#171717]",
        large && "lg:h-full",
        className,
      )}
      style={{ cornerShape: "squircle" } as React.CSSProperties}
    >
      {/* Description Content Box instead of Live Video */}
      <div
        className={cn(
          "relative flex aspect-4/3 w-full flex-col justify-between overflow-hidden rounded-3xl border border-black/[0.06] bg-white p-5 dark:border-neutral-500/15 dark:bg-neutral-950",
          large && "lg:aspect-auto lg:flex-1",
        )}
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      >
        {/* Subtle Background Glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#0ac5b2]/5 blur-2xl transition-opacity duration-300 group-hover:opacity-100 dark:bg-[#0ac5b2]/10" />

        {/* Top Badges */}
        <div className="relative z-10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="rounded-full bg-black/[0.05] px-2.5 py-0.5 font-runde text-[11px] font-medium tracking-wide text-neutral-700 dark:bg-white/[0.08] dark:text-neutral-300">
              {categoryLabel}
            </span>
            <span className="rounded-full bg-neutral-200/60 px-2 py-0.5 font-mono text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
              v{item.version}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {item.status === "official" && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#0ac5b2]/10 px-2 py-0.5 text-[10px] font-medium text-[#0ac5b2]">
                <CheckIcon />
                Official
              </span>
            )}
            {item.isNew && (
              <span className="rounded-full bg-[#0ac5b2]/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-[#0ac5b2]">
                New
              </span>
            )}
          </div>
        </div>

        {/* Plugin Purpose & Description */}
        <div className="relative z-10 my-auto py-2">
          <p className="line-clamp-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300 sm:text-[15px]">
            {item.description}
          </p>
        </div>

        {/* Bottom Metadata inside preview container */}
        <div className="relative z-10 flex flex-col gap-2 pt-2 border-t border-black/[0.04] dark:border-neutral-800/80">
          <div className="flex items-center justify-between gap-2">
            <code className="truncate font-mono text-[11px] text-neutral-500 dark:text-neutral-400">
              {item.installation.command}
            </code>
            {item.dependencies.veap.length > 0 && (
              <span className="shrink-0 rounded-full bg-black/[0.03] px-2 py-0.5 font-runde text-[10px] text-muted-foreground dark:bg-white/[0.05]">
                +{item.dependencies.veap.length} deps
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-2.5">
        <div className="min-w-0">
          <h3 className="flex items-center gap-2 font-runde text-base font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">
            {item.name}
          </h3>
          <p className="font-mono text-xs text-muted-foreground truncate">
            {item.package}
          </p>
        </div>
        <span className="flex shrink-0 items-center justify-center text-[#0ac5b2]">
          <ArrowIcon />
        </span>
      </div>
    </Link>
  );
}
