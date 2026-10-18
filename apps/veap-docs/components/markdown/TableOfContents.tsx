"use client";

import { useEffect, useState } from "react";
import type { TocHeading } from "@/lib/docs-data";
import { cn } from "@/lib/utils";

export interface TableOfContentsProps {
  headings: TocHeading[];
  className?: string;
  title?: string;
  onNavigate?: () => void;
}

export default function TableOfContents({
  headings,
  className,
  title = "On This Page",
  onNavigate,
}: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const headingElements = headings
        .map((h) => ({
          id: h.id,
          el: document.getElementById(h.id),
        }))
        .filter(
          (item): item is { id: string; el: HTMLElement } => item.el !== null,
        );

      if (headingElements.length === 0) return;

      // Find heading that is closest to top offset 140px
      const triggerOffset = 140;
      let currentId = headingElements[0].id;

      for (let i = 0; i < headingElements.length; i++) {
        const top = headingElements[i].el.getBoundingClientRect().top;
        if (top <= triggerOffset) {
          currentId = headingElements[i].id;
        } else {
          break;
        }
      }

      setActiveId(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/80 p-4 dark:border-white/[0.07] dark:bg-[#121212]/80 backdrop-blur-xs",
        className,
      )}
      style={{ cornerShape: "squircle" } as React.CSSProperties}
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground/60 font-mono">
          {headings.length} sections
        </span>
      </div>

      <nav className="flex flex-col gap-1 max-h-[42vh] overflow-y-auto pr-1 text-xs">
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={(e) => {
                e.preventDefault();
                const target = document.getElementById(heading.id);
                if (target) {
                  const y =
                    target.getBoundingClientRect().top + window.scrollY - 110;
                  window.scrollTo({ top: y, behavior: "smooth" });
                  history.pushState(null, "", `#${heading.id}`);
                  setActiveId(heading.id);
                  onNavigate?.();
                }
              }}
              className={cn(
                "group flex items-start gap-2 rounded-lg py-1.5 px-2 transition-colors",
                heading.level === 3 ? "pl-5 text-[11px]" : "font-medium",
                isActive
                  ? "bg-[#0ac5b2]/10 text-[#0ac5b2] font-semibold"
                  : "text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full mt-1.5 shrink-0 transition-colors",
                  isActive
                    ? "bg-[#0ac5b2]"
                    : "bg-neutral-300 dark:bg-neutral-700 group-hover:bg-neutral-400",
                )}
              />
              <span className="line-clamp-2 leading-relaxed">
                {heading.text}
              </span>
            </a>
          );
        })}
      </nav>
    </div>
  );
}
