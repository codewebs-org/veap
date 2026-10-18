import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import LegalPage from "@/components/legal/LegalPage";
import { fetchStarCount } from "@/lib/github";
import { getAllLegalSlugs, getLegalDoc } from "@/lib/legal";
import { SITE_NAME } from "@/lib/site";

export const dynamicParams = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllLegalSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getLegalDoc(slug);

  if (!doc) {
    return {};
  }

  return {
    title: doc.title,
    description: doc.description,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title: `${doc.title} | ${SITE_NAME}`,
      description: doc.description,
      url: `/${slug}`,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function DynamicLegalPage({ params }: PageProps) {
  const { slug } = await params;
  const doc = getLegalDoc(slug);

  if (!doc) {
    notFound();
  }

  const stars = await fetchStarCount();

  return (
    <>
      <LegalPage doc={doc} stars={stars} />
      <Footer />
    </>
  );
}
