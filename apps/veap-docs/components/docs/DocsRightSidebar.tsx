"use client";

import React, { useEffect, useMemo, useState } from "react";
import { GithubLogo } from "@/components/logos";
import type { DocPageData } from "@/lib/docs-data";
import { SITE_REPO } from "@/lib/site";
import { cn } from "@/lib/utils";

interface DocsRightSidebarProps {
  doc: DocPageData;
  className?: string;
}

export default function DocsRightSidebar({
  doc,
  className,
}: DocsRightSidebarProps) {
  const [activeId, setActiveId] = useState<string>("");
  const headings = useMemo(() => doc.toc || [], [doc.toc]);

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const gitHubDocUrl = `${SITE_REPO}/blob/main/docs/developer-docs/${doc.file}`;

  return (
    <div
      className={cn(
        "sticky top-8 flex flex-col gap-4 max-h-[calc(100vh-4rem)] overflow-y-auto pr-1 pb-8 text-xs",
        className,
      )}
    >
      {/* On This Page Card */}
      {headings.length > 0 && (
        <div
          className="rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/80 p-4 dark:border-white/[0.07] dark:bg-[#121212]/80 backdrop-blur-xs shadow-xs"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              On This Page
            </span>
            <span className="font-mono text-[10px] text-muted-foreground/60">
              {headings.length} sections
            </span>
          </div>

          <nav className="flex flex-col gap-0.5 max-h-[48vh] overflow-y-auto pr-1">
            {headings.map((h) => {
              const isActive = activeId === h.id;
              return (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(h.id);
                    if (target) {
                      const y =
                        target.getBoundingClientRect().top +
                        window.scrollY -
                        110;
                      window.scrollTo({ top: y, behavior: "smooth" });
                      history.pushState(null, "", `#${h.id}`);
                      setActiveId(h.id);
                    }
                  }}
                  className={cn(
                    "group flex items-start gap-2 rounded-lg py-1.5 px-2 transition-colors",
                    h.level === 3 ? "pl-4 text-[11px]" : "font-medium text-xs",
                    isActive
                      ? "bg-[#0ac5b2]/10 font-semibold text-[#0ac5b2]"
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
                  <span className="line-clamp-2 leading-relaxed">{h.text}</span>
                </a>
              );
            })}
          </nav>

          {/* Quick Back to Top button */}
          <button
            type="button"
            onClick={scrollToTop}
            className="mt-3 flex w-full items-center justify-center gap-1.5 pt-2 text-[11px] font-medium text-muted-foreground transition-colors hover:text-[#0ac5b2] border-t border-black/[0.04] dark:border-white/[0.05]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-3"
            >
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
            <span>Back to top</span>
          </button>
        </div>
      )}

      {/* Community & Page Feedback Card */}
      <div
        className="rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/80 p-4 dark:border-white/[0.07] dark:bg-[#121212]/80 backdrop-blur-xs shadow-xs"
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      >
        <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Contribute & Feedback
        </div>
        <ul className="flex flex-col gap-2">
          <li>
            <a
              href={gitHubDocUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-neutral-600 transition-colors hover:text-[#0ac5b2] dark:text-neutral-400 dark:hover:text-[#0ac5b2]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-3.5 shrink-0 opacity-70"
              >
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span>Edit this page on GitHub</span>
            </a>
          </li>
          <li>
            <a
              href="https://github.com/veapjs/veap/discussions"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-neutral-600 transition-colors hover:text-[#0ac5b2] dark:text-neutral-400 dark:hover:text-[#0ac5b2]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-3.5 shrink-0 opacity-70"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>Ask in Discussions</span>
            </a>
          </li>
          <li>
            <a
              href="https://github.com/veapjs/veap/issues/new"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-xs text-neutral-600 transition-colors hover:text-[#0ac5b2] dark:text-neutral-400 dark:hover:text-[#0ac5b2]"
            >
              <GithubLogo className="size-3.5 shrink-0 opacity-70" />
              <span>Report documentation issue</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
