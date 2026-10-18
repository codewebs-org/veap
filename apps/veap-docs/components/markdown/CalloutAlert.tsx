import React from "react";
import { cn } from "@/lib/utils";

export type CalloutType = "NOTE" | "TIP" | "IMPORTANT" | "WARNING" | "CAUTION";

export const CALLOUT_CONFIG: Record<
  CalloutType,
  {
    label: string;
    border: string;
    bg: string;
    text: string;
    icon: React.ReactNode;
  }
> = {
  NOTE: {
    label: "Note",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  TIP: {
    label: "Tip",
    border: "border-emerald-500/30",
    bg: "bg-emerald-500/5 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-5"
      >
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
  IMPORTANT: {
    label: "Important",
    border: "border-[#0ac5b2]/40",
    bg: "bg-[#0ac5b2]/5 dark:bg-[#0ac5b2]/10",
    text: "text-[#0ac5b2]",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-5"
      >
        <polygon points="12 2 2 22 22 22" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  WARNING: {
    label: "Warning",
    border: "border-amber-500/30",
    bg: "bg-amber-500/5 dark:bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-5"
      >
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  CAUTION: {
    label: "Caution",
    border: "border-rose-500/30",
    bg: "bg-rose-500/5 dark:bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="size-5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
};

interface CalloutAlertProps {
  type: CalloutType;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export default function CalloutAlert({
  type,
  title,
  children,
  className,
}: CalloutAlertProps) {
  const config = CALLOUT_CONFIG[type] || CALLOUT_CONFIG.NOTE;

  return (
    <div
      className={cn(
        "my-4 flex items-start gap-3 rounded-2xl border p-4 text-sm leading-relaxed",
        config.border,
        config.bg,
        className,
      )}
      style={{ cornerShape: "squircle" } as React.CSSProperties}
    >
      <div className={cn("mt-0.5 shrink-0", config.text)}>{config.icon}</div>
      <div className="flex min-w-0 flex-col gap-1">
        <span className={cn("font-runde font-semibold", config.text)}>
          {title || config.label}
        </span>
        <div className="text-neutral-700 dark:text-neutral-300">{children}</div>
      </div>
    </div>
  );
}
