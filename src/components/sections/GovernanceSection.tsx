"use client";

/* ──────────────────────────────────────────────────────────────
 *  GovernanceSection — CE review cadence + sponsor
 *
 *  Reads `customer.governance` (GovernanceCadence in types.ts).
 *  Renders three cadence cards (Executive / Business / Operational)
 *  + a sponsor chip + the last / next BR dates. Matches the
 *  Governance Model pyramid conceptually without drawing an
 *  actual pyramid — information density + restraint.
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { Customer, GovernanceCadence } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import StakeholderModal from "./governance/StakeholderModal";

interface GovernanceSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

/** Cadence tiles rendered top-of-section. */
const CADENCE_ROWS: Array<{
  key: keyof GovernanceCadence;
  label: string;
  description: string;
}> = [
  {
    key: "executive_review_frequency",
    label: "Executive Review",
    description: "Steering + strategic direction",
  },
  {
    key: "business_review_frequency",
    label: "Business Review",
    description: "Outcomes + roadmap commitments",
  },
  {
    key: "operational_review_frequency",
    label: "Operational Review",
    description: "Delivery status + daily ops",
  },
];

/** Formats a cadence enum value ("semi-annual" → "Semi-annual"). */
function fmtCadence(v?: string): string {
  if (!v) return "—";
  return v
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("-");
}

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

type ExpandedCard = "last-br" | "next-br" | null;

export default function GovernanceSection({
  customer,
  sectionNumber,
}: GovernanceSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [showStakeholders, setShowStakeholders] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedCard>(null);
  const gov = customer?.governance;

  if (!gov) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Governance & cadence"
          subtitle="No governance cadence captured yet. Set sponsor + review frequencies in admin to render this section."
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Governance & cadence"
        subtitle="How we meet, who owns what, and when the next touch-points fall."
      />

      <div
        ref={ref}
        className={`space-y-5 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Cadence rows */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {CADENCE_ROWS.map((row, i) => {
            const value = gov[row.key];
            const isSet = typeof value === "string" && value.length > 0;
            return (
              <article
                key={row.key}
                className="stagger-child relative rounded-xl border border-boost-border bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span
                  aria-hidden="true"
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isSet ? "bg-boost-green-light" : "bg-boost-border"
                  }`}
                />
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                  {row.label}
                </p>
                <p className="text-xl sm:text-2xl font-semibold text-boost-dark">
                  {fmtCadence(value as string | undefined)}
                </p>
                <p className="text-xs text-boost-muted mt-1">{row.description}</p>
              </article>
            );
          })}
        </div>

        {/* Sponsor + BR dates — all three now clickable for richer detail */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          {(() => {
            const hasStakeholders = (gov.stakeholders?.length ?? 0) > 0;
            const sponsorName =
              gov.stakeholders?.find((s) => s.is_sponsor)?.name ??
              gov.executive_sponsor ??
              "—";
            return (
              <button
                type="button"
                onClick={() => hasStakeholders && setShowStakeholders(true)}
                disabled={!hasStakeholders}
                data-testid="governance-sponsor"
                className="rounded-xl border border-boost-border bg-boost-surface/60 p-4 sm:p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 disabled:cursor-default disabled:hover:shadow-none disabled:hover:translate-y-0"
              >
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                    Executive sponsor
                  </p>
                  {hasStakeholders && (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted/70 tabular-nums">
                      {gov.stakeholders!.length} people
                    </span>
                  )}
                </div>
                <p className="text-base font-semibold text-boost-dark">{sponsorName}</p>
                <p className="text-xs text-boost-muted mt-1">
                  Escalation path + BR invitee.
                </p>
              </button>
            );
          })()}

          {(() => {
            const hasSummary = !!gov.last_business_review_summary;
            const isOpen = expanded === "last-br";
            return (
              <button
                type="button"
                onClick={() => hasSummary && setExpanded(isOpen ? null : "last-br")}
                disabled={!hasSummary}
                aria-expanded={isOpen}
                data-testid="governance-last-br"
                className="rounded-xl border border-boost-border bg-boost-surface/60 p-4 sm:p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 disabled:cursor-default disabled:hover:shadow-none disabled:hover:translate-y-0"
              >
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                    Last Business Review
                  </p>
                  {hasSummary && (
                    <span
                      aria-hidden="true"
                      className="text-[10px] text-boost-muted/70"
                    >
                      {isOpen ? "▾" : "▸"}
                    </span>
                  )}
                </div>
                <p className="text-base font-semibold text-boost-dark">
                  {fmtDate(gov.last_business_review)}
                </p>
                {isOpen && hasSummary ? (
                  <p className="text-xs text-boost-text-secondary mt-2 leading-relaxed">
                    {gov.last_business_review_summary}
                  </p>
                ) : (
                  <p className="text-xs text-boost-muted mt-1">
                    Most recent completed touch-point.
                  </p>
                )}
              </button>
            );
          })()}

          {(() => {
            const focus = gov.next_business_review_focus ?? [];
            const hasFocus = focus.length > 0;
            const isOpen = expanded === "next-br";
            return (
              <button
                type="button"
                onClick={() => hasFocus && setExpanded(isOpen ? null : "next-br")}
                disabled={!hasFocus}
                aria-expanded={isOpen}
                data-testid="governance-next-br"
                className="rounded-xl border border-boost-border bg-boost-surface/60 p-4 sm:p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2 disabled:cursor-default disabled:hover:shadow-none disabled:hover:translate-y-0"
              >
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                    Next Business Review
                  </p>
                  {hasFocus && (
                    <span
                      aria-hidden="true"
                      className="text-[10px] text-boost-muted/70"
                    >
                      {isOpen ? "▾" : "▸"} {focus.length}
                    </span>
                  )}
                </div>
                <p className="text-base font-semibold text-boost-dark">
                  {fmtDate(gov.next_business_review)}
                </p>
                {isOpen && hasFocus ? (
                  <ul className="mt-2 space-y-1.5">
                    {focus.map((f, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs text-boost-text-secondary leading-relaxed"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-1.5 w-1 h-1 rounded-full bg-boost-green-light flex-shrink-0"
                        />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-boost-muted mt-1">
                    Upcoming scheduled touch-point.
                  </p>
                )}
              </button>
            );
          })()}
        </div>
      </div>

      {showStakeholders && gov.stakeholders && (
        <StakeholderModal
          stakeholders={gov.stakeholders}
          onClose={() => setShowStakeholders(false)}
        />
      )}
    </section>
  );
}
