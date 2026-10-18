/** biome-ignore-all lint/a11y/useKeyWithClickEvents: TODO: comment */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: TODO: comment */
"use client";

import { Badge, Button, cn, Icon } from "@veap/ui";
import * as React from "react";

export interface CategoryItem {
  id: string;
  name: string;
  parentId?: string | null;
  children?: CategoryItem[];
}

export interface CategoryTreeSelectProps {
  categories: CategoryItem[];
  value?: string[]; // category IDs
  onChange?: (categoryIds: string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CategoryTreeSelect({
  categories = [],
  value = [],
  onChange,
  multiple = true,
  placeholder = "Wybierz kategorię...",
  disabled = false,
  className,
}: CategoryTreeSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [expandedIds, setExpandedIds] = React.useState<Record<string, boolean>>(
    {},
  );
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Flatten map of all categories for quick lookup
  const categoryMap = React.useMemo(() => {
    const map = new Map<string, CategoryItem>();
    const walk = (items: CategoryItem[]) => {
      for (const item of items) {
        map.set(item.id, item);
        if (item.children) {
          walk(item.children);
        }
      }
    };
    walk(categories);
    return map;
  }, [categories]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelect = (id: string) => {
    if (disabled) return;
    if (multiple) {
      const exists = value.includes(id);
      const next = exists ? value.filter((x) => x !== id) : [...value, id];
      onChange?.(next);
    } else {
      const exists = value.includes(id);
      onChange?.(exists ? [] : [id]);
      setIsOpen(false);
    }
  };

  const removeValue = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;
    onChange?.(value.filter((x) => x !== id));
  };

  const renderTree = (items: CategoryItem[], level = 0) => {
    return items.map((cat) => {
      const isSelected = value.includes(cat.id);
      const hasChildren = cat.children && cat.children.length > 0;
      const isExpanded = expandedIds[cat.id] ?? true; // expanded by default

      return (
        <div key={cat.id} className="flex flex-col">
          <div
            onClick={() => handleSelect(cat.id)}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
            className={cn(
              "hover:bg-accent hover:text-accent-foreground flex cursor-pointer items-center justify-between rounded-lg py-1.5 pr-2 text-xs transition-colors",
              isSelected && "bg-primary/10 text-primary font-medium",
            )}
          >
            <div className="flex min-w-0 flex-1 items-center gap-1.5">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={(e) => toggleExpand(cat.id, e)}
                  className="text-muted-foreground hover:text-foreground inline-flex size-4 items-center justify-center rounded p-0.5"
                >
                  <Icon
                    icon={
                      isExpanded
                        ? "solar:alt-arrow-down-linear"
                        : "solar:alt-arrow-right-linear"
                    }
                    className="size-3"
                  />
                </button>
              ) : (
                <span className="size-4 shrink-0" />
              )}
              <span className="truncate">{cat.name}</span>
            </div>

            {isSelected && (
              <Icon
                icon="solar:check-read-linear"
                className="text-primary size-3.5 shrink-0"
              />
            )}
          </div>

          {hasChildren && isExpanded && (
            <div className="flex flex-col">
              {renderTree(cat.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={cn(
          "border-input bg-background flex min-h-10 w-full cursor-pointer flex-wrap items-center gap-1.5 rounded-xl border px-3 py-2 text-sm shadow-2xs transition-colors",
          isOpen && "border-ring ring-ring/20 ring-3",
          disabled && "bg-muted/30 cursor-not-allowed opacity-50",
        )}
      >
        {value.length === 0 ? (
          <span className="text-muted-foreground text-xs">{placeholder}</span>
        ) : (
          value.map((id) => {
            const cat = categoryMap.get(id);
            const label = cat ? cat.name : id;
            return (
              <Badge
                key={id}
                variant="secondary"
                className="bg-muted/80 text-foreground gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
              >
                <span>{label}</span>
                {!disabled && (
                  <button
                    type="button"
                    onClick={(e) => removeValue(id, e)}
                    className="hover:bg-foreground/10 text-muted-foreground hover:text-foreground ml-0.5 inline-flex size-3.5 items-center justify-center rounded-full transition-colors"
                  >
                    <Icon icon="solar:close-circle-bold" className="size-3" />
                  </button>
                )}
              </Badge>
            );
          })
        )}
      </div>

      {isOpen && !disabled && (
        <div className="border-border bg-popover animate-in fade-in-0 zoom-in-95 absolute top-full left-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border p-1 shadow-md">
          {categories.length === 0 ? (
            <div className="text-muted-foreground py-3 text-center text-xs">
              Brak dostępnych kategorii
            </div>
          ) : (
            renderTree(categories)
          )}
        </div>
      )}
    </div>
  );
}
