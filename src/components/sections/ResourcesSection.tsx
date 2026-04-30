"use client";

import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";

/**
 * Resources & Trust — four external surfaces every prospect inherits
 * post-deal: Academy (public learning catalogue), Help Center (gated
 * runbooks and ticketing), Trust Center (security posture and
 * compliance), and Community (peer events + walkthrough library).
 *
 * The section's job is to make the post-go-live self-service story
 * concrete in three minutes: a sales rep can point a prospect at four
 * surfaces that already exist, no special access needed.
 *
 * Each card opens in a new tab — these are external destinations, not
 * part of the engagement journey. URLs live as a sibling-importable
 * `RESOURCES` array so the deploy-time edit is one line per surface
 * if a URL changes.
 */

interface ResourceCard {
  /** Stable identifier for analytics + content addressing later. */
  key: "academy" | "help" | "trust" | "community";
  label: string;
  /** One-line tagline rendered as the card subtitle. */
  tagline: string;
  /** 2–3 bullets describing what's there. */
  bullets: string[];
  /** External target URL — opens in a new tab. */
  href: string;
  /** SVG glyph rendered inside the faded-purple circle. */
  icon: React.ReactNode;
}

export const RESOURCES: ResourceCard[] = [
  {
    key: "academy",
    label: "Academy",
    tagline: "Public course catalogue, self-paced",
    bullets: [
      "Quick overview · How to build an AI Agent",
      "Generative AI fundamentals + best practice",
      "Free, no login required",
    ],
    href: "https://academy.boost.ai/student/catalog",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-7 h-7"
      >
        <path d="M3 8l9-4 9 4-9 4-9-4z" />
        <path d="M5 10v5l7 3 7-3v-5" />
        <line x1="21" y1="8" x2="21" y2="14" />
      </svg>
    ),
  },
  {
    key: "help",
    label: "Help Center",
    tagline: "Runbooks, support tickets, release notes",
    bullets: [
      "Searchable docs + how-to guides",
      "Ticket creation with the boost support team",
      "Available to every customer post-deal",
    ],
    href: "https://support.boost.ai/",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-7 h-7"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9a2.5 2.5 0 015 0c0 1.5-1.25 2-2.5 3" />
        <circle cx="12" cy="17" r="0.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    key: "trust",
    label: "Trust Center",
    tagline: "Security posture, certifications, sub-processors",
    bullets: [
      "Live compliance dashboard (Vanta-powered)",
      "ISO 27001, SOC 2 Type II, DORA-aligned",
      "Penetration-test summaries on request",
    ],
    href: "https://trustcenter.boost.ai/",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-7 h-7"
      >
        <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
  {
    key: "community",
    label: "Community",
    tagline: "Boost Camp events + peer walkthroughs",
    bullets: [
      "Annual Boost Camp · regional + virtual",
      "Customer advisory board + peer slack",
      "Walkthrough video library by category",
    ],
    /* Boost.ai's community lives across boost-camp events + the
     * walkthrough video library. The href below points to the public
     * boost.ai community / events page; swap when there's a single
     * canonical URL. */
    href: "https://boost.ai/blog/category/events/",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-7 h-7"
      >
        <circle cx="9" cy="8" r="3" />
        <path d="M3 19a6 6 0 0112 0" />
        <circle cx="17" cy="9" r="2.5" />
        <path d="M21 17a4 4 0 00-7-2.5" />
      </svg>
    ),
  },
];

export default function ResourcesSection() {
  const { ref, isVisible } = useScrollReveal({ once: true });

  return (
    <section className="bg-white py-16 sm:py-20" data-section="resources">
      <div className="max-w-6xl mx-auto px-6">
        <SectionHeader
          number="08"
          title="Resources & Trust"
          subtitle="Four external surfaces every customer inherits — Academy for learning, Help Center for support, Trust Center for security posture, and Community for peer events. All accessible from day one."
        />

        <div
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6"
        >
          {RESOURCES.map((resource, i) => (
            <a
              key={resource.key}
              href={resource.href}
              target="_blank"
              rel="noopener noreferrer"
              data-testid={`resource-card-${resource.key}`}
              className="group relative block rounded-xl border border-boost-border bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateY(0)" : "translateY(12px)",
                transitionProperty: "opacity, transform, box-shadow",
                transitionDuration: "400ms",
                transitionDelay: `${80 + i * 70}ms`,
              }}
            >
              {/* Subtle accent strip — same vocabulary as ChoiceCard */}
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 bottom-0 w-1 bg-boost-lavender transition-all group-hover:w-1.5"
              />
              <div className="p-6 sm:p-7">
                {/* Glyph circle */}
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-boost-purple/8 text-boost-purple/60 mb-4 transition-all duration-300 group-hover:bg-boost-purple/12 group-hover:text-boost-purple/80 group-hover:scale-[1.04]">
                  {resource.icon}
                </span>

                {/* Title row with external indicator */}
                <div className="flex items-baseline justify-between gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-boost-dark tracking-tight">
                    {resource.label}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="text-boost-muted text-sm group-hover:text-boost-purple group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
                  >
                    ↗
                  </span>
                </div>

                {/* Tagline */}
                <p className="text-[13px] text-boost-text-secondary leading-relaxed mb-4">
                  {resource.tagline}
                </p>

                {/* Bullets */}
                <ul className="space-y-1.5 pt-3 border-t border-boost-border/60">
                  {resource.bullets.map((bullet, bi) => (
                    <li
                      key={bi}
                      className="flex items-start gap-2 text-xs text-boost-text-secondary"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-1.5 w-1 h-1 rounded-full bg-boost-muted/60 flex-shrink-0"
                      />
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA row */}
                <div className="mt-5 pt-3 border-t border-boost-border/60">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                    Visit {resource.label.toLowerCase()}
                  </span>
                </div>
              </div>
            </a>
          ))}
        </div>

        {/* Reassurance line — quiet, signals the maturity story */}
        <p className="mt-8 text-[12px] text-boost-muted leading-relaxed text-center max-w-3xl mx-auto">
          Every customer gets all four from kick-off. No tier gating, no
          add-on contracts — these are part of the platform.
        </p>
      </div>
    </section>
  );
}
