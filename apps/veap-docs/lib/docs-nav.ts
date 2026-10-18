import fs from "node:fs";
import path from "node:path";
import type { DocItem, DocLinkItem, DocSection } from "./docs-data";
import { slugify } from "./docs-data";
import {
  DOCS_ROOT,
  docFileExists,
  docTitle,
  extractDescription,
  fileToSlug,
  getFirstHeading,
  humanizeDocId,
  listMarkdownFiles,
  readDocFile,
  slugToHref,
} from "./docs-source";
import { SITE_REPO } from "./site";

/** Shape of the `meta.json` navigation files used by the documentation source. */
interface DocsMeta {
  title?: string;
  pages?: unknown;
}

export interface DocNavEntry {
  item: DocLinkItem;
  /** Navigation groups that contain the page, outermost first. */
  breadcrumbs: string[];
}

export interface DocsNavigation {
  /** The docs landing page (`docs/developer-docs/index.md`). */
  root: DocLinkItem | null;
  sections: DocSection[];
  /** Every page reachable from `meta.json`, in sidebar order. */
  entries: DocNavEntry[];
}

function joinRel(dir: string, name: string): string {
  return dir ? `${dir}/${name}` : name;
}

function readMeta(absDir: string): DocsMeta | null {
  const metaPath = path.join(/* turbopackIgnore: true */ absDir, "meta.json");
  if (!fs.existsSync(/* turbopackIgnore: true */ metaPath)) return null;

  try {
    return JSON.parse(
      fs.readFileSync(/* turbopackIgnore: true */ metaPath, "utf-8"),
    ) as DocsMeta;
  } catch {
    return null;
  }
}

function metaPages(meta: DocsMeta | null): string[] {
  if (!meta || !Array.isArray(meta.pages)) return [];
  return meta.pages.filter((page): page is string => typeof page === "string");
}

function fileItem(relativeFile: string): DocItem {
  const markdown = readDocFile(relativeFile);
  const slug = fileToSlug(relativeFile);

  return {
    title: docTitle(relativeFile, markdown),
    slug,
    href: slugToHref(slug),
    file: relativeFile,
    description: extractDescription(markdown),
  };
}

/**
 * Builds the navigation nodes for one folder. `index.md` always leads the
 * folder, so a guide folder is reachable even when `meta.json` omits it.
 */
function buildChildren(
  absDir: string,
  relDir: string,
  meta: DocsMeta,
): DocItem[] {
  const items: DocItem[] = [];
  const seen = new Set<string>();

  const push = (item: DocItem) => {
    if (item.file) seen.add(item.file);
    items.push(item);
  };

  for (const page of metaPages(meta)) {
    const relFile = joinRel(relDir, `${page}.md`);
    const absSkip = path.join(/* turbopackIgnore: true */ absDir, page);

    if (docFileExists(relFile)) {
      push(fileItem(relFile));
    } else if (
      fs.existsSync(/* turbopackIgnore: true */ absSkip) &&
      fs.statSync(/* turbopackIgnore: true */ absSkip).isDirectory()
    ) {
      const childDir = joinRel(relDir, page);
      const childMeta = readMeta(absSkip) ?? {};
      push(dirNode(absSkip, childDir, page, childMeta));
    }
  }

  const indexFile = joinRel(relDir, "index.md");
  if (docFileExists(indexFile) && !seen.has(indexFile)) {
    items.unshift(fileItem(indexFile));
  }

  return items;
}

/** A folder becomes a group node; its landing page (`index.md`) is its first child. */
function dirNode(
  absDir: string,
  relDir: string,
  entryId: string,
  meta: DocsMeta,
): DocItem {
  const indexFile = joinRel(relDir, "index.md");
  const children = buildChildren(absDir, relDir, meta);
  const title =
    meta.title ??
    getFirstHeading(readDocFile(indexFile)) ??
    humanizeDocId(entryId);

  return {
    title,
    slug: relDir,
    file: docFileExists(indexFile) ? indexFile : undefined,
    children,
  };
}

