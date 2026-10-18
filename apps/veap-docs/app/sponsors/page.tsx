import type { Metadata } from "next";
import EarlyAccessBadge from "@/components/EarlyAccessBadge";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import HeroIntro from "@/components/HeroIntro";
import { SquircleButtonGroup } from "@/components/SquircleButton";
import ComingSoon from "@/components/sponsors/ComingSoon";
import SponsorCta from "@/components/sponsors/SponsorCta";
import { fetchStarCount } from "@/lib/github";
import { SUPPORT_EMAIL } from "@/lib/legal-config";
import { SITE_KEYWORDS, SITE_NAME } from "@/lib/site";
import { SPONSOR_X_URL } from "@/lib/sponsors";

const TITLE = `Sponsors | ${SITE_NAME}`;

const DESCRIPTION =
  "Support the development of Veap, an open-source modular full-stack framework for Next.js 16. Help us expand the plugin ecosystem and tools for developers.";

const OG_IMAGE = {
  url: "/ogimage.webp",
  width: 2400,
  height: 1260,
  alt: "Veap - The Modular Full-Stack Web Framework",
  type: "image/webp",
};

export const metadata: Metadata = {
  title: "Sponsors",
  description: DESCRIPTION,
  keywords: [
    "Veap sponsors",
    "sponsor Veap",
    "open source sponsorship",
    "framework sponsor",
    ...SITE_KEYWORDS,
  ],
  alternates: {
    canonical: "/sponsors",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/sponsors",
    siteName: SITE_NAME,
    locale: "en_US",
    images: [OG_IMAGE],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE.url],
  },
};

export default async function SponsorsPage() {
  const stars = await fetchStarCount();

  return (
    <>
      <section className="relative w-full p-1.5 md:p-2.5">
        <div
          className="relative flex min-h-[min(100svh-0.75rem,60rem)] w-full items-center justify-center overflow-hidden rounded-[45px] border border-black/[0.04] bg-[#F5F5F7] dark:border-transparent dark:border-apple dark:bg-[#121212] md:min-h-[min(100svh_-_1.25rem,60rem)]"
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
              headline="Sponsors & Founding Partners"
              sub="Your support keeps Veap free, open-source, and modular for developers everywhere. Partner with us to shape the Next.js 16 framework ecosystem."
              badge={<EarlyAccessBadge label="Partner Program" href="#tiers" />}
            >
              <div className="mt-2 flex flex-col items-center gap-4">
                <SponsorCta href="#tiers">Become a Sponsor</SponsorCta>

                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 font-medium text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="text-[#0ac5b2]">[</span>
                    Explore upcoming sponsorship tiers and founding partner
                    packages below
                    <span className="text-[#0ac5b2]">]</span>
                  </span>
                </div>
              </div>
            </HeroIntro>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <ComingSoon />

        <section className="mx-auto flex w-full scroll-mt-16 flex-col items-center gap-4 p-1.5 md:p-2.5 text-center sm:px-6 md:pb-32">
          <h2 className="text-balance font-runde text-2xl font-bold tracking-tight sm:text-3xl">
            Questions, or need a custom package?
          </h2>
          <p className="max-w-lg text-balance font-medium text-muted-foreground">
            Happy to put something together that fits how your team wants to
            show up.
          </p>
          <SquircleButtonGroup className="mt-2">
            <SponsorCta
              href={`mailto:${SUPPORT_EMAIL}`}
              variant="subtle"
              className="min-w-44"
            >
              Email me
            </SponsorCta>
            <SponsorCta
              href={SPONSOR_X_URL}
              variant="subtle"
              className="min-w-44"
            >
              DM on X
            </SponsorCta>
          </SquircleButtonGroup>
        </section>
      </main>

      <Footer />
    </>
  );
}
