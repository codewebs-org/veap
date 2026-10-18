import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocView from "@/components/docs/DocView";
import { getAllDocSlugs, getDocBySlug } from "@/lib/docs";
import { getDocsNavigation } from "@/lib/docs-nav";
import { fetchStarCount } from "@/lib/github";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type PageProps = {
  params: Promise<{ slug: string[] }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllDocSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const doc = getDocBySlug(slug);

  if (!doc) return {};

  return {
    title: `${doc.title} - ${SITE_NAME} Documentation`,
    description:
      doc.description ||
      `Learn about ${doc.title} in the ${SITE_NAME} Framework.`,
    alternates: {
      canonical: `${SITE_URL}${doc.href}`,
    },
  };
}

export default async function DocPage({ params }: PageProps) {
  const { slug } = await params;

  // `/docs/overview` (the previous landing page slug) is redirected in next.config.
  const doc = getDocBySlug(slug);

  if (!doc) {
    notFound();
  }

  const stars = await fetchStarCount();
  const { sections } = getDocsNavigation();

  return <DocView doc={doc} sections={sections} stars={stars} />;
}
