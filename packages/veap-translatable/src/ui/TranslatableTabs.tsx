/** biome-ignore-all lint/a11y/useKeyWithClickEvents: TODO: comment */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: TODO: comment */
"use client";

import { Button, cn } from "@veap/ui";
import * as React from "react";

export interface LocaleOption {
  code: string;
  label: string;
  flag?: string;
}

export interface TranslatableTabsProps {
  locales: (string | LocaleOption)[];
  activeLocale: string;
  onChange: (locale: string) => void;
  // Map of locale -> boolean whether data for this locale is filled
  completedMap?: Record<string, boolean>;
  className?: string;
  size?: "sm" | "md";
}

const DEFAULT_LABELS: Record<string, { label: string; flag?: string }> = {
  pl: { label: "Polski", flag: "🇵🇱" },
  en: { label: "English", flag: "🇬🇧" },
  de: { label: "Deutsch", flag: "🇩🇪" },
  fr: { label: "Français", flag: "🇫🇷" },
  es: { label: "Español", flag: "🇪🇸" },
  it: { label: "Italiano", flag: "🇮🇹" },
  ua: { label: "Українська", flag: "🇺🇦" },
};

export function TranslatableTabs({
  locales,
  activeLocale,
  onChange,
  completedMap = {},
  className,
  size = "sm",
}: TranslatableTabsProps) {
  const normalizedLocales: LocaleOption[] = React.useMemo(() => {
    return locales.map((item) => {
      if (typeof item === "string") {
        const info = DEFAULT_LABELS[item.toLowerCase()];
        return {
          code: item,
          label: info
            ? `${info.label} (${item.toUpperCase()})`
            : item.toUpperCase(),
          flag: info?.flag,
        };
      }
      return item;
    });
  }, [locales]);

  return (
    <div
      className={cn(
        "bg-muted/40 border-border/50 flex w-fit items-center gap-1 rounded-xl border p-1",
        className,
      )}
    >
      {normalizedLocales.map((loc) => {
        const isActive = activeLocale.toLowerCase() === loc.code.toLowerCase();
        const isCompleted =
          completedMap[loc.code] ?? completedMap[loc.code.toLowerCase()];

        return (
          <Button
            key={loc.code}
            type="button"
            variant={isActive ? "secondary" : "ghost"}
            size={size === "sm" ? "sm" : "default"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onChange(loc.code);
            }}
            className={cn(
              "gap-1.5 rounded-lg text-xs transition-all",
              size === "sm" ? "h-7 px-2.5 text-xs" : "h-9 px-3 text-sm",
              isActive &&
                "bg-background text-foreground font-semibold shadow-2xs",
              !isActive && "text-muted-foreground hover:text-foreground",
            )}
          >
            {loc.flag && (
              <span className="text-sm leading-none">{loc.flag}</span>
            )}
            <span>{loc.label}</span>
            {completedMap && typeof isCompleted === "boolean" && (
              <span
                className={cn(
                  "size-1.5 rounded-full transition-colors",
                  isCompleted ? "bg-emerald-500" : "bg-muted-foreground/30",
                )}
                title={isCompleted ? "Wypełnione" : "Puste"}
              />
            )}
          </Button>
        );
      })}
    </div>
  );
}
