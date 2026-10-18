import { getDocBySlug } from "@/lib/docs";
import { getAllDocItems, resolveDocHref } from "@/lib/docs-nav";
import { SITE_DESCRIPTION, SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

function slugPartsOf(slug: string): string[] {
  return slug ? slug.split("/") : [];
}

/**
 * In a single concatenated file, relative Markdown links are meaningless, so
 * they are rewritten to their canonical absolute URL. Fenced code blocks are
 * left untouched.
 */
function absolutizeLinks(markdown: string, currentFile: string): string {
  let inCodeBlock = false;

  return markdown
    .split("\n")
    .map((line) => {
      if (line.startsWith("```") || line.startsWith("~~~")) {
        inCodeBlock = !inCodeBlock;
        return line;
      }
      if (inCodeBlock) return line;

      return line.replace(
        /(\]\()([^)\s]+)((?:\)|\s+"[^"]*"\)))/g,
        (match, open, target, close) => {
          const resolved = resolveDocHref(currentFile, target);
          if (resolved.startsWith("/"))
            return `${open}${SITE_URL}${resolved}${close}`;
          return `${open}${resolved}${close}`;
        },
      );
    })
    .join("\n");
}

/**
 * `llms-full.txt` (see llmstxt.org) concatenates the whole developer
 * documentation so a model can read it in one request. The order follows the
 * `meta.json` navigation of `docs/developer-docs`, the same tree the sidebar,
 * sitemap and `/docs/[...slug]` routes are built from.
 */
export function GET() {
  const pages = getAllDocItems().flatMap((item) => {
    const doc = getDocBySlug(slugPartsOf(item.slug));
    return doc ? [doc] : [];
  });

  const tableOfContents = pages.map(
    (doc) => `- [${doc.title}](${SITE_URL}${doc.href})`,
  );

  const chapters = pages.map((doc) => {
    const lines = [`# ${doc.title}`, "", `URL: ${SITE_URL}${doc.href}`];

    if (doc.breadcrumbs.length > 0) {
      lines.push(`Section: ${doc.breadcrumbs.join(" / ")}`);
    }

    // The body starts with the same paragraph the description is derived from.
    lines.push("", absolutizeLinks(doc.content.trim(), doc.file));

    return lines.join("\n");
  });

  const body = [
    "# Veap Documentation",
    "",
    `> ${SITE_DESCRIPTION}`,
    "",
    `Canonical site: ${SITE_URL}/docs`,
    `Complete developer documentation in the order defined by the meta.json navigation files in docs/developer-docs (${pages.length} pages). Every page is also available individually at the URL listed below its title.`,
    "",
    "## Table of contents",
    "",
    ...tableOfContents,
    "",
    ...chapters.map((chapter) => `---\n\n${chapter}`),
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
