import { type DocFrontmatter, type DocPageData, extractToc } from "./docs-data";
import {
  getAllRoutableFiles,
  getBreadcrumbsBySlug,
  getDocNavigation,
} from "./docs-nav";
import {
  docFileExists,
  extractDescription,
  fileToSlug,
  humanizeDocId,
  parseDocDocument,
  readDocFile,
  slugCandidates,
  stripInlineMarkdown,
} from "./docs-source";

export * from "./docs-data";
export * from "./docs-nav";

/** Route params for the catch-all docs route, one entry per Markdown file. */
export function getAllDocSlugs(): string[][] {
  return getAllRoutableFiles()
    .map(fileToSlug)
    .filter((slug) => slug.length > 0)
    .map((slug) => slug.split("/"));
}

/** The Markdown file behind a slug, or `null` when no file matches. */
export function resolveDocFile(slugs: string[]): string | null {
  const slug = slugs.filter(Boolean).join("/");
  return (
    slugCandidates(slug).find((candidate) => docFileExists(candidate)) ?? null
  );
}

export function getDocBySlug(slugs: string[]): DocPageData | null {
  const slug = slugs.filter(Boolean).join("/");
  const file = resolveDocFile(slugs);
  if (!file) return null;

  const rawFile = readDocFile(file);
  if (rawFile === null) return null;

  const { frontmatter, content, heading } = parseDocDocument(rawFile);
  const meta = frontmatter as DocFrontmatter;

  const title =
    meta.title ??
    (heading ? stripInlineMarkdown(heading) : undefined) ??
    humanizeDocId(slug || "index");

  const description = meta.description ?? extractDescription(content);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const readingTime =
    meta.readingTime ?? `${Math.max(1, Math.ceil(wordCount / 200))} min read`;

  const breadcrumbs = getBreadcrumbsBySlug(slug);
  const { prev, next } = getDocNavigation(slug);

  return {
    title,
    description,
    slug,
    slugParts: slugs,
    href: slug ? `/docs/${slug}` : "/docs",
    file,
    content,
    toc: extractToc(content),
    breadcrumbs,
    sectionTitle:
      breadcrumbs.length > 0 ? breadcrumbs.join(" / ") : "Documentation",
    frontmatter: meta,
    readingTime,
    prev,
    next,
  };
}
