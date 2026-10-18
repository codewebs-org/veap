import type { Metadata } from "next";
import EarlyAccessBadge from "@/components/EarlyAccessBadge";
import Footer from "@/components/Footer";
import GooeyNavbar from "@/components/GooeyNavbar";
import HeroIntro from "@/components/HeroIntro";
import ReviewsComingSoon from "@/components/reviews/ReviewsComingSoon";
import SquircleButton from "@/components/SquircleButton";
import { fetchStarCount } from "@/lib/github";
import { SITE_KEYWORDS, SITE_NAME } from "@/lib/site";

const TITLE = `Reviews | ${SITE_NAME}`;

const DESCRIPTION =
  "Veap Community Showcase & Wall of Love. Currently in Early Access - share feedback, benchmarks, and developer stories.";

const OG_IMAGE = {
  url: "/ogimage.webp",
  width: 2400,
  height: 1260,
  alt: "Veap - The Modular Full-Stack Web Framework",
  type: "image/webp",
};

export const metadata: Metadata = {
  title: "Reviews",
  description: DESCRIPTION,
  keywords: [
    "Veap testimonials",
    "Veap reviews",
    "framework reviews",
    "next.js framework",
    ...SITE_KEYWORDS,
  ],
  alternates: {
    canonical: "/reviews",
  },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/reviews",
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

export default async function ReviewsPage() {
  const stars = await fetchStarCount();

  return (
    <>
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
              headline="Wall of Love & Community"
              sub="Veap is currently in Early Access. We are gathering real-world benchmarks, architectural feedback, and developer stories."
              badge={
                <EarlyAccessBadge label="Community Preview" href="#community" />
              }
            >
              <div className="mt-2 flex flex-col items-center gap-4">
                <SquircleButton href="#submit" variant="primary">
                  Share Your Feedback
                </SquircleButton>

                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 font-medium text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    <span className="text-[#0ac5b2]">[</span>
                    Community showcase & developer reviews opening with v1.x
                    <span className="text-[#0ac5b2]">]</span>
                  </span>
                </div>
              </div>
            </HeroIntro>
          </div>
        </div>
      </section>

      <main className="flex-1">
        <ReviewsComingSoon />
      </main>

      <Footer />
    </>
  );
}
