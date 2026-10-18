/* eslint-disable @next/next/no-img-element */

import { marked, type Tokens } from "marked";
import Link from "next/link";
import React from "react";
import CodeBlock from "@/components/CodeBlock";
import { slugify } from "@/lib/docs-data";
import { resolveDocHref } from "@/lib/docs-nav";
import { cn } from "@/lib/utils";
import CalloutAlert, { type CalloutType } from "./CalloutAlert";
import MermaidDiagram from "./MermaidDiagram";

export interface MarkdownRendererProps {
  content: string;
  /** Source file of the content, used to resolve relative Markdown links. */
  currentFile?: string;
  className?: string;
}

function renderInline(
  tokens?: Tokens.Generic[],
  currentFile = "index.md",
): React.ReactNode {
  if (!tokens || tokens.length === 0) return null;

  return tokens.map((token, idx) => {
    switch (token.type) {
      case "text": {
        const textToken = token as Tokens.Text;
        if (textToken.tokens && textToken.tokens.length > 0) {
          return (
            <React.Fragment key={idx}>
              {renderInline(textToken.tokens, currentFile)}
            </React.Fragment>
          );
        }
        return <React.Fragment key={idx}>{token.text}</React.Fragment>;
      }
      case "paragraph":
        return (
          <React.Fragment key={idx}>
            {renderInline(token.tokens, currentFile)}
          </React.Fragment>
        );
      case "strong":
        return (
          <strong
            key={idx}
            className="font-semibold text-neutral-900 dark:text-white"
          >
            {renderInline(token.tokens, currentFile)}
          </strong>
        );
      case "em":
        return (
          <em key={idx} className="italic">
            {renderInline(token.tokens, currentFile)}
          </em>
        );
      case "codespan":
        return (
          <code
            key={idx}
            className="rounded-md border border-black/[0.08] bg-black/[0.04] px-1.5 py-0.5 font-mono text-[13px] font-medium text-neutral-800 dark:border-white/[0.1] dark:bg-white/[0.08] dark:text-neutral-200"
          >
            {token.text}
          </code>
        );
      case "link": {
        const resolvedHref = resolveDocHref(currentFile, token.href);
        const isExternal =
          resolvedHref.startsWith("http://") ||
          resolvedHref.startsWith("https://");
        const isMailto = resolvedHref.startsWith("mailto:");
        const linkContent =
          token.tokens && token.tokens.length > 0
            ? renderInline(token.tokens, currentFile)
            : token.text;

        if (isMailto) {
          return (
            <a
              key={idx}
              href={resolvedHref}
              className="font-medium text-[#0ac5b2] underline underline-offset-4 hover:text-[#00897B] transition-colors"
            >
              {linkContent}
            </a>
          );
        }

        if (isExternal) {
          return (
            <a
              key={idx}
              href={resolvedHref}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-[#0ac5b2] underline underline-offset-4 hover:text-[#00897B]"
            >
              {linkContent} &rarr;
            </a>
          );
        }
        return (
          <Link
            key={idx}
            href={resolvedHref}
            className="font-medium text-[#0ac5b2] underline underline-offset-4 hover:text-[#00bd99] transition-colors"
          >
            {linkContent}
          </Link>
        );
      }
      case "image":
        return (
          <img
            key={idx}
            src={token.href}
            alt={token.text}
            title={token.title || undefined}
            className="my-3 rounded-xl border border-black/[0.08] dark:border-white/[0.1] max-w-full h-auto"
          />
        );
      case "del":
        return (
          <del key={idx} className="line-through opacity-70">
            {renderInline(token.tokens, currentFile)}
          </del>
        );
      case "html":
        return (
          <span key={idx} dangerouslySetInnerHTML={{ __html: token.raw }} />
        );
      case "escape":
        return <React.Fragment key={idx}>{token.text}</React.Fragment>;
      case "space":
        return null;
      case "list": {
        const listToken = token as Tokens.List;
        const Tag = listToken.ordered ? "ol" : "ul";
        return (
          <Tag
            key={idx}
            className={cn(
              "my-1 flex flex-col gap-1 pl-5",
              listToken.ordered ? "list-decimal" : "list-disc",
            )}
          >
            {listToken.items.map((item: Tokens.ListItem, iIdx: number) => (
              <li key={iIdx} className="leading-relaxed pl-1">
                {renderInline(item.tokens, currentFile)}
              </li>
            ))}
          </Tag>
        );
      }
      default:
        return token.raw;
    }
  });
}

export default function MarkdownRenderer({
  content,
  currentFile = "index.md",
  className,
}: MarkdownRendererProps) {
  const tokens = marked.lexer(content);

  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none flex flex-col gap-5 text-neutral-700 dark:text-neutral-300 leading-relaxed text-[15px] sm:text-base",
        className,
      )}
    >
      {tokens.map((token, index) => {
        switch (token.type) {
          case "heading": {
            const headingText = token.text.replace(
              /\[([^\]]+)\]\([^)]+\)/g,
              "$1",
            );
            const id = slugify(headingText);

            if (token.depth === 2) {
              return (
                <h2
                  key={index}
                  id={id}
                  className="group relative mt-8 flex scroll-mt-24 items-center gap-2 font-runde text-xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-2xl"
                >
                  <a
                    href={`#${id}`}
                    className="hover:text-[#0ac5b2] transition-colors"
                  >
                    {renderInline(token.tokens, currentFile)}
                  </a>
                  <a
                    href={`#${id}`}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground text-sm font-normal transition-opacity"
                    aria-label="Direct link to heading"
                  >
                    #
                  </a>
                </h2>
              );
            }

            if (token.depth === 3) {
              return (
                <h3
                  key={index}
                  id={id}
                  className="group relative mt-6 flex scroll-mt-24 items-center gap-2 font-runde text-lg font-semibold tracking-tight text-neutral-900 dark:text-white sm:text-xl"
                >
                  <a
                    href={`#${id}`}
                    className="hover:text-[#0ac5b2] transition-colors"
                  >
                    {renderInline(token.tokens, currentFile)}
                  </a>
                  <a
                    href={`#${id}`}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground text-xs font-normal transition-opacity"
                    aria-label="Direct link to heading"
                  >
                    #
                  </a>
                </h3>
              );
            }

            if (token.depth === 4) {
              return (
                <h4
                  key={index}
                  id={id}
                  className="mt-4 font-runde text-base font-semibold text-neutral-900 dark:text-white"
                >
                  {renderInline(token.tokens, currentFile)}
                </h4>
              );
            }

            return (
              <h5 key={index} id={id} className="mt-2 font-semibold">
                {renderInline(token.tokens, currentFile)}
              </h5>
            );
          }

          case "paragraph": {
            return (
              <p key={index} className="leading-relaxed">
                {renderInline(token.tokens, currentFile)}
              </p>
            );
          }

          case "code": {
            if (token.lang?.toLowerCase().trim() === "mermaid") {
              return (
                <MermaidDiagram
                  key={index}
                  chart={token.text}
                  className="my-4"
                />
              );
            }

            return (
              <CodeBlock
                key={index}
                code={token.text}
                language={token.lang || "typescript"}
                className="my-2"
              />
            );
          }

          case "table": {
            const tableToken = token as Tokens.Table;
            return (
              <div
                key={index}
                className="my-4 overflow-x-auto rounded-2xl border border-black/[0.06] bg-white dark:border-neutral-800 dark:bg-neutral-950/60"
                style={{ cornerShape: "squircle" } as React.CSSProperties}
              >
                <table className="w-full text-left font-sans text-sm">
                  <thead className="border-b border-black/[0.06] bg-black/[0.02] font-semibold text-neutral-900 dark:border-neutral-800 dark:bg-white/[0.03] dark:text-neutral-200">
                    <tr>
                      {tableToken.header.map(
                        (cell: Tokens.TableCell, cIdx: number) => (
                          <th key={cIdx} className="px-4 py-3">
                            {renderInline(cell.tokens, currentFile)}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/[0.04] dark:divide-neutral-800/60">
                    {tableToken.rows.map(
                      (row: Tokens.TableCell[], rIdx: number) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-black/[0.01] dark:hover:bg-white/[0.01]"
                        >
                          {row.map((cell: Tokens.TableCell, cIdx: number) => (
                            <td
                              key={cIdx}
                              className="px-4 py-3 text-neutral-700 dark:text-neutral-300"
                            >
                              {renderInline(cell.tokens, currentFile)}
                            </td>
                          ))}
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            );
          }

          case "list": {
            const listToken = token as Tokens.List;
            const Tag = listToken.ordered ? "ol" : "ul";
            return (
              <Tag
                key={index}
                className={cn(
                  "my-2 flex flex-col gap-1.5 pl-5",
                  listToken.ordered ? "list-decimal" : "list-disc",
                )}
              >
                {listToken.items.map((item: Tokens.ListItem, iIdx: number) => (
                  <li
                    key={iIdx}
                    className={cn(
                      "leading-relaxed pl-1",
                      item.task && "list-none flex items-center gap-2",
                    )}
                  >
                    {item.task && (
                      <input
                        type="checkbox"
                        checked={item.checked}
                        disabled
                        className="rounded border-neutral-400 accent-[#0ac5b2]"
                      />
                    )}
                    <span>{renderInline(item.tokens, currentFile)}</span>
                  </li>
                ))}
              </Tag>
            );
          }

          case "blockquote": {
            // Check for GitHub Alerts: [!NOTE], [!TIP], [!WARNING], [!IMPORTANT], [!CAUTION]
            const rawText = token.text.trim();
            const alertMatch = rawText.match(
              /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*([\s\S]*)$/i,
            );

            if (alertMatch) {
              const type = alertMatch[1].toUpperCase() as CalloutType;
              const contentText = alertMatch[2];

              return (
                <CalloutAlert key={index} type={type}>
                  {contentText}
                </CalloutAlert>
              );
            }

            return (
              <blockquote
                key={index}
                className="my-3 border-l-2 border-[#0ac5b2] pl-4 italic text-neutral-600 dark:text-neutral-400"
              >
                {token.text}
              </blockquote>
            );
          }

          case "hr": {
            return (
              <hr
                key={index}
                className="my-8 border-black/[0.06] dark:border-neutral-800"
              />
            );
          }

          default:
            return null;
        }
      })}
    </div>
  );
}
