import CopyButton from "@/components/CopyButton";
import { highlightCode } from "@/lib/shiki";
import { cn } from "@/lib/utils";

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export default async function CodeBlock({
  code,
  language = "typescript",
  filename,
  className,
  showLineNumbers = true,
}: CodeBlockProps) {
  const highlightedHtml = await highlightCode(code, language);
  const isMultiLine = code.trim().split("\n").length > 1;
  const shouldShowLineNumbers = Boolean(showLineNumbers && isMultiLine);

  return (
    <div
      className={cn(
        "group relative my-4 flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-[#F6F8FA] text-neutral-900 shadow-sm dark:border-white/[0.08] dark:bg-[#08080a] dark:text-neutral-200",
        className,
      )}
      style={{ cornerShape: "squircle" } as React.CSSProperties}
    >
      {/* Header bar */}
      <div className="flex h-10 items-center justify-between border-b border-black/[0.06] bg-black/[0.02] px-4 dark:border-white/[0.06] dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-black/[0.15] dark:bg-white/[0.12]" />
            <span className="size-2.5 rounded-full bg-black/[0.15] dark:bg-white/[0.12]" />
            <span className="size-2.5 rounded-full bg-black/[0.15] dark:bg-white/[0.12]" />
          </div>
          {filename ? (
            <span className="ml-1.5 font-mono text-xs font-medium text-neutral-700 dark:text-neutral-300">
              {filename}
            </span>
          ) : (
            <span className="ml-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {language}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {filename && (
            <span className="font-mono text-[10px] font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {language}
            </span>
          )}
          <CopyButton
            value={code}
            label="Copy code"
            className="size-7 rounded-lg border border-black/[0.08] bg-black/[0.03] text-neutral-500 hover:border-black/15 hover:bg-black/[0.06] hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-white"
          />
        </div>
      </div>

      {/* Code content */}
      <div
        className={cn(
          "shiki-code-wrapper relative overflow-x-auto p-4 font-mono text-[13px] leading-[1.7] antialiased",
          "[&_pre]:!bg-transparent [&_pre]:!m-0 [&_pre]:!p-0 [&_pre]:!border-0 [&_pre]:!outline-none [&_pre]:!font-mono",
          "[&_code]:!font-mono [&_code]:text-[13px] [&_code]:leading-[1.7]",
          "[&_span]:!font-mono",
          "dark:[&_.shiki]:!text-[var(--shiki-dark)] dark:[&_.shiki_span]:!text-[var(--shiki-dark)]",
          "dark:[&_.shiki_span]:[font-style:var(--shiki-dark-font-style,inherit)]",
          "dark:[&_.shiki_span]:[font-weight:var(--shiki-dark-font-weight,inherit)]",
          "dark:[&_.shiki_span]:[text-decoration:var(--shiki-dark-text-decoration,inherit)]",
          "[&_.line]:inline-block [&_.line]:min-h-[1.4rem] [&_.line]:w-full",
          shouldShowLineNumbers &&
            "[&_code]:[counter-reset:step] [&_.line]:before:[counter-increment:step] [&_.line]:before:content-[counter(step)] [&_.line]:before:inline-block [&_.line]:before:w-5 [&_.line]:before:mr-4 [&_.line]:before:text-right [&_.line]:before:text-neutral-400 dark:[&_.line]:before:text-neutral-600/70 [&_.line]:before:select-none [&_.line]:before:text-[11px] [&_.line]:before:!font-mono",
        )}
        dangerouslySetInnerHTML={{ __html: highlightedHtml }}
      />
    </div>
  );
}
