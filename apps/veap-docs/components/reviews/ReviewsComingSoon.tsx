import { GithubLogo, XLogo } from "@/components/logos";
import { SUPPORT_EMAIL } from "@/lib/legal-config";
import { SITE_REPO } from "@/lib/site";
import { cn } from "@/lib/utils";

const CARD = cn(
  "group relative flex flex-col justify-between overflow-hidden rounded-[28px]",
  "border border-black/[0.06] bg-[#F5F5F7]/95 dark:border-white/[0.07] dark:bg-[#121212]/95 backdrop-blur-sm",
  "transition-all duration-300 ease-out",
  "hover:-translate-y-1 hover:border-[#0ac5b2]/40 hover:bg-white hover:shadow-xl hover:shadow-[#0ac5b2]/5",
  "dark:hover:border-[#0ac5b2]/30 dark:hover:bg-[#17171a] dark:hover:shadow-[#0ac5b2]/5",
);

function VerifiedBadge() {
  return (
    <span
      title="Verified Team"
      className="inline-flex shrink-0 items-center text-[#0ac5b2]"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
        <path
          fillRule="evenodd"
          d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  );
}

export default function ReviewsComingSoon() {
  const tweetText = encodeURIComponent(
    "Testing @veap_sh - the modular framework for Next.js 16. Here's my feedback: ",
  );
  const tweetIntentUrl = `https://twitter.com/intent/tweet?text=${tweetText}`;
  const discussionsUrl = `${SITE_REPO}/discussions`;

  return (
    <div className="flex flex-col">
      {/* Header section */}
      <section
        id="community"
        className="mx-auto w-full scroll-mt-16 p-1.5 md:p-2.5 my-8 flex-col items-center gap-4  text-center flex"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-[#0ac5b2]/30 bg-[#0ac5b2]/10 px-4 py-1.5 text-xs font-semibold text-[#0ac5b2] backdrop-blur-sm">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#0ac5b2] opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-[#0ac5b2]" />
          </span>
          <span className="font-runde tracking-wide">
            Wall of Love • Early Access
          </span>
        </div>

        <h2 className="text-balance font-runde text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Real Stories From Real Builders
        </h2>
        <p className="max-w-2xl text-balance font-medium text-muted-foreground sm:text-lg">
          We don&apos;t manufacture fake testimonials. As engineering teams
          stress-test Veap in developer preview, their genuine benchmarks,
          architecture critiques, and reviews will be featured on this wall.
        </p>
      </section>

      {/* Grid Wall of Early Access Slots and Prompts */}
      <section className="mx-auto w-full scroll-mt-16 p-1.5 md:p-2.5 my-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: Note from Core Team */}
          <div
            className={CARD}
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          >
            <div className="flex h-full flex-col justify-between gap-4 p-6">
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-black">
                      <img
                        src="/logos/logo.svg"
                        alt=""
                        className="size-5 dark:invert"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-runde text-sm font-semibold text-foreground">
                          Veap Core
                        </span>
                        <VerifiedBadge />
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">
                        @veap_sh
                      </span>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#0ac5b2]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#0ac5b2]">
                    Core Note
                  </span>
                </div>

                <blockquote className="text-sm leading-relaxed text-foreground/90">
                  &ldquo;We created Veap to bring isolated packages and
                  runtime-toggled plugins to the Next.js 16 App Router. During
                  the pre-1.0 preview, every unfiltered feedback note helps us
                  refine the developer experience.&rdquo;
                </blockquote>
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.04] pt-3 text-[11px] text-muted-foreground dark:border-white/[0.06]">
                <span>Pre-1.0 developer preview</span>
                <span className="text-[#0ac5b2] font-medium">
                  Core Manifesto
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Reserved Slot #01 (Kernel & Packages) */}
          <a
            href="#submit"
            className={CARD}
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          >
            <div className="flex h-full flex-col justify-between gap-4 p-6">
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 min-w-11 items-center justify-center rounded-2xl border border-dashed border-[#0ac5b2]/60 bg-[#0ac5b2]/5 text-[#0ac5b2]">
                      <span className="font-mono text-sm font-bold">+</span>
                    </div>
                    <div>
                      <span className="font-runde text-sm font-semibold text-foreground">
                        Your Team / Company
                      </span>
                      <p className="text-xs text-muted-foreground font-mono">
                        Slot #01 · Kernel &amp; Packages
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    Reserved
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;Share how Veap&apos;s service providers, dependency
                  injection, and clean domain layers impacted your engineering
                  velocity on Next.js 16.&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.04] pt-3 text-[11px] text-muted-foreground dark:border-white/[0.06]">
                <span>Awaiting review</span>
                <span className="text-[#0ac5b2] font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                  Claim this spotlight &rarr;
                </span>
              </div>
            </div>
          </a>

          {/* Card 3: Tweet on X Callout */}
          <a
            href={tweetIntentUrl}
            target="_blank"
            rel="noreferrer"
            className={CARD}
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          >
            <div className="flex h-full flex-col justify-between gap-4 p-6">
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 min-w-11 items-center justify-center rounded-2xl bg-foreground text-background">
                      <XLogo className="size-4" />
                    </div>
                    <div>
                      <span className="font-runde text-sm font-semibold text-foreground">
                        Share on Platform X
                      </span>
                      <p className="text-xs text-muted-foreground font-mono">
                        Tag @veap_sh
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#0ac5b2]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#0ac5b2]">
                    Instant Spotlight
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-foreground/90">
                  Building a side-project, prototype, or benchmark with Veap?
                  Tweet your impression with{" "}
                  <span className="font-mono text-[#0ac5b2]">#veap</span> or tag{" "}
                  <span className="font-mono text-[#0ac5b2]">@veap_sh</span>.
                  Verified posts get featured directly here.
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.04] pt-3 text-[11px] text-muted-foreground dark:border-white/[0.06]">
                <span>Fastest review path</span>
                <span className="text-[#0ac5b2] font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                  Compose tweet ↗
                </span>
              </div>
            </div>
          </a>

          {/* Card 4: Reserved Slot #02 (Virtual Routing & ORM) */}
          <a
            href="#submit"
            className={CARD}
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          >
            <div className="flex h-full flex-col justify-between gap-4 p-6">
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 min-w-11 items-center justify-center rounded-2xl border border-dashed border-[#0ac5b2]/60 bg-[#0ac5b2]/5 text-[#0ac5b2]">
                      <span className="font-mono text-sm font-bold">+</span>
                    </div>
                    <div>
                      <span className="font-runde text-sm font-semibold text-foreground">
                        Fullstack Engineer
                      </span>
                      <p className="text-xs text-muted-foreground font-mono">
                        Slot #02 · Virtual Router & ORM
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    Reserved
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;Tested our virtual router with custom route groups,
                  Knex transactions, and Server Actions? Share your developer
                  experience and benchmark figures.&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.04] pt-3 text-[11px] text-muted-foreground dark:border-white/[0.06]">
                <span>Awaiting review</span>
                <span className="text-[#0ac5b2] font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                  Claim this spotlight &rarr;
                </span>
              </div>
            </div>
          </a>

          {/* Card 5: Reserved Slot #03 (Plugins & Ecosystem) */}
          <a
            href="#submit"
            className={CARD}
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          >
            <div className="flex h-full flex-col justify-between gap-4 p-6">
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 min-w-11 items-center justify-center rounded-2xl border border-dashed border-[#0ac5b2]/60 bg-[#0ac5b2]/5 text-[#0ac5b2]">
                      <span className="font-mono text-sm font-bold">+</span>
                    </div>
                    <div>
                      <span className="font-runde text-sm font-semibold text-foreground">
                        Plugin Creator
                      </span>
                      <p className="text-xs text-muted-foreground font-mono">
                        Slot #03 · Plugin Ecosystem
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    Reserved
                  </span>
                </div>

                <p className="text-sm leading-relaxed text-muted-foreground italic">
                  &ldquo;Created an internal plugin or built a reusable
                  extension for Veap? Tell the community about your packaging
                  and migration experience.&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.04] pt-3 text-[11px] text-muted-foreground dark:border-white/[0.06]">
                <span>Awaiting review</span>
                <span className="text-[#0ac5b2] font-semibold group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                  Claim this spotlight &rarr;
                </span>
              </div>
            </div>
          </a>

          {/* Card 6: Shimmering Skeleton Incoming Review */}
          <div
            className={CARD}
            style={{ cornerShape: "squircle" } as React.CSSProperties}
          >
            <div className="flex h-full flex-col justify-between gap-4 p-6 animate-pulse">
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="size-11 min-w-11 rounded-2xl bg-black/10 dark:bg-white/10" />
                    <div className="flex flex-col gap-1.5">
                      <div className="h-3.5 w-24 rounded-full bg-black/10 dark:bg-white/10" />
                      <div className="h-2.5 w-16 rounded-full bg-black/5 dark:bg-white/5" />
                    </div>
                  </div>
                  <div className="h-5 w-20 rounded-full bg-black/10 dark:bg-white/10" />
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <div className="h-3.5 w-full rounded-md bg-black/10 dark:bg-white/10" />
                  <div className="h-3.5 w-[90%] rounded-md bg-black/10 dark:bg-white/10" />
                  <div className="h-3.5 w-[65%] rounded-md bg-black/10 dark:bg-white/10" />
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-black/[0.04] pt-3 text-[11px] text-muted-foreground dark:border-white/[0.06]">
                <span className="text-xs text-neutral-400 dark:text-neutral-500">
                  Incoming review in progress...
                </span>
                <span className="size-2 rounded-full bg-[#0ac5b2] animate-ping" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submission Card Interface */}
      <section
        id="submit"
        className="mx-auto w-full scroll-mt-16 p-1.5 md:p-2.5 my-8"
      >
        <div
          className="relative overflow-hidden rounded-[36px] border border-black/[0.06] bg-[#F5F5F7]/95 p-8 text-center backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#121212]/95 sm:p-12"
          style={{ cornerShape: "squircle" } as React.CSSProperties}
        >
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(120%_75%_at_50%_0%,rgba(10,197,178,0.08),transparent_60%)] dark:block" />

          <div className="relative z-10 flex flex-col items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#0ac5b2]/10 text-[#0ac5b2]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-6"
              >
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </span>

            <h3 className="font-runde text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Be Part of the Founding Wall
            </h3>
            <p className="max-w-lg text-sm leading-relaxed text-muted-foreground sm:text-base">
              Whether you created a quick prototype, tried our CLI scaffolding,
              or tested our ActiveRecord ORM - share your thoughts with the
              community.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <a
                href={tweetIntentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-foreground px-5 py-3 font-runde text-sm font-semibold text-background shadow-xs transition-transform duration-150 hover:scale-[1.02]"
                style={{ cornerShape: "squircle" } as React.CSSProperties}
              >
                <XLogo className="size-4" />
                <span>Tweet on X</span>
              </a>

              <a
                href={discussionsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-5 py-3 font-runde text-sm font-semibold text-foreground transition-all hover:border-[#0ac5b2] hover:text-[#0ac5b2] dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-[#0ac5b2]"
                style={{ cornerShape: "squircle" } as React.CSSProperties}
              >
                <GithubLogo className="size-4" />
                <span>GitHub Discussions</span>
              </a>

              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=Veap%20Developer%20Review`}
                className="inline-flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white px-5 py-3 font-runde text-sm font-semibold text-foreground transition-all hover:border-[#0ac5b2] hover:text-[#0ac5b2] dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-[#0ac5b2]"
                style={{ cornerShape: "squircle" } as React.CSSProperties}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4 opacity-70"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <span>Email Review</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
