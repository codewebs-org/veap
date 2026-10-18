import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocView from "@/components/docs/DocView";
import { getDocBySlug } from "@/lib/docs";
import { getDocsNavigation } from "@/lib/docs-nav";
import { fetchStarCount } from "@/lib/github";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const doc = getDocBySlug([]);

  if (!doc) return {};

  return {
    title: `${doc.title} - ${SITE_NAME} Documentation`,
    description:
      doc.description ||
      `Learn about ${doc.title} in the ${SITE_NAME} Framework.`,
    alternates: {
      canonical: `${SITE_URL}/docs`,
    },
  };
}

export default async function DocsPage() {
  const doc = getDocBySlug([]);

  if (!doc) {
    notFound();
  }

  const stars = await fetchStarCount();
  const { sections } = getDocsNavigation();

  return <DocView doc={doc} sections={sections} stars={stars} isRoot={true} />;
}
