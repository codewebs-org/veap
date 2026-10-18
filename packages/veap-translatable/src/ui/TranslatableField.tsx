/** biome-ignore-all lint/a11y/useKeyWithClickEvents: TODO: comment */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: TODO: comment */
"use client";

import { Badge, Button, cn, Icon, Input, Textarea } from "@veap/ui";
import * as React from "react";

export type TranslatableFieldType = "text" | "textarea" | "richtext";

export interface TranslatableFieldProps {
  label?: string;
  type?: TranslatableFieldType;
  // Dictionary of locale -> value, e.g. { pl: "Tytuł", en: "Title" }
  value?: Record<string, string>;
  onChange?: (value: Record<string, string>) => void;
  locales?: string[];
  currentLocale?: string;
  onLocaleChange?: (locale: string) => void;
  placeholder?: string | Record<string, string>;
  description?: string;
  disabled?: boolean;
  className?: string;
  rows?: number;
  inputClassName?: string;
}

const DEFAULT_LOCALES = ["pl", "en"];
const LOCALE_FLAGS: Record<string, string> = {
  pl: "🇵🇱",
  en: "🇬🇧",
  de: "🇩🇪",
  fr: "🇫🇷",
  es: "🇪🇸",
};

export function TranslatableField({
  label,
  type = "text",
  value = {},
  onChange,
  locales = DEFAULT_LOCALES,
  currentLocale: controlledLocale,
  onLocaleChange,
  placeholder,
  description,
  disabled = false,
  className,
  rows = 3,
  inputClassName,
}: TranslatableFieldProps) {
  const [internalLocale, setInternalLocale] = React.useState(
    locales[0] || "pl",
  );
  const activeLocale = controlledLocale || internalLocale;

  const handleLocaleChange = (newLocale: string) => {
    if (onLocaleChange) {
      onLocaleChange(newLocale);
    } else {
      setInternalLocale(newLocale);
    }
  };

  const handleValueChange = (newText: string) => {
    onChange?.({
      ...value,
      [activeLocale]: newText,
    });
  };

  const activeValue = value[activeLocale] ?? "";

  const getPlaceholder = (): string => {
    if (!placeholder) return "";
    if (typeof placeholder === "string") return placeholder;
    return placeholder[activeLocale] || "";
  };

  return (
    <div className={cn("w-full space-y-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        {label && (
          <label className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
            <span>{label}</span>
            <Badge
              variant="outline"
              className="text-muted-foreground border-border/80 h-4 rounded px-1.5 py-0 font-mono text-[10px] uppercase"
            >
              {LOCALE_FLAGS[activeLocale]} {activeLocale}
            </Badge>
          </label>
        )}

        {/* Locale tabs */}
        <div className="bg-muted/40 border-border/50 ml-auto flex items-center gap-1 rounded-lg border p-0.5">
          {locales.map((loc) => {
            const isActive = loc === activeLocale;
            const hasContent = Boolean(value[loc]?.trim());

            return (
              <button
                key={loc}
                type="button"
                disabled={disabled}
                onClick={() => handleLocaleChange(loc)}
                className={cn(
                  "flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium transition-all",
                  isActive
                    ? "bg-background text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span>{loc.toUpperCase()}</span>
                <span
                  className={cn(
                    "size-1 rounded-full",
                    hasContent ? "bg-emerald-500" : "bg-muted-foreground/30",
                  )}
                />
              </button>
            );
          })}
        </div>
      </div>

      {type === "textarea" || type === "richtext" ? (
        <Textarea
          value={activeValue}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={disabled}
          rows={rows}
          className={cn("text-xs leading-relaxed", inputClassName)}
        />
      ) : (
        <Input
          type="text"
          value={activeValue}
          onChange={(e) => handleValueChange(e.target.value)}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className={cn("h-9 text-xs", inputClassName)}
        />
      )}

      {description && (
        <p className="text-muted-foreground text-[11px]">{description}</p>
      )}
    </div>
  );
}
