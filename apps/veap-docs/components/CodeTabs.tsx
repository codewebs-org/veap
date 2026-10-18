"use client";

import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

export interface CodeTab {
  label: string;
  filename: string;
  content: ReactNode;
}

export default function CodeTabs({ tabs }: { tabs: CodeTab[] }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => setActive(index)}
            aria-pressed={active === index}
            className={cn(
              "rounded-full border px-4 py-1.5 font-mono text-xs font-semibold transition-all duration-200",
              active === index
                ? "border-[#0ac5b2]/40 bg-[#0ac5b2]/10 text-[#0ac5b2]"
                : "border-black/[0.08] bg-white/60 text-muted-foreground hover:border-[#0ac5b2]/30 hover:text-neutral-900 dark:border-white/[0.08] dark:bg-white/[0.03] dark:hover:text-white",
            )}
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tabs.map((tab, index) => (
          <div
            key={tab.label}
            className={index === active ? "block" : "hidden"}
            aria-hidden={index !== active}
          >
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  );
}
