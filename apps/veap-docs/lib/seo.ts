import type { Metadata } from "next";
import { plugins } from "@/lib/plugins";
import {
  SITE_ALT_NAMES,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_REPO,
  SITE_URL,
} from "@/lib/site";

export function pluginPageMetadata(href: string): Metadata {
  const item = plugins.find((c) => c.href === href);
  if (!item) return {};

  const name = item.name.toLowerCase();

  return {
    title: `${item.name} - Veap Plugin`,
    description: item.description,
    keywords: [
      name,
      `${name} veap`,
      `${name} plugin`,
      `veap framework`,
      `veap ecosystem`,
      ...SITE_KEYWORDS,
    ],
    alternates: {
      canonical: item.href,
    },
  };
}

export function pluginJsonLd(href: string) {
  const item = plugins.find((c) => c.href === href);
  if (!item) return null;

  const url = `${SITE_URL}${item.href}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          {
            "@type": "ListItem",
            position: 2,
            name: "Plugins",
            item: `${SITE_URL}/plugins`,
          },
          { "@type": "ListItem", position: 3, name: item.name, item: url },
        ],
      },
      {
        "@type": "SoftwareSourceCode",
        name: item.name,
        description: item.description,
        url,
        codeRepository: item.contact?.repository ?? SITE_REPO,
        programmingLanguage: "TypeScript",
        runtimePlatform: "Node.js / Bun / Next.js",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        license: `https://opensource.org/licenses/${item.license}`,
        author: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  };
}

export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        url: SITE_URL,
        logo: `${SITE_URL}/logos/logo.svg`,
        sameAs: [SITE_REPO],
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "SoftwareApplication",
        "@id": `${SITE_URL}/#software`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Web",
        url: SITE_URL,
        description: SITE_DESCRIPTION,
        softwareHelp: `${SITE_URL}/plugins`,
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      },
    ],
  };
}

export function pluginsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${SITE_NAME} Plugins`,
    url: `${SITE_URL}/plugins`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: plugins.length,
      itemListElement: plugins.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        description: item.description,
        url: `${SITE_URL}${item.href}`,
      })),
    },
  };
}