function buildNavigation(): DocsNavigation {
  const rootMeta = readMeta(DOCS_ROOT) ?? {};
  const items = buildChildren(DOCS_ROOT, "", rootMeta);

  const rootIndex = items.find((item) => item.file === "index.md") ?? null;
  const root: DocLinkItem | null = rootIndex
    ? {
        ...rootIndex,
        title: "Overview",
        href: rootIndex.href ?? "/docs",
        file: rootIndex.file ?? "index.md",
      }
    : null;

  const sections: DocSection[] = items
    .filter((item) => item !== rootIndex)
    .map((item) => ({
      id: item.slug || slugify(item.title),
      title: item.title,
      href: item.href,
      items: item.children ?? [item],
    }));

  // The landing page has no `meta.json` group of its own, so it is exposed as
  // a link-only section at the top of the sidebar.
  if (root) {
    sections.unshift({
      id: "overview",
      title: root.title,
      href: root.href,
      items: [],
    });
  }

  const entries: DocNavEntry[] = [];

  const visit = (item: DocItem, breadcrumbs: string[]) => {
    if (item.children && item.children.length > 0) {
      for (const child of item.children) {
        visit(child, [...breadcrumbs, item.title]);
      }
      return;
    }

    entries.push({
      item: {
        ...item,
        href: item.href ?? slugToHref(item.slug),
        file: item.file ?? `${item.slug}.md`,
      },
      breadcrumbs,
    });
  };

  for (const section of sections) {
    if (section.items.length === 0) continue;
    for (const item of section.items) visit(item, [section.title]);
  }
  if (root) entries.unshift({ item: root, breadcrumbs: [] });

  return { root, sections, entries };
}

let cachedNavigation: DocsNavigation | null = null;

/**
 * The generated documentation navigation. In development the tree is rebuilt
 * on every call so edits to `meta.json` show up without a restart.
 */
export function getDocsNavigation(): DocsNavigation {
  if (process.env.NODE_ENV === "production" && cachedNavigation) {
    return cachedNavigation;
  }

  cachedNavigation = buildNavigation();
  return cachedNavigation;
}

/** Every page listed in a `meta.json`, in reading order. */
export function getAllDocItems(): DocLinkItem[] {
  return getDocsNavigation().entries.map((entry) => entry.item);
}

/** Every Markdown file in the docs source, including pages not in `meta.json`. */
export function getAllRoutableFiles(): string[] {
  return listMarkdownFiles();
}

export function getDocItemBySlug(slug: string): DocLinkItem | undefined {
  return getAllDocItems().find((item) => item.slug === slug);
}

export function getBreadcrumbsBySlug(slug: string): string[] {
  return (
    getDocsNavigation().entries.find((entry) => entry.item.slug === slug)
      ?.breadcrumbs ?? []
  );
}

export function getDocNavigation(slug: string): {
  prev?: DocLinkItem;
  next?: DocLinkItem;
} {
  const items = getAllDocItems();
  const index = items.findIndex((item) => item.slug === slug);
  if (index === -1) return {};

  return {
    prev: index > 0 ? items[index - 1] : undefined,
    next: index < items.length - 1 ? items[index + 1] : undefined,
  };
}

function isExternal(href: string): boolean {
  return (
    !href ||
    href.startsWith("#") ||
    href.startsWith("/") ||
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:")
  );
}

/**
 * Rewrites a relative Markdown link found in a document into an app route.
 * Links that leave the docs set (files such as `source-map.json`, or broken
 * targets) fall back to the GitHub source so nothing 404s silently.
 */
export function resolveDocHref(fromFile: string, href: string): string {
  if (isExternal(href)) return href;

  const [rawPath, hashPart] = href.split("#");
  const hashSuffix = hashPart ? `#${hashPart}` : "";
  if (!rawPath) return href;

  const fromDir = path.posix.dirname(fromFile);
  const resolved = path.posix.normalize(
    path.posix.join(fromDir === "." ? "" : fromDir, rawPath),
  );

  if (resolved.startsWith("..")) return href;

  if (resolved.endsWith(".md")) {
    // Only Markdown documents become routes; anything else stays on the raw href.
    return docFileExists(resolved)
      ? `${slugToHref(fileToSlug(resolved))}${hashSuffix}`
      : href;
  }

  if (
    fs.existsSync(path.join(/* turbopackIgnore: true */ DOCS_ROOT, resolved))
  ) {
    return `${SITE_REPO}/blob/main/docs/developer-docs/${resolved}${hashSuffix}`;
  }

  return href;
}
