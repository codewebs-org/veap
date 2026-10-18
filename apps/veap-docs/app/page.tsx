import type { Metadata } from "next";
import EarlyAccessBadge from "@/components/EarlyAccessBadge";
import FaqEarlyAccess from "@/components/FaqEarlyAccess";
import Footer from "@/components/Footer";
import GetStarted from "@/components/GetStarted";
import GooeyNavbar from "@/components/GooeyNavbar";
import HeroCta from "@/components/HeroCta";
import HeroIntro from "@/components/HeroIntro";
import WhyVeap from "@/components/WhyVeap";
import { ecosystemTotals } from "@/lib/ecosystem";
import { fetchStarCount } from "@/lib/github";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};

/**
 * The homepage stays deliberately short: what Veap is, why it exists and how
 * to start. Everything else - the package map, the request lifecycle, the
 * Next.js comparison and the ORM traits - lives in the documentation.
 */
export default async function Home() {
  const stars = await fetchStarCount();

  return (
    <>
      <section className="relative mx-auto w-full p-1.5 md:p-2.5">
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

          <div className="relative mx-auto flex w-full max-w-6xl flex-col items-center justify-center gap-3 px-4 pb-20 pt-28 text-center sm:gap-4 sm:px-6">
            <HeroIntro
              headline="The Modular Package Ecosystem."
              sub={`Veap is a pre-1.0 set of MIT-licensed packages for Next.js 16 - ${ecosystemTotals.services} services, ${ecosystemTotals.traits} ORM traits and the create-veap CLI. Install the ones you need, compose them once, and keep the stock Next.js build.`}
              badge={<EarlyAccessBadge />}
            >
              <HeroCta />
            </HeroIntro>
          </div>
        </div>
      </section>

      <section
        id="why-veap"
        className="mx-auto my-8 w-full max-w-6xl scroll-mt-16 p-1.5 md:p-2.5"
      >
        <WhyVeap />
      </section>

      <section
        id="get-started"
        className="mx-auto my-8 w-full max-w-6xl scroll-mt-16 p-1.5 md:p-2.5"
      >
        <GetStarted />
      </section>

      <section
        id="faq"
        className="mx-auto my-8 w-full max-w-6xl scroll-mt-16 p-1.5 md:p-2.5"
      >
        <FaqEarlyAccess />
      </section>

      <Footer />
    </>
  );
}
