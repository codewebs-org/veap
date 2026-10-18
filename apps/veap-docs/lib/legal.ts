import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { extractToc } from "@/lib/docs-data";
import {
  LEGAL_DOCS_CONFIG,
  type LegalDoc,
  type LegalDocMetadata,
} from "@/lib/legal-config";

export * from "@/lib/legal-config";

const LEGAL_DIR = path.join(process.cwd(), "content", "legal");

export function getAllLegalSlugs(): string[] {
  if (!fs.existsSync(LEGAL_DIR)) return [];
  return fs
    .readdirSync(LEGAL_DIR)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""));
}

export function getLegalDoc(slug: string): LegalDoc | null {
  const filePath = path.join(LEGAL_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);
  const trimmed = content.trim();

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 220));
  const readingTime = `${minutes} min read`;

  const headings = extractToc(trimmed);

  const docIndex = LEGAL_DOCS_CONFIG.findIndex((item) => item.slug === slug);
  const meta: LegalDocMetadata =
    docIndex !== -1
      ? LEGAL_DOCS_CONFIG[docIndex]
      : {
          slug,
          title: data.title || slug,
          shortTitle: data.title || slug,
          category: "Legal & Policy",
          badge: "Policy",
          icon: "file-text",
          href: `/${slug}`,
        };

  const prevDoc = docIndex > 0 ? LEGAL_DOCS_CONFIG[docIndex - 1] : undefined;
  const nextDoc =
    docIndex >= 0 && docIndex < LEGAL_DOCS_CONFIG.length - 1
      ? LEGAL_DOCS_CONFIG[docIndex + 1]
      : undefined;

  return {
    slug,
    title: data.title || meta.title,
    updated: data.updated || "",
    description: data.description || "",
    intro: data.intro || undefined,
    content: trimmed,
    readingTime,
    wordCount: words,
    headings,
    meta,
    prevDoc,
    nextDoc,
  };
}
