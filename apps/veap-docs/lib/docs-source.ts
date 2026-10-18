import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

/**
 * Locates the documentation source inside the monorepo.
 *
 * The docs live at `<repo>/docs/developer-docs` and are shared by every
 * consumer (website, CLI, editors), so the app reads them in place instead of
 * keeping a second copy under `content/`. `VEAP_DOCS_ROOT` can point somewhere
 * else (for example a checkout of the docs repository in CI).
 */
function resolveDocsRoot(): string {
  const candidates = [
    process.env.VEAP_DOCS_ROOT,
    path.resolve(process.cwd(), "docs", "developer-docs"),
    path.resolve(process.cwd(), "..", "docs", "developer-docs"),
    path.resolve(process.cwd(), "..", "..", "docs", "developer-docs"),
  ].filter((candidate): candidate is string => Boolean(candidate));

  for (const candidate of candidates) {
    if (fs.existsSync(path.join(candidate, "meta.json"))) {
      return candidate;
    }
  }

  throw new Error(
    `Unable to locate the Veap documentation source. Set VEAP_DOCS_ROOT to the folder that contains meta.json (tried: ${candidates.join(", ")}).`,
  );
}

export const DOCS_ROOT = resolveDocsRoot();

/**
 * The docs source lives outside the app folder and is only read while pages
 * are generated, so none of these reads are traced into the deployment
 * output (hence the `turbopackIgnore` hints in this module).
 */
export function docsPath(relativeFile: string): string {
  return path.join(/* turbopackIgnore: true */ DOCS_ROOT, relativeFile);
}

export function docFileExists(relativeFile: string): boolean {
  const full = docsPath(relativeFile);
  return (
    fs.existsSync(/* turbopackIgnore: true */ full) &&
    fs.statSync(/* turbopackIgnore: true */ full).isDirectory() === false
  );
}

export function readDocFile(relativeFile: string): string | null {
  const full = docsPath(relativeFile);
  if (!fs.existsSync(/* turbopackIgnore: true */ full)) return null;
  return fs.readFileSync(/* turbopackIgnore: true */ full, "utf-8");
}

/** Turns an OS path (absolute or relative to the docs root) into a posix relative path. */
export function toRelativeFile(target: string): string {
  return path.relative(DOCS_ROOT, target).split(path.sep).join("/");
}

/** All Markdown files below the docs root, in stable alphabetical order. */
export function listMarkdownFiles(dir = DOCS_ROOT): string[] {
  const files: string[] = [];

  for (const entry of fs.readdirSync(/* turbopackIgnore: true */ dir, {
    withFileTypes: true,
  })) {
    const full = path.join(/* turbopackIgnore: true */ dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(full));
    } else if (entry.name.endsWith(".md")) {
      files.push(toRelativeFile(full));
    }
  }

  return files.sort();
}

/** `index.md` -> "", `guides/index.md` -> "guides", `guides/database/models.md` -> "guides/database/models". */
export function fileToSlug(relativeFile: string): string {
  const withoutExtension = relativeFile.replace(/\.md$/, "");
  return withoutExtension.replace(/(^|\/)index$/, "");
}

export function slugToHref(slug: string): string {
  return slug ? `/docs/${slug}` : "/docs";
}

/** `"guides/database"` -> `"guides/database/index.md"`, `"guides/ui"` -> `"guides/ui.md"`. */
export function slugCandidates(slug: string): string[] {
  if (!slug) return ["index.md"];
  return [`${slug}.md`, `${slug}/index.md`];
}

/** The first `# Heading` of a Markdown document, without inline markdown syntax. */
export function getFirstHeading(markdown: string | null): string | null {
  if (!markdown) return null;
  const match = markdown.match(/^#\s+(.+)$/m);
  return match ? stripInlineMarkdown(match[1]).trim() : null;
}

/** Removes `[text](url)`, `` `code` `` and emphasis markers from a single line. */
export function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1");
}

function humanize(id: string): string {
  const last = id.split("/").filter(Boolean).pop() ?? id;
  return last
    .split(/[-_]/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * A short summary derived from the document body: the first paragraph that is
 * not a heading, list, quote, table or code block.
 */
export function extractDescription(markdown: string | null, limit = 180) {
  if (!markdown) return undefined;

  const body = markdown.replace(/^#\s+.+$(\r?\n)?/m, "");
  const lines = body.split(/\r?\n/);
  let inCodeBlock = false;
  const paragraph: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (line.startsWith("```") || line.startsWith("~~~")) {
      inCodeBlock = !inCodeBlock;
      if (paragraph.length > 0) break;
      continue;
    }
    if (inCodeBlock) continue;

    if (!line || line.startsWith("#") || line.startsWith("|")) {
      if (paragraph.length > 0) break;
      continue;
    }
    if (/^([-*+]|\d+\.)\s/.test(line) || line.startsWith(">")) {
      if (paragraph.length > 0) break;
      continue;
    }
    if (/^<!--/.test(line)) continue;

    paragraph.push(line);

    // A wrapped paragraph ends when the next line is blank; look ahead cheaply.
    if (stripInlineMarkdown(paragraph.join(" ")).length >= limit) break;
  }

  if (paragraph.length === 0) return undefined;

  const text = stripInlineMarkdown(paragraph.join(" "))
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= limit) return text;

  const truncated = text.slice(0, limit);
  const lastSpace = truncated.lastIndexOf(" ");
  return `${(lastSpace > 40 ? truncated.slice(0, lastSpace) : truncated).trimEnd()}…`;
}

export function docTitle(relativeFile: string, markdown: string | null) {
  return getFirstHeading(markdown) ?? humanize(relativeFile);
}

/** Splits optional YAML frontmatter (docs may add it later) from the body. */
export function parseDocDocument(rawFile: string) {
  const parsed = matter(rawFile);
  const frontmatter = (parsed.data ?? {}) as Record<string, unknown>;

  let content = parsed.content;
  const titleMatch = content.match(/^#\s+(.+)$/m);
  if (titleMatch) {
    content = content.replace(/^#\s+(.+)$/m, "").trim();
  }

  return { frontmatter, content, heading: titleMatch?.[1]?.trim() };
}

export { humanize as humanizeDocId };
