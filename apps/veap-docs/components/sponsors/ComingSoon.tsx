import SponsorCta from "@/components/sponsors/SponsorCta";
import { SUPPORT_EMAIL } from "@/lib/legal-config";
import { cn } from "@/lib/utils";

function CheckIcon({ featured }: { featured?: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "mt-0.5 size-3.5 shrink-0",
        featured ? "text-[#0ac5b2]" : "text-muted-foreground/45",
      )}
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

interface PreviewTier {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  perks: string[];
  featured?: boolean;
}

const PREVIEW_TIERS: PreviewTier[] = [
  {
    id: "silver",
    name: "Silver Supporter",
    badge: "Community",
    tagline: "For individual contributors, indie hackers, and small teams.",
    perks: [
      "Logo & link on the official sponsors showcase",
      "Supporter badge on GitHub discussions & Discord",
      "Early preview access to new components & plugins",
      "Mention in monthly framework release notes",
    ],
  },
  {
    id: "gold",
    name: "Gold Sponsor",
    badge: "Most Popular",
    tagline: "For scaling startups, devtool products, and SaaS businesses.",
    featured: true,
    perks: [
      "High-visibility logo on docs sidebar & homepage",
      "Clickable direct backlink with custom referral UTMs",
      "Priority triage for GitHub issues and feature requests",
      "Featured spotlight in releases and community newsletter",
      "Quarterly shoutout on official social channels",
    ],
  },
  {
    id: "diamond",
    name: "Diamond Partner",
    badge: "Enterprise",
    tagline: "For enterprise organizations shaping the open-source ecosystem.",
    perks: [
      "Prime hero & footer banner placement across all docs",
      "Dedicated case study and technical showcase article",
      "Direct 1-on-1 architecture & integration consultation",
      "Custom component & plugin roadmap collaboration",
      "Custom billing, invoice support & dedicated Slack channel",
    ],
  },
];

export default function ComingSoon() {
  return (
    <section
      id="tiers"
      className="mx-auto w-full scroll-mt-16 p-1.5 md:p-2.5 my-8 flex flex-col items-center gap-12"
    >
      {/* Status Pill */}
      <div className="inline-flex items-center gap-2 rounded-full border border-[#0ac5b2]/30 bg-[#0ac5b2]/10 px-4 py-1.5 text-xs font-semibold text-[#0ac5b2] backdrop-blur-sm">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0ac5b2] opacity-75" />
          <span className="relative inline-flex size-2 rounded-full bg-[#0ac5b2]" />
        </span>
        <span className="font-runde tracking-wide">
          Sponsorship Program • Coming Soon
        </span>
      </div>

      {/* Main Header */}
      <div className="flex max-w-2xl flex-col items-center gap-3 text-center">
        <h2 className="text-balance font-runde text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Tiered Sponsorships Are On The Way
        </h2>
        <p className="text-balance font-medium text-muted-foreground sm:text-lg">
          We are polishing automated tiers, payment flows, and exclusive sponsor
          showcase spaces. In the meantime, early partners can lock in founding
          sponsor placement.
        </p>
      </div>

      {/* Preview Tier Cards */}
      <div className="grid w-full grid-cols-1 items-stretch gap-4 md:grid-cols-3">
        {PREVIEW_TIERS.map((tier) => (
          <div
            key={tier.id}
            className={cn(
              "relative flex flex-col gap-6 rounded-[44px] bg-card/60 p-7 transition-all duration-200 dark:bg-muted/60",
              tier.featured
                ? "ring-1 ring-[#0ac5b2] dark:bg-muted shadow-lg shadow-[#0ac5b2]/5"
                : "border border-black/[0.04] dark:border-white/[0.06]",
            )}
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          >
            {tier.featured && (
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0ac5b2] px-3.5 py-1 font-runde text-[10px] font-bold uppercase tracking-[0.14em] text-white shadow-sm">
                {tier.badge}
              </span>
            )}

            <div className="flex flex-col gap-2">
              {!tier.featured && (
                <span className="font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {tier.badge}
                </span>
              )}
              <h3 className="font-runde text-xl font-bold tracking-tight">
                {tier.name}
              </h3>
              <p className="text-sm font-medium text-muted-foreground">
                {tier.tagline}
              </p>
            </div>

            <div
              className={cn(
                "h-px w-full",
                tier.featured ? "bg-[#0ac5b2]/25" : "bg-foreground/[0.08]",
              )}
            />

            <ul
              className={cn(
                "flex flex-1 flex-col gap-3 text-sm",
                tier.featured ? "text-foreground/85" : "text-muted-foreground",
              )}
            >
              {tier.perks.map((perk) => (
                <li key={perk} className="flex items-start gap-2.5">
                  <CheckIcon featured={tier.featured} />
                  <span className="leading-snug">{perk}</span>
                </li>
              ))}
            </ul>

            <SponsorCta
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                `Founding Sponsorship Inquiry: ${tier.name}`,
              )}`}
              variant={tier.featured ? "solid" : "subtle"}
              className="w-full"
            >
              Inquire as {tier.name}
            </SponsorCta>
          </div>
        ))}
      </div>

      {/* Early Access Banner */}
      <div
        className="relative flex w-full flex-col items-center justify-between gap-6 overflow-hidden rounded-[36px] border border-black/[0.05] bg-[#F5F5F7] p-8 text-center sm:flex-row sm:text-left dark:border-white/[0.08] dark:bg-[#121212] md:p-10"
        style={{ cornerShape: "squircle" } as React.CSSProperties}
      >
        <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_80%_at_0%_0%,rgba(10,197,178,0.08),transparent_50%)] dark:block" />

        <div className="relative z-10 flex max-w-xl flex-col gap-1.5">
          <h3 className="font-runde text-xl font-bold tracking-tight sm:text-2xl">
            Want to become a Founding Sponsor?
          </h3>
          <p className="text-sm font-medium text-muted-foreground sm:text-base">
            Reach out directly to secure prime showcase placement and custom
            collaboration before public self-serve checkout goes live.
          </p>
        </div>

        <div className="relative z-10 shrink-0">
          <SponsorCta
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
              "Founding Sponsor Partnership Inquiry",
            )}`}
            variant="solid"
            className="min-w-44 shadow-sm"
          >
            Contact Team
          </SponsorCta>
        </div>
      </div>
    </section>
  );
}
