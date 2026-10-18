import type { MetadataRoute } from "next";
import { getAllDocItems } from "@/lib/docs-nav";
import { getAllLegalSlugs } from "@/lib/legal";
import { plugins } from "@/lib/plugins";
import { SITE_URL } from "@/lib/site";

const lastModified = new Date("2026-09-19");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/docs`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/plugins`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/reviews`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/sponsors`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...getAllLegalSlugs().map((slug) => ({
      url: `${SITE_URL}/${slug}`,
      lastModified,
      changeFrequency: (slug === "contributing" ? "monthly" : "yearly") as
        | "monthly"
        | "yearly",
      priority: slug === "contributing" ? 0.5 : 0.3,
    })),
    ...getAllDocItems().map((doc) => ({
      url: `${SITE_URL}${doc.href}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
    ...plugins.map((plugin) => ({
      url: `${SITE_URL}${plugin.href}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
