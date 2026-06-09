"use client";

/* ──────────────────────────────────────────────────────────────
 *  Workspace landing — role chooser.
 *
 *  Reframed from "audience picker for one customer record" to
 *  "one platform for everything at work." The three live audiences
 *  (Sales / CE / PS) sit alongside preview cards for the broader
 *  vision — People, Engineering, Operations — and a featured
 *  Analytics card showing the kind of cross-engagement signal
 *  this surface unlocks once DB + auth + VPN are in place.
 *
 *  Re-use is the rule: anything that lives here is shareable
 *  across the team. Custom one-off content (a single-shot keynote
 *  deck, ad-hoc client memo) stays out of this surface.
 *
 *  Old deep links to /admin (no audience param) still work and
 *  resolve to Sales by default — zero regression for existing
 *  bookmarks.
 * ────────────────────────────────────────────────────────────── */

import Link from "next/link";
import BoostIcon from "@/components/BoostIcon";
import BoostLogo from "@/components/BoostLogo";

interface LandingCard {
  /** Stable slug — used as React key + nominally as a future route. */
  key: string;
  label: string;
  /** One-liner shown under the label. */
  tagline: string;
  /** BoostIcon name — must exist under /public/icons/purple/. */
  icon: string;
  /** Three bullet points describing the kind of work this card handles. */
  bullets: string[];
  /** Where the card routes when clicked. Live cards point at the
   *  real /admin?audience=… surface. Preview cards point at "#" so
   *  the click is captured (no nav) — they're affordance-only until
   *  DB + auth land. */
  href: string;
  /** When true, the card renders muted with a "Coming soon" pill
   *  and the click is a no-op. */
  comingSoon?: boolean;
}

const CARDS: LandingCard[] = [
  {
    key: "sales",
    label: "Sales",
    tagline: "Prospect-facing engagement assembly",
    icon: "handshake",
    bullets: [
      "Customer dossier + discovery",
      "Interactive guide + slide deck",
      "ROI, SOW, commercial offer",
    ],
    href: "/admin?audience=sales",
  },
  {
    key: "customer-excellence",
    label: "Customer Excellence",
    tagline: "Post-sale reviews, success planning, inspiration",
    icon: "growth-graph",
    bullets: [
      "Business Reviews + performance",
      "Success planning workshops",
      "Recommendations from live data",
    ],
    href: "/admin?audience=customer-excellence",
    comingSoon: true,
  },
  {
    key: "professional-services",
    label: "Professional Services",
    tagline: "Scoping, architecture, delivery",
    icon: "cogs",
    bullets: [
      "Architecture + integrations",
      "Scope of Work + project plan",
      "Hypercare + handoff to CE",
    ],
    href: "/admin?audience=professional-services",
    comingSoon: true,
  },
  {
    key: "people",
    label: "People",
    tagline: "Recruiting, onboarding, role-based content reuse",
    icon: "users",
    bullets: [
      "Hiring decks + interview kits",
      "Onboarding paths by role",
      "Role-claimable areas & access",
    ],
    href: "#",
    comingSoon: true,
  },
  {
    key: "engineering",
    label: "Engineering",
    tagline: "Reviews, architecture showcases, team rituals",
    icon: "brain-processor",
    bullets: [
      "Architecture decision logs",
      "Engineering review templates",
      "Reusable tech storytelling",
    ],
    href: "#",
    comingSoon: true,
  },
  {
    key: "operations",
    label: "Operations",
    tagline: "Timewriting, invoicing, customer overview",
    icon: "time",
    bullets: [
      "Hours by project & role",
      "Invoice generation from engagements",
      "Customer-record source of truth",
    ],
    href: "#",
    comingSoon: true,
  },
];

/** Sales-only scope-down. The tool ships as the Sales workflow first
 *  (feedback: the full multi-workspace surface was too massive). Flip
 *  this to `false` to bring back CE/PS/People/Eng/Ops + the Analytics
 *  showcase tile — nothing is deleted, just hidden. */
const SALES_ONLY = true;

/** Analytics gets its own treatment — wider tile with inline
 *  mini-stats so the vision (cross-engagement signal once DB + auth
 *  are in place) reads at a glance. Numbers are plausibly funny
 *  placeholder data — they hint at the kinds of signals this
 *  surface will eventually expose. */
const ANALYTICS_STATS: Array<{ stat: string; caption: string }> = [
  {
    stat: "47×",
    caption: "Sigurd shared the H&M deck this week",
  },
  {
    stat: "11m",
    caption: "Longest stare at a SoW PDF (the CFO closed)",
  },
  {
    stat: "84%",
    caption: "Of sessions edit the Conversation cost field",
  },
  {
    stat: "8m 12s",
    caption: "Avg deck-build time. Fastest: 2m 47s",
  },
];

