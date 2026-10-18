/** biome-ignore-all lint/a11y/useKeyWithClickEvents: TODO: comment */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: TODO: comment */
"use client";

import { Badge, Button, cn, Icon, Input, Textarea } from "@veap/ui";
import * as React from "react";
import { TranslatableTabs } from "./TranslatableTabs.js";

export type FieldDefinitionType = "text" | "textarea" | "richtext";

export interface TranslatableFieldConfig {
  name: string;
  label: string;
  type?: FieldDefinitionType;
  placeholder?: string;
  description?: string;
  rows?: number;
  inputClassName?: string;
  required?: boolean;
}

export interface TranslatableFormCardProps {
  fields: TranslatableFieldConfig[];
  // Structure: { [locale]: { [fieldName]: string } }
  value?: Record<string, Record<string, any>>;
  onChange?: (value: Record<string, Record<string, any>>) => void;
  locales?: string[];
  defaultLocale?: string;
  title?: string;
  description?: string;
  className?: string;
  disabled?: boolean;
  headerExtra?: React.ReactNode;
  children?: (activeLocale: string) => React.ReactNode;
}

export function TranslatableFormCard({
  fields,
  value = {},
  onChange,
  locales = ["pl", "en"],
  defaultLocale = "pl",
  title = "Wersje językowe",
  description,
  className,
  disabled = false,
  headerExtra,
  children,
}: TranslatableFormCardProps) {
  const [activeLocale, setActiveLocale] = React.useState(defaultLocale);

  // Calculate completion status for each locale
  const completedMap = React.useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const loc of locales) {
      const locData = value[loc] || {};
      // A locale is considered completed if all required fields (or at least first field if none required) are filled
      const requiredFields = fields.filter((f) => f.required);
      const fieldsToCheck =
        requiredFields.length > 0
          ? requiredFields
          : [fields[0]].filter(Boolean);

      map[loc] =
        fieldsToCheck.length > 0 &&
        fieldsToCheck.every((f) => Boolean(locData[f.name]?.toString().trim()));
    }
    return map;
  }, [value, locales, fields]);

  const handleFieldChange = (fieldName: string, text: string) => {
    const currentLocData = value[activeLocale] || {};
    const nextLocData = {
      ...currentLocData,
      [fieldName]: text,
    };

    onChange?.({
      ...value,
      [activeLocale]: nextLocData,
    });
  };

  const activeLocaleData = value[activeLocale] || {};

  return (
    <div
      className={cn(
        "border-border/60 bg-card space-y-5 rounded-2xl border p-5 shadow-xs",
        className,
      )}
    >
      <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-foreground flex items-center gap-2 text-sm font-bold">
            <Icon
              icon="solar:global-bold-duotone"
              className="text-primary size-4"
            />
            <span>{title}</span>
          </h3>
          {description && (
            <p className="text-muted-foreground mt-0.5 text-xs">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {headerExtra}
          <TranslatableTabs
            locales={locales}
            activeLocale={activeLocale}
            onChange={setActiveLocale}
            completedMap={completedMap}
          />
        </div>
      </div>

      <div className="space-y-4">
        {fields.map((field) => {
          const fieldValue = activeLocaleData[field.name] ?? "";

          return (
            <div key={field.name} className="space-y-1.5">
              <label className="text-foreground flex items-center justify-between text-xs font-semibold">
                <span>{field.label}</span>
                {field.required && (
                  <span className="text-destructive text-xs">*</span>
                )}
              </label>

              {field.type === "textarea" || field.type === "richtext" ? (
                <Textarea
                  value={fieldValue}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  placeholder={field.placeholder}
                  disabled={disabled}
                  rows={field.rows || 3}
                  className={cn(
                    "text-xs leading-relaxed",
                    field.inputClassName,
                  )}
                />
              ) : (
                <Input
                  type="text"
                  value={fieldValue}
                  onChange={(e) =>
                    handleFieldChange(field.name, e.target.value)
                  }
                  placeholder={field.placeholder}
                  disabled={disabled}
                  className={cn("h-9 text-xs", field.inputClassName)}
                />
              )}

              {field.description && (
                <p className="text-muted-foreground text-[11px]">
                  {field.description}
                </p>
              )}
            </div>
          );
        })}

        {/* Custom render prop for extra inputs tied to activeLocale */}
        {children && children(activeLocale)}
      </div>
    </div>
  );
}
