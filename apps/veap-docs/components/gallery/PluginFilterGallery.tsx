"use client";

import { useMemo, useState } from "react";
import PluginCard from "@/components/gallery/PluginCard";
import type { PluginCategory, PluginSection, VeapPlugin } from "@/lib/plugins";
import { cn } from "@/lib/utils";

type FilterTab = "all" | "featured" | "new" | PluginCategory;

export default function PluginFilterGallery({
  sections,
  allPlugins,
}: {
  sections: PluginSection[];
  allPlugins: VeapPlugin[];
}) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [search, setSearch] = useState("");

  const featuredCount = useMemo(
    () => allPlugins.filter((p) => p.featured).length,
    [allPlugins],
  );

  const newCount = useMemo(
    () => allPlugins.filter((p) => p.isNew).length,
    [allPlugins],
  );

  // Filtered view logic
  const filteredContent = useMemo(() => {
    const q = search.trim().toLowerCase();

    // If searching, search globally
    if (q) {
      const matched = allPlugins.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.package.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q),
      );

      return {
        isSearch: true,
        items: matched,
      };
    }

    // Tab-based view
    if (activeTab === "all") {
      return {
        isSearch: false,
        sections,
      };
    }

    if (activeTab === "featured") {
      return {
        isSearch: true,
        title: "Featured Plugins & Modules",
        items: allPlugins.filter((p) => p.featured),
      };
    }

    if (activeTab === "new") {
      return {
        isSearch: true,
        title: "New Releases",
        items: allPlugins.filter((p) => p.isNew),
      };
    }

    // Specific category
    const catSection = sections.find((s) => s.id === activeTab);
    return {
      isSearch: true,
      title: catSection?.label || activeTab,
      items: catSection ? catSection.items : [],
    };
  }, [search, activeTab, allPlugins, sections]);

  return (
    <div className="w-full">
      {/* Search and Filter Controls */}
      <div className="flex flex-col gap-4 border-b border-black/[0.05] pb-6 dark:border-white/[0.08]">
        {/* Search Bar */}
        <div className="relative w-full max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted-foreground">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plugins by name, package, or description..."
            className="h-10 w-full rounded-2xl border border-black/[0.08] bg-white pl-10 pr-4 font-runde text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-[#0ac5b2] focus:outline-none focus:ring-1 focus:ring-[#0ac5b2] dark:border-neutral-800 dark:bg-[#121212] dark:text-white dark:placeholder:text-neutral-600"
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 font-mono text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {/* All */}
          <button
            onClick={() => {
              setActiveTab("all");
              setSearch("");
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-runde text-xs font-medium transition-colors",
              activeTab === "all" && !search
                ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
                : "bg-black/[0.04] text-neutral-600 hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-neutral-300 dark:hover:bg-white/[0.1]",
            )}
          >
            All
            <span className="text-[10px] opacity-70">
              ({allPlugins.length})
            </span>
          </button>

          {/* Featured */}
          <button
            onClick={() => {
              setActiveTab("featured");
              setSearch("");
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-runde text-xs font-medium transition-colors",
              activeTab === "featured" && !search
                ? "bg-[#0ac5b2] text-white"
                : "bg-black/[0.04] text-neutral-600 hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-neutral-300 dark:hover:bg-white/[0.1]",
            )}
          >
            Featured
            <span className="text-[10px] opacity-70">({featuredCount})</span>
          </button>

          {/* New */}
          <button
            onClick={() => {
              setActiveTab("new");
              setSearch("");
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-runde text-xs font-medium transition-colors",
              activeTab === "new" && !search
                ? "bg-[#0ac5b2] text-white"
                : "bg-black/[0.04] text-neutral-600 hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-neutral-300 dark:hover:bg-white/[0.1]",
            )}
          >
            New
            <span className="text-[10px] opacity-70">({newCount})</span>
          </button>

          {/* Divider */}
          <span className="h-4 w-px bg-neutral-300 dark:bg-neutral-800" />

          {/* Categories */}
          {sections.map((sec) => {
            const isSelected = activeTab === sec.id && !search;
            return (
              <button
                key={sec.id}
                onClick={() => {
                  setActiveTab(sec.id as PluginCategory);
                  setSearch("");
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-runde text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950"
                    : "bg-black/[0.04] text-neutral-600 hover:bg-black/[0.08] dark:bg-white/[0.06] dark:text-neutral-300 dark:hover:bg-white/[0.1]",
                )}
              >
                {sec.label}
                <span className="text-[10px] opacity-70">
                  ({sec.items.length})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Render Results */}
      {filteredContent.isSearch ? (
        <section className="mt-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-runde text-lg font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-xl">
              {filteredContent.title || `Search results for "${search}"`}{" "}
              <span className="text-muted-foreground">
                <span className="text-[#0ac5b2]">[</span>
                {filteredContent.items?.length || 0}
                <span className="text-[#0ac5b2]">]</span>
              </span>
            </h2>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-xs text-[#0ac5b2] hover:underline"
              >
                Reset search
              </button>
            )}
          </div>

          {filteredContent.items && filteredContent.items.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredContent.items.map((item) => (
                <PluginCard key={item.href} item={item} />
              ))}
            </div>
          ) : (
            <div className="mt-12 flex flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 p-12 text-center dark:border-neutral-800">
              <p className="font-runde text-base font-semibold text-neutral-800 dark:text-neutral-200">
                No plugins found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try refining your search term or select &quot;All&quot; to see
                all plugins.
              </p>
            </div>
          )}
        </section>
      ) : (
        /* Render Sections Grouped strictly by category with NO duplicates */
        <div className="flex flex-col">
          {filteredContent.sections?.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="mt-12 scroll-mt-28 first:mt-8"
            >
              <h2 className="font-runde text-lg font-semibold tracking-tight sm:text-xl text-neutral-900 dark:text-white">
                {section.label}{" "}
                <span className="text-muted-foreground">
                  <span className="text-[#0ac5b2]">[</span>
                  {section.items.length}
                  <span className="text-[#0ac5b2]">]</span>
                </span>
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {section.items.map((item) => (
                  <PluginCard key={item.href} item={item} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