export default function WorkspaceLanding() {
  const visibleCards = SALES_ONLY ? CARDS.filter((c) => !c.comingSoon) : CARDS;
  const singleCard = visibleCards.length === 1;
  return (
    <div className="min-h-screen bg-boost-bg flex flex-col">
      {/* Header — minimal, just the brand + an eyebrow. */}
      <header className="px-6 sm:px-10 pt-8 pb-4 flex items-center justify-between">
        <BoostLogo className="h-7 w-auto text-boost-purple" />
        <p className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.18em]">
          {SALES_ONLY ? "Sales workspace" : "Workspace"}
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 sm:px-10 py-10">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[11px] font-semibold text-boost-muted uppercase tracking-[0.18em] mb-3">
              {SALES_ONLY ? "Sales" : "Your workspace"}
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-boost-dark tracking-tight">
              {SALES_ONLY
                ? "One interactive guide, from first pitch to handover."
                : "One interactive platform. Everything at work."}
            </h1>
            <p className="text-sm sm:text-base text-boost-muted mt-3 max-w-xl mx-auto">
              {SALES_ONLY
                ? "Pick your sections, present and share a live link, and iterate until the deal closes — then hand the same customer data to delivery. The builder lives behind sign-in; the guides you share stay open."
                : "Re-use is the rule. One-off content stays elsewhere — what you build here is for the whole team. Admin lives behind auth; the engagements themselves stay shareable."}
            </p>
          </div>

          {/* Role grid */}
          <div
            className={
              singleCard
                ? "max-w-md mx-auto"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
            }
          >
            {visibleCards.map((card) => {
              const isPlaceholder = card.href === "#";
              const Wrapper = isPlaceholder
                ? ({ children, ...rest }: { children: React.ReactNode; className?: string; [k: string]: unknown }) => (
                    <div role="button" aria-disabled="true" {...rest}>{children}</div>
                  )
                : ({ children, ...rest }: { children: React.ReactNode; className?: string; [k: string]: unknown }) => (
                    <Link href={card.href} {...rest}>{children}</Link>
                  );
              return (
                <Wrapper
                  key={card.key}
                  className={`group relative block rounded-xl border border-boost-border bg-boost-card shadow-sm transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 ${
                    isPlaceholder
                      ? "cursor-not-allowed opacity-80"
                      : "hover:shadow-lg hover:-translate-y-0.5"
                  }`}
                  aria-label={`Enter ${card.label} work mode`}
                >
                  {/* Left accent stripe — green-light for live, lavender for preview. */}
                  <span
                    aria-hidden="true"
                    className={`absolute left-0 top-0 bottom-0 w-1 transition-all ${
                      isPlaceholder ? "" : "group-hover:w-1.5"
                    } ${
                      card.comingSoon ? "bg-boost-lavender" : "bg-boost-green-light"
                    }`}
                  />

                  {card.comingSoon && (
                    <span
                      aria-hidden="true"
                      className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-boost-surface text-[9px] font-semibold uppercase tracking-[0.14em] text-boost-muted"
                    >
                      Coming soon
                    </span>
                  )}

                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-boost-surface">
                        <BoostIcon name={card.icon} size={24} />
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-lg font-semibold text-boost-dark truncate">
                          {card.label}
                        </h2>
                        <p className="text-xs text-boost-muted truncate">{card.tagline}</p>
                      </div>
                    </div>

                    <ul className="space-y-1.5 mb-4">
                      {card.bullets.map((b, i) => (
                        <li
                          key={i}
                          className="text-xs text-boost-text-secondary flex items-start gap-2"
                        >
                          <span
                            aria-hidden="true"
                            className={`mt-1 w-1 h-1 rounded-full flex-shrink-0 ${
                              card.comingSoon ? "bg-boost-muted/60" : "bg-boost-green-light"
                            }`}
                          />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between pt-3 border-t border-boost-border/60">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                        {card.comingSoon ? "Preview mode" : "Enter"}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`text-boost-muted transition-all ${
                          isPlaceholder ? "" : "group-hover:text-boost-purple group-hover:translate-x-0.5"
                        }`}
                      >
                        →
                      </span>
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>

          {/* Analytics — wide showcase tile. Lives below the role grid
              because it's cross-cutting (not a role itself) and because
              the inline mini-stats need horizontal room. Hidden in
              Sales-only mode to keep the entry narrow. */}
          <div
            role="button"
            aria-disabled="true"
            aria-label="Analytics — coming soon"
            hidden={SALES_ONLY}
            className="mt-5 group relative block rounded-xl border border-boost-border bg-boost-card shadow-sm overflow-hidden cursor-not-allowed opacity-80"
          >
            <span
              aria-hidden="true"
              className="absolute left-0 top-0 bottom-0 w-1 bg-boost-lavender"
            />
            <span
              aria-hidden="true"
              className="absolute top-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-boost-surface text-[9px] font-semibold uppercase tracking-[0.14em] text-boost-muted"
            >
              Coming soon
            </span>

            <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,260px)_1fr] gap-5 lg:gap-8 items-start">
              {/* Left: identity */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-boost-surface">
                    <BoostIcon name="bar-chart" size={24} />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-boost-dark truncate">
                      Analytics
                    </h2>
                    <p className="text-xs text-boost-muted">
                      What&apos;s actually happening across your engagements
                    </p>
                  </div>
                </div>
                <p className="text-xs text-boost-text-secondary leading-relaxed max-w-prose">
                  Once DB + auth land, every shared engagement reports back.
                  Who opened it, what they dwelled on, where they bounced,
                  which fields editors keep changing. Cross-team signal,
                  not a private dashboard.
                </p>
              </div>

              {/* Right: 4-up mini stats */}
              <div className="grid grid-cols-2 gap-3">
                {ANALYTICS_STATS.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-boost-border/60 bg-white px-4 py-3"
                  >
                    <p className="text-xl font-bold text-boost-dark tabular-nums tracking-tight">
                      {s.stat}
                    </p>
                    <p className="text-[11px] text-boost-muted leading-snug mt-0.5">
                      {s.caption}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footnote — quietly explains the routing so power users know
              audience is a URL param, not session state. */}
          <p className="text-center text-[11px] text-boost-muted/70 mt-10">
            {SALES_ONLY ? (
              "Other workspaces unlock as the platform expands."
            ) : (
              <>
                Live cards carry the role through the URL (
                <code className="text-boost-muted">?audience=…</code>). Preview
                cards unlock once DB + auth are in place.
              </>
            )}
          </p>
        </div>
      </main>
    </div>
  );
}
