"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { GithubLogo } from "@/components/logos";
import {
  countDocItems,
  countDocLeaves,
  type DocItem,
  type DocSection,
  filterDocItems,
} from "@/lib/docs-data";
import { cn } from "@/lib/utils";

export interface DocsSidebarProps {
  /** Navigation tree generated from the docs `meta.json` files. */
  sections: DocSection[];
  className?: string;
  onNavigate?: () => void;
  isMobile?: boolean;
}

/** Whether the item itself or one of its children is the current page. */
function containsPath(item: DocItem, pathname: string): boolean {
  if (item.href === pathname) return true;
  return item.children?.some((child) => containsPath(child, pathname)) ?? false;
}

export default function DocsSidebar({
  sections,
  className,
  onNavigate,
  isMobile = false,
}: DocsSidebarProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const activeItemRef = useRef<HTMLAnchorElement | null>(null);
  const sidebarContainerRef = useRef<HTMLDivElement | null>(null);

  const isFiltering = query.trim().length > 0;

  // Filter sections based on search query
  const filteredSections = useMemo(() => {
    if (!isFiltering) return sections;
    const q = query.toLowerCase().trim();

    return sections.flatMap((section) => {
      if (section.items.length === 0) {
        const matchesSection =
          section.title.toLowerCase().includes(q) ||
          (section.href ?? "").toLowerCase().includes(q);
        return matchesSection ? [section] : [];
      }

      const items = filterDocItems(section.items, query);
      return items.length > 0 ? [{ ...section, items }] : [];
    });
  }, [sections, query, isFiltering]);

  // Determine which section contains the currently active page
  const activeSectionId = useMemo(() => {
    const match = sections.find((section) =>
      section.items.some((item) => containsPath(item, pathname)),
    );
    return match?.id ?? sections[0]?.id ?? "";
  }, [pathname, sections]);

  // Keep track of user-toggled open/close state
  const [userToggledSections, setUserToggledSections] = useState<
    Record<string, boolean>
  >({});
  const [userToggledGroups, setUserToggledGroups] = useState<
    Record<string, boolean>
  >({});

  // Auto-scroll the active item into view on route change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeItemRef.current) {
        activeItemRef.current.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [pathname]);

  const matchCount = useMemo(
    () =>
      filteredSections.reduce((acc, sec) => acc + countDocLeaves(sec.items), 0),
    [filteredSections],
  );

  const toggleSection = (id: string, currentIsOpen: boolean) => {
    setUserToggledSections((prev) => ({ ...prev, [id]: !currentIsOpen }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    const groups: Record<string, boolean> = {};
    for (const sec of sections) {
      allOpen[sec.id] = true;
      for (const item of sec.items) groups[item.slug] = true;
    }
    setUserToggledSections(allOpen);
    setUserToggledGroups(groups);
  };

  const collapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    for (const sec of sections) {
      allClosed[sec.id] = false;
    }
    setUserToggledSections(allClosed);
    setUserToggledGroups({});
  };

  const renderItem = (item: DocItem, depth: number): React.ReactNode => {
    const hasChildren = (item.children?.length ?? 0) > 0;

    if (!hasChildren) {
      const isActive = item.href === pathname;
      if (!item.href) return null;

      return (
        <li key={item.slug}>
          <Link
            ref={isActive ? activeItemRef : undefined}
            data-active={isActive ? "true" : undefined}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors",
              isActive
                ? "bg-[#0ac5b2]/10 font-semibold text-[#0ac5b2] dark:bg-[#0ac5b2]/15"
                : "text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white",
            )}
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          >
            <span className="truncate">{item.title}</span>
            {isActive && (
              <span className="ml-1.5 size-1.5 shrink-0 rounded-full bg-[#0ac5b2]" />
            )}
          </Link>
        </li>
      );
    }

    const hasActiveItem = containsPath(item, pathname);
    const isOpen =
      isFiltering || (userToggledGroups[item.slug] ?? hasActiveItem);

    return (
      <li key={item.slug} className="flex flex-col">
        <button
          type="button"
          onClick={() =>
            setUserToggledGroups((prev) => ({ ...prev, [item.slug]: !isOpen }))
          }
          className={cn(
            "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors",
            hasActiveItem
              ? "font-semibold text-[#0ac5b2]"
              : "text-neutral-600 hover:bg-black/[0.04] hover:text-neutral-950 dark:text-neutral-400 dark:hover:bg-white/[0.05] dark:hover:text-white",
          )}
          style={{ cornerShape: "squircle" } as React.CSSProperties}
          aria-expanded={isOpen}
          aria-label={`${isOpen ? "Collapse" : "Expand"} ${item.title}`}
        >
          <span className="flex min-w-0 items-center gap-1.5 truncate">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={cn(
                "size-3 shrink-0 opacity-60 transition-transform duration-200",
                isOpen && "rotate-90",
              )}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
            <span className="truncate">{item.title}</span>
          </span>
          <span className="ml-1.5 shrink-0 font-mono text-[10px] text-muted-foreground/80">
            {countDocItems(item.children ?? [])}
          </span>
        </button>

        {isOpen && (
          <ul
            className={cn(
              "my-0.5 flex flex-col gap-0.5 border-l border-black/[0.06] dark:border-white/[0.08]",
              depth === 0 ? "ml-4 pl-2" : "ml-3 pl-2",
            )}
          >
            {item.children?.map((child) => renderItem(child, depth + 1))}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div
      ref={sidebarContainerRef}
      className={cn(
        isMobile
          ? "flex flex-col  gap-4 text-xs"
          : "sticky top-8 flex flex-col gap-4 max-h-[calc(100vh-6rem)]  pr-2 pb-8 text-xs",
        className,
      )}
    >
      {/* Search & Navigation Card */}
      <div
        className="relative min-h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] overflow-y-auto  rounded-2xl border border-black/[0.06] bg-[#F5F5F7]/80 p-3.5 sm:p-4 dark:border-white/[0.07] dark:bg-[#121212]/80 backdrop-blur-xs shadow-xs"
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      >
        {/* Header & Section stats */}
        <div className="mb-2.5 flex items-center justify-between px-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Documentation
          </span>
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
            <button
              type="button"
              onClick={expandAll}
              className="hover:text-[#0ac5b2] transition-colors"
            >
              Expand all
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={collapseAll}
              className="hover:text-[#0ac5b2] transition-colors"
            >
              Collapse
            </button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="relative mb-3">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-3.5 opacity-70"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            placeholder="Filter topics..."
            className="h-9 w-full rounded-xl border border-black/[0.06] bg-white pl-8 pr-7 font-runde text-xs text-neutral-900 placeholder:text-neutral-400 focus:border-[#0ac5b2] focus:outline-none dark:border-white/[0.08] dark:bg-black/40 dark:text-white"
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              &times;
            </button>
          )}
        </div>

        {/* Filter results info */}
        {isFiltering && (
          <div className="mb-3 flex items-center justify-between px-1 text-[11px] text-muted-foreground">
            <span>
              {matchCount} {matchCount === 1 ? "topic" : "topics"} found
            </span>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-[#0ac5b2] hover:underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Accordion Sections List (No inner scroll container - whole sidebar scrolls smoothly) */}
        <nav className="flex-col gap-1.5">
          {filteredSections.map((section: DocSection) => {
            // When filtering, always expand matching sections; otherwise default to active section open
            const isSectionOpen =
              isFiltering ||
              (userToggledSections[section.id] ??
                section.id === activeSectionId);

            // Pages a folder cannot contain are rendered as standalone links
            if (section.items.length === 0) {
              const isActive = section.href === pathname;
              if (!section.href) return null;

              return (
                <Link
                  key={section.id}
                  ref={isActive ? activeItemRef : undefined}
                  href={section.href}
                  onClick={onNavigate}
                  className={cn(
                    "mb-1 flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-all",
                    isActive
                      ? "text-[#0ac5b2] bg-[#0ac5b2]/5"
                      : "text-neutral-700 hover:bg-black/[0.03] dark:text-neutral-300 dark:hover:bg-white/[0.04]",
                  )}
                  style={{ cornerShape: "squircle" } as React.CSSProperties}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="size-3 shrink-0 text-muted-foreground"
                  >
                    <path d="M3 12h18" />
                  </svg>
                  <span className="truncate">{section.title}</span>
                </Link>
              );
            }

            const hasActiveItem = section.items.some((item) =>
              containsPath(item, pathname),
            );

            return (
              <div
                key={section.id}
                className="flex flex-col rounded-xl transition-colors"
              >
                {/* Accordion Header Button */}
                <button
                  type="button"
                  onClick={() => toggleSection(section.id, isSectionOpen)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs font-semibold transition-all",
                    hasActiveItem
                      ? "text-[#0ac5b2] bg-[#0ac5b2]/5"
                      : "text-neutral-700 hover:bg-black/[0.03] dark:text-neutral-300 dark:hover:bg-white/[0.04]",
                  )}
                  style={{ cornerShape: "squircle" } as React.CSSProperties}
                  aria-expanded={isSectionOpen}
                >
                  <span className="flex items-center gap-2 truncate">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      className={cn(
                        "size-3 shrink-0 text-muted-foreground transition-transform duration-200",
                        isSectionOpen && "rotate-90 text-[#0ac5b2]",
                      )}
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="truncate">{section.title}</span>
                  </span>

                  <span className="ml-1.5 shrink-0 rounded-md bg-neutral-200/60 px-1.5 py-0.5 font-mono text-[10px] text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                    {countDocItems(section.items)}
                  </span>
                </button>

                {/* Section Items (Collapsible body) */}
                {isSectionOpen && (
                  <ul className="ml-3 my-1 flex flex-col gap-0.5 border-l border-black/[0.06] pl-2 dark:border-white/[0.08]">
                    {section.items.map((item) => renderItem(item, 0))}
                  </ul>
                )}
              </div>
            );
          })}

          {filteredSections.length === 0 && (
            <div className="py-6 text-center text-xs text-muted-foreground">
              <p>No documentation topics match &ldquo;{query}&rdquo;.</p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-2 text-xs font-medium text-[#0ac5b2] hover:underline"
              >
                Clear search filter
              </button>
            </div>
          )}
        </nav>
      </div>

      {/* Subtle Bottom Metadata */}
      <div className="mt-4 pt-3 flex items-center justify-between px-1 text-[10px] text-muted-foreground">
        <span>Veap • Early Access</span>
        <a
          href="https://github.com/veapjs/veap"
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground inline-flex items-center gap-1 transition-colors"
        >
          <GithubLogo className="size-3" />
          <span>GitHub</span>
        </a>
      </div>
    </div>
  );
}
