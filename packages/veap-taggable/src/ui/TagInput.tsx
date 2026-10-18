/** biome-ignore-all lint/a11y/useKeyWithClickEvents: TODO: comment */
/** biome-ignore-all lint/suspicious/noArrayIndexKey: TODO: comment */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: TODO: comment */
"use client";

import { Badge, cn, Icon } from "@veap/ui";
import * as React from "react";

export interface TagItem {
  id?: string;
  name: string;
}

export interface TagInputProps {
  value?: (string | TagItem)[];
  onChange?: (tags: string[]) => void;
  availableTags?: (string | TagItem)[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  maxTags?: number;
}

function getTagName(tag: string | TagItem): string {
  return typeof tag === "string" ? tag : tag.name;
}

export function TagInput({
  value = [],
  onChange,
  availableTags = [],
  placeholder = "Add a tag...",
  disabled = false,
  className,
  maxTags,
}: TagInputProps) {
  const [inputValue, setInputValue] = React.useState("");
  const [isOpen, setIsOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const stringValues = React.useMemo(() => {
    return value.map(getTagName).filter(Boolean);
  }, [value]);

  const filteredSuggestions = React.useMemo(() => {
    if (!inputValue.trim()) return [];
    const q = inputValue.toLowerCase().trim();
    return availableTags
      .map(getTagName)
      .filter(
        (name) =>
          name.toLowerCase().includes(q) &&
          !stringValues.some((v) => v.toLowerCase() === name.toLowerCase()),
      );
  }, [availableTags, inputValue, stringValues]);

  const addTag = (tagName: string) => {
    const trimmed = tagName.trim();
    if (!trimmed) return;
    if (maxTags && stringValues.length >= maxTags) return;

    if (!stringValues.some((t) => t.toLowerCase() === trimmed.toLowerCase())) {
      const updated = [...stringValues, trimmed];
      onChange?.(updated);
    }
    setInputValue("");
    setIsOpen(false);
  };

  const removeTag = (index: number) => {
    if (disabled) return;
    const updated = stringValues.filter((_, i) => i !== index);
    onChange?.(updated);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (
      e.key === "Backspace" &&
      !inputValue &&
      stringValues.length > 0
    ) {
      removeTag(stringValues.length - 1);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      <div
        onClick={() => inputRef.current?.focus()}
        className={cn(
          "border-input bg-background flex min-h-10 w-full cursor-text flex-wrap items-center gap-1.5 rounded-xl border px-3 py-2 text-sm shadow-2xs transition-colors",
          "focus-within:border-ring focus-within:ring-ring/20 focus-within:ring-3",
          disabled && "bg-muted/30 cursor-not-allowed opacity-50",
        )}
      >
        {stringValues.map((tag, index) => (
          <Badge
            key={`${tag}-${index}`}
            variant="secondary"
            className="bg-muted/80 hover:bg-muted text-foreground shrink-0 gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
          >
            <span>{tag}</span>
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(index);
                }}
                className="hover:bg-foreground/10 text-muted-foreground hover:text-foreground ml-0.5 inline-flex size-3.5 items-center justify-center rounded-full transition-colors"
              >
                <Icon icon="solar:close-circle-bold" className="size-3" />
                <span className="sr-only">Remove {tag}</span>
              </button>
            )}
          </Badge>
        ))}

        {(!maxTags || stringValues.length < maxTags) && !disabled && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            onKeyDown={handleKeyDown}
            placeholder={stringValues.length === 0 ? placeholder : ""}
            className="text-foreground placeholder:text-muted-foreground min-w-[120px] flex-1 bg-transparent text-xs outline-none"
          />
        )}
      </div>

      {isOpen && filteredSuggestions.length > 0 && (
        <div className="border-border bg-popover animate-in fade-in-0 zoom-in-95 absolute top-full left-0 z-50 mt-1 max-h-48 w-full overflow-auto rounded-xl border p-1 shadow-md">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(suggestion);
              }}
              className="text-foreground hover:bg-accent hover:text-accent-foreground flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors"
            >
              <span>{suggestion}</span>
              <Icon
                icon="solar:add-circle-linear"
                className="text-muted-foreground size-3.5"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
