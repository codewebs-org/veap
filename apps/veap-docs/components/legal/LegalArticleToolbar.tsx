"use client";

import CopyButton from "@/components/CopyButton";
import { SITE_REPO, SITE_URL } from "@/lib/site";
import { ExternalLinkIcon } from "./icons";

interface LegalArticleToolbarProps {
  slug: string;
  updated: string;
}

export default function LegalArticleToolbar({
  slug,
  updated,
}: LegalArticleToolbarProps) {
  const currentUrl = `${SITE_URL}/${slug}`;
  const githubFileUrl = `${SITE_REPO || "https://github.com/veapjs/veap"}/blob/main/examples/veap-website/content/legal/${slug}.md`;

  return (
    <div className="flex flex-col gap-4 border-b border-black/[0.06] pb-6 dark:border-white/[0.08] sm:flex-row sm:items-center sm:justify-between">
      {/* Document Meta Tag */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center rounded-md bg-neutral-100 px-2.5 py-1 text-[11px] font-mono font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
          doc:/{slug}
        </span>
        <span className="text-xs text-muted-foreground">
          Effective as of {updated}
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        {/* Copy Link Button */}
        <CopyButton
          value={currentUrl}
          label="Copy Page Link"
          className="h-8 gap-1.5 rounded-xl border border-black/[0.06] bg-[#F5F5F7] px-3 text-xs font-medium text-neutral-700 hover:border-[#0ac5b2] hover:text-[#0ac5b2] dark:border-white/[0.08] dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-[#0ac5b2] dark:hover:text-[#0ac5b2]"
        >
          <span>Copy Link</span>
        </CopyButton>

        {/* View on GitHub */}
        <a
          href={githubFileUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-black/[0.06] bg-[#F5F5F7] px-3 text-xs font-medium text-neutral-700 transition-colors hover:border-[#0ac5b2] hover:text-[#0ac5b2] dark:border-white/[0.08] dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-[#0ac5b2] dark:hover:text-[#0ac5b2]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
          title="View source markdown on GitHub"
        >
          <span>Markdown</span>
          <ExternalLinkIcon className="size-3 opacity-60" />
        </a>

        {/* Print Document */}
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-black/[0.06] bg-[#F5F5F7] px-3 text-xs font-medium text-neutral-700 transition-colors hover:border-[#0ac5b2] hover:text-[#0ac5b2] dark:border-white/[0.08] dark:bg-neutral-900 dark:text-neutral-300 dark:hover:border-[#0ac5b2] dark:hover:text-[#0ac5b2]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
          title="Print or save as PDF"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-3.5 opacity-60"
          >
            <polyline points="6 9 6 2 18 2 18 9" />
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <rect width="12" height="8" x="6" y="14" />
          </svg>
          <span className="hidden sm:inline">Print</span>
        </button>
      </div>
    </div>
  );
}
