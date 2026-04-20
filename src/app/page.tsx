"use client";

/* ──────────────────────────────────────────────────────────────
 *  Workspace landing — audience chooser.
 *
 *  Replaces the old `router.replace("/admin")` redirect. Three
 *  cards route to /admin?audience=<key>. Sales card lands on
 *  today's admin unchanged; CE + PS cards land on the same admin
 *  route but will progressively get their own work-mode shells.
 *
 *  Old deep links to /admin (no audience param) still work and
 *  resolve to Sales by default — zero regression for existing
 *  bookmarks.
 * ────────────────────────────────────────────────────────────── */

import Link from "next/link";
import BoostIcon from "@/components/BoostIcon";
import BoostLogo from "@/components/BoostLogo";
import type { Audience } from "@/lib/types";

interface AudienceCard {
  audience: Audience;
  label: string;
  /** Short one-liner shown under the label. */
  tagline: string;
  /** BoostIcon name — must exist under /public/icons/purple/. */
  icon: string;
  /** Three bullet points describing the kind of work this mode handles.
   *  Kept deliberately tight — this page is a chooser, not a pitch. */
  bullets: string[];
  /** When true, the card renders in a "coming soon" muted state — still
   *  clickable (lands on the placeholder) but visually de-emphasised
   *  so the user knows which modes are production-ready. */
  comingSoon?: boolean;
}

const CARDS: AudienceCard[] = [
  {
    audience: "sales",
    label: "Sales",
    tagline: "Prospect-facing guide assembly",
    icon: "handshake",
    bullets: [
      "Customer dossier + discovery",
      "Interactive guide + slide deck",
      "ROI, SOW, commercial offer",
    ],
  },
  {
    audience: "customer-excellence",
    label: "Customer Excellence",
    tagline: "Post-sale reviews, success planning, inspiration",
    icon: "growth-graph",
    bullets: [
      "Business Reviews + performance",
      "Success planning workshops",
      "Recommendations from live data",
    ],
    comingSoon: true,
  },
  {
    audience: "professional-services",
    label: "Professional Services",
    tagline: "Scoping, architecture, delivery",
    icon: "cogs",
    bullets: [
      "Architecture + integrations",
      "Scope of Work + project plan",
      "Hypercare + handoff to CE",
    ],
    comingSoon: true,
  },
];

export default function WorkspaceLanding() {
  return (
    <div className="min-h-screen bg-boost-bg flex flex-col">
      {/* Header — minimal, just the brand + an eyebrow so the page
          doesn't feel untethered. */}
      <header className="px-6 sm:px-10 pt-8 pb-4 flex items-center justify-between">
        <BoostLogo className="h-7 w-auto text-boost-purple" />
        <p className="text-[10px] font-semibold text-boost-muted uppercase tracking-[0.18em]">
          Workspace
        </p>
      </header>

      {/* Centered chooser. */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-10">
        <div className="w-full max-w-5xl">
          <div className="text-center mb-10 sm:mb-14">
            <p className="text-[11px] font-semibold text-boost-muted uppercase tracking-[0.18em] mb-3">
              Pick your work mode
            </p>
            <h1 className="text-3xl sm:text-4xl font-semibold text-boost-dark tracking-tight">
              One customer, three lenses.
            </h1>
            <p className="text-sm sm:text-base text-boost-muted mt-3 max-w-xl mx-auto">
              Same underlying customer record, same design system, different work
              surface depending on where you are in the lifecycle.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {CARDS.map((card) => (
              <Link
                key={card.audience}
                href={`/admin?audience=${card.audience}`}
                className="group relative block rounded-xl border border-boost-border bg-boost-card shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
                aria-label={`Enter ${card.label} work mode`}
              >
                {/* Left accent stripe — green-light by default, muted for
                    coming-soon cards, thickens on hover. */}
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 bottom-0 w-1 transition-all group-hover:w-1.5 ${
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
                      className="text-boost-muted group-hover:text-boost-purple group-hover:translate-x-0.5 transition-all"
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Footnote — quietly explains the routing so power users know
              audience is a URL param, not session state. */}
          <p className="text-center text-[11px] text-boost-muted/70 mt-10">
            Audience carries through the URL (<code className="text-boost-muted">?audience=…</code>){" "}
            so any guide you generate stays in the mode you picked.
          </p>
        </div>
      </main>
    </div>
  );
}
