"use client";

import Link from "next/link";
import { useState } from "react";
import { LEGAL_DOCS_CONFIG, type LegalDoc } from "@/lib/legal-config";
import { cn } from "@/lib/utils";
import { LegalDocIconComponent } from "./icons";

interface LegalMobileDrawerProps {
  doc: LegalDoc;
}

export default function LegalMobileDrawer({ doc }: LegalMobileDrawerProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"toc" | "docs">("toc");

  return (
    <div className="lg:hidden mb-6">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-2xl border border-black/[0.06] bg-white/90 p-3.5 text-xs font-semibold text-neutral-800 shadow-xs dark:border-white/[0.08] dark:bg-[#121212]/90 dark:text-neutral-200 backdrop-blur-xs"
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      >
        <span className="flex items-center gap-2.5 truncate">
          <LegalDocIconComponent
            icon={doc.meta.icon}
            className="size-4 text-[#0ac5b2] shrink-0"
          />
          <span className="truncate">{doc.title}</span>
          <span className="text-[10px] text-muted-foreground/80 font-normal">
            ({doc.headings.length} sections)
          </span>
        </span>
        <span className="flex items-center gap-1 text-[11px] font-medium text-[#0ac5b2]">
          {open ? "Hide Outline" : "View Outline"}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={cn(
              "size-3.5 transition-transform",
              open && "rotate-180",
            )}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {open && (
        <div
          className="mt-2 rounded-2xl border border-black/[0.06] bg-white p-4 shadow-lg dark:border-white/[0.08] dark:bg-[#121212]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          {/* Tabs for switching between Outline and Documents */}
          <div className="mb-3 flex items-center gap-1 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900">
            <button
              type="button"
              onClick={() => setTab("toc")}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-center text-xs font-medium transition-colors",
                tab === "toc"
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                  : "text-muted-foreground hover:text-neutral-900 dark:hover:text-white",
              )}
            >
              On This Page ({doc.headings.length})
            </button>
            <button
              type="button"
              onClick={() => setTab("docs")}
              className={cn(
                "flex-1 rounded-lg py-1.5 text-center text-xs font-medium transition-colors",
                tab === "docs"
                  ? "bg-white text-neutral-900 shadow-xs dark:bg-neutral-800 dark:text-white"
                  : "text-muted-foreground hover:text-neutral-900 dark:hover:text-white",
              )}
            >
              Other Legal Docs ({LEGAL_DOCS_CONFIG.length})
            </button>
          </div>

          {tab === "toc" ? (
            <nav className="flex max-h-64 flex-col gap-1 overflow-y-auto pr-1 text-xs">
              {doc.headings.map((h) => (
                <a
                  key={h.id}
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(false);
                    const el = document.getElementById(h.id);
                    if (el) {
                      const y =
                        el.getBoundingClientRect().top + window.scrollY - 110;
                      window.scrollTo({ top: y, behavior: "smooth" });
                      history.pushState(null, "", `#${h.id}`);
                    }
                  }}
                  className={cn(
                    "flex items-start gap-2 rounded-lg py-1.5 px-2 text-neutral-600 hover:bg-black/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.05]",
                    h.level === 3 && "pl-5 text-[11px]",
                  )}
                >
                  <span className="size-1.5 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{h.text}</span>
                </a>
              ))}
            </nav>
          ) : (
            <nav className="flex flex-col gap-1">
              {LEGAL_DOCS_CONFIG.map((item) => {
                const isActive = item.slug === doc.slug;
                return (
                  <Link
                    key={item.slug}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors",
                      isActive
                        ? "bg-[#0ac5b2]/10 font-semibold text-[#0ac5b2]"
                        : "text-neutral-600 hover:bg-black/[0.04] dark:text-neutral-400 dark:hover:bg-white/[0.05]",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <LegalDocIconComponent
                        icon={item.icon}
                        className="size-3.5"
                      />
                      <span>{item.title}</span>
                    </span>
                    {isActive && (
                      <span className="size-1.5 rounded-full bg-[#0ac5b2]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      )}
    </div>
  );
}
