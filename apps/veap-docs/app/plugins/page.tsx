import type { Metadata } from "next";
import EarlyAccessBadge from "@/components/EarlyAccessBadge";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import PluginFilterGallery from "@/components/gallery/PluginFilterGallery";
import HeroIntro from "@/components/HeroIntro";
import { fetchStarCount } from "@/lib/github";
import { gallerySections, plugins } from "@/lib/plugins";
import { pluginsJsonLd } from "@/lib/seo";
import { SITE_KEYWORDS } from "@/lib/site";

export const metadata: Metadata = {
  title: "Plugins & ORM Traits",
  description:
    "Browse every official Veap package: plugins with manifests, Knex migrations and UI extensions, plus the ORM trait packages for translations, tags, categories and comments.",
  keywords: [
    "veap plugins",
    "veap orm traits",
    "veap package registry",
    ...SITE_KEYWORDS,
  ],
  alternates: {
    canonical: "/plugins",
  },
};

export default async function PluginsIndexPage() {
  const stars = await fetchStarCount();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pluginsJsonLd()) }}
      />

      <section className="relative w-full p-1.5 md:p-2.5">
        <div
          className="relative flex min-h-[min(78svh,50rem)] w-full items-center justify-center overflow-hidden rounded-[45px] border border-black/[0.04] bg-[#F5F5F7] dark:border-transparent dark:border-apple dark:bg-[#121212]"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          <GooeyNavbar stars={stars} />

          <img
            src="/logos/veap.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute left-1/2 top-[68%] w-215 max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.05] [filter:brightness(0)] dark:opacity-[0.07] dark:[filter:brightness(0)_invert(1)]"
          />
          <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_75%_at_50%_-5%,rgba(10,197,178,0.10),transparent_60%)] dark:block" />

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 pb-16 pt-28 text-center sm:gap-4 sm:px-6">
            <HeroIntro
              headline={`${plugins.length} official packages in the registry`}
              sub="Isolated packages you install, eject and toggle at runtime. Each entry ships an IPlugin manifest, Knex migrations and UI extensions."
              badge={<EarlyAccessBadge label="Ecosystem Preview" />}
            >
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 font-medium text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                  <span className="text-[#0ac5b2]">[</span>
                  Click any plugin to view setup, dependencies, and
                  configuration
                  <span className="text-[#0ac5b2]">]</span>
                </span>
              </div>
            </HeroIntro>
          </div>
        </div>
      </section>

      <main className="mx-auto w-full scroll-mt-16 p-1.5 md:p-2.5 my-8">
        <PluginFilterGallery sections={gallerySections} allPlugins={plugins} />
      </main>

      <Footer />
    </>
  );
}
