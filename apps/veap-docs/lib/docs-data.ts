/**
 * Shared documentation types and pure helpers.
 *
 * This module must stay free of `node:*` imports: it is imported by Client
 * Components (sidebar, drawers). The navigation tree itself is generated from
 * the `meta.json` files of the docs source at build time — see `docs-nav.ts`
 * for the server-side loader and `docs.ts` for the page API.
 */

export interface DocItem {
  title: string;
  /** URL slug, e.g. "guides/database". Empty string for the root page. */
  slug: string;
  /** Route, e.g. "/docs/guides/database". Groups without a landing page have none. */
  href?: string;
  /** File path relative to the docs source root, e.g. "guides/database/index.md". */
  file?: string;
  description?: string;
  /** Nested pages, taken from a nested `meta.json`. */
  children?: DocItem[];
}

export interface DocSection {
  id: string;
  title: string;
  /** Set when the section folder has its own landing page (an `index.md`). */
  href?: string;
  items: DocItem[];
}

/** A page that is guaranteed to be routable (every leaf of the navigation). */
export interface DocLinkItem extends DocItem {
  href: string;
  file: string;
}

export interface TocHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface DocFrontmatter {
  title?: string;
  description?: string;
  status?: "Stable" | "Beta" | "Experimental" | "New" | string;
  category?: string;
  author?: string;
  lastUpdated?: string;
  readingTime?: string;
  [key: string]: unknown;
}

export interface DocPageData {
  title: string;
  description?: string;
  slug: string;
  slugParts: string[];
  href: string;
  file: string;
  content: string;
  toc: TocHeading[];
  /** Breadcrumb of the navigation groups that contain this page. */
  breadcrumbs: string[];
  sectionTitle: string;
  frontmatter: DocFrontmatter;
  readingTime: string;
  prev?: DocLinkItem;
  next?: DocLinkItem;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractToc(content: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const lines = content.split("\n");
  let inCodeBlock = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    const match2 = line.match(/^##\s+(.+)$/);
    if (match2) {
      const rawText = match2[1].trim().replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      const id = slugify(rawText);
      headings.push({ id, text: rawText, level: 2 });
      continue;
    }

    const match3 = line.match(/^###\s+(.+)$/);
    if (match3) {
      const rawText = match3[1].trim().replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      const id = slugify(rawText);
      headings.push({ id, text: rawText, level: 3 });
    }
  }

  return headings;
}

/** Total number of pages below a navigation node, including nested groups. */
export function countDocItems(items: DocItem[]): number {
  return items.reduce(
    (total, item) =>
      total + (item.children?.length ? countDocItems(item.children) : 1),
    0,
  );
}

/** Number of routable pages in a list, ignoring groups. */
export function countDocLeaves(items: DocItem[]): number {
  return items.reduce(
    (total, item) =>
      total + (item.children?.length ? countDocLeaves(item.children) : 1),
    0,
  );
}

/** Recursively filters a navigation tree by a free-text query. */
export function filterDocItems(items: DocItem[], query: string): DocItem[] {
  const q = query.toLowerCase().trim();
  if (!q) return items;

  return items.flatMap((item) => {
    const matchesSelf =
      item.title.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      (item.file ? item.file.toLowerCase().includes(q) : false) ||
      (item.description ? item.description.toLowerCase().includes(q) : false);

    if (matchesSelf) return [item];

    const children = item.children ? filterDocItems(item.children, q) : [];
    return children.length > 0 ? [{ ...item, children }] : [];
  });
}
