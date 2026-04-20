"use client";

/* ──────────────────────────────────────────────────────────────
 *  AgenticBeforeAfterSection — the agentic transformation story.
 *
 *  Reads `customer.agentic_outcomes` (Array<AgenticOutcome>). For
 *  each outcome renders a side-by-side "before boost / after boost"
 *  pair with a narrative below. Before tiles sit in muted surface;
 *  after tiles sit on boost-green-light so the contrast reads at a
 *  glance without screaming.
 *
 *  Different in intent from PerformanceSection:
 *    - PerformanceSection = current period vs previous period
 *      (short-window trend deltas)
 *    - AgenticBeforeAfter = pre-boost vs post-boost (the whole-
 *      deployment transformation arc, authored narratively)
 *
 *  Both are legit CE stories; this one is the "why it matters"
 *  headline, the other is the "what's changing right now" dial.
 * ────────────────────────────────────────────────────────────── */

import { useState } from "react";
import type { AcceptedInitiative, AgenticOutcome, Customer } from "@/lib/types";
import { SectionHeader } from "@/components/ui";
import { useScrollReveal } from "@/hooks/useScrollReveal";
import AgenticOutcomeDetailModal from "./agentic-before-after/AgenticOutcomeDetailModal";

interface AgenticBeforeAfterSectionProps {
  customer?: Customer;
  sectionNumber?: string;
}

/** Find initiatives whose title or theme mentions the outcome's
 *  topic (substring match, case-insensitive). Heuristic link —
 *  replaceable with an explicit `linked_initiative_ids` field on
 *  AgenticOutcome later. */
function findLinkedInitiatives(
  outcome: AgenticOutcome,
  initiatives: AcceptedInitiative[] | undefined,
): AcceptedInitiative[] {
  if (!initiatives || initiatives.length === 0) return [];
  const topicLower = outcome.topic.toLowerCase();
  return initiatives.filter((i) => {
    const title = (i.title ?? "").toLowerCase();
    const theme = (i.theme ?? "").toLowerCase();
    return title.includes(topicLower) || topicLower.includes(theme) || topicLower.includes(title);
  });
}

export default function AgenticBeforeAfterSection({
  customer,
  sectionNumber,
}: AgenticBeforeAfterSectionProps) {
  const { ref, isVisible } = useScrollReveal({ once: true });
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const outcomes = customer?.agentic_outcomes ?? [];
  const openOutcome = openIndex !== null ? outcomes[openIndex] : null;
  const linkedInitiatives = openOutcome
    ? findLinkedInitiatives(openOutcome, customer?.accepted_initiatives)
    : [];

  if (outcomes.length === 0) {
    return (
      <section>
        <SectionHeader
          number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
          title="Agentic transformation"
          subtitle="No before/after outcomes captured yet. Add agentic outcomes in admin to render this section."
        />
      </section>
    );
  }

  return (
    <section>
      <SectionHeader
        number={sectionNumber ? `SECTION ${sectionNumber}` : undefined}
        title="Agentic transformation"
        subtitle="Pre-boost versus post-boost outcomes across the workload boost.ai agents now own. Click any outcome for evidence + linked initiatives."
      />

      <div
        ref={ref}
        className={`space-y-4 sm:space-y-5 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {outcomes.map((outcome, i) => (
          <OutcomeRow
            key={i}
            outcome={outcome}
            delay={i * 80}
            onClick={() => setOpenIndex(i)}
          />
        ))}
      </div>

      {openOutcome && (
        <AgenticOutcomeDetailModal
          outcome={openOutcome}
          linkedInitiatives={linkedInitiatives}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}

function OutcomeRow({
  outcome,
  delay,
  onClick,
}: {
  outcome: AgenticOutcome;
  delay: number;
  onClick: () => void;
}) {
  const topicSlug = outcome.topic.toLowerCase().replace(/\s+/g, "-");
  return (
    <button
      type="button"
      onClick={onClick}
      className="stagger-child w-full text-left rounded-xl border border-boost-border bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
      style={{ animationDelay: `${delay}ms` }}
      aria-label={`Open detail for ${outcome.topic} agentic outcome`}
      data-testid={`agentic-outcome-${topicSlug}`}
    >
      <header className="px-4 sm:px-6 pt-4 sm:pt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
          Topic
        </p>
        <h3 className="text-base sm:text-lg font-semibold text-boost-dark mt-0.5">
          {outcome.topic}
        </h3>
      </header>

      {/* Before / after tile pair */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-0 px-4 sm:px-6 py-4 sm:py-5">
        <Tile
          eyebrow="Before"
          label={outcome.before.label}
          value={outcome.before.value}
          tone="before"
        />
        <div className="flex items-center justify-center px-2 sm:px-3">
          <span
            aria-hidden="true"
            className="text-boost-muted text-xl leading-none select-none"
          >
            →
          </span>
        </div>
        <Tile
          eyebrow="After"
          label={outcome.after.label}
          value={outcome.after.value}
          tone="after"
        />
      </div>

      {outcome.narrative && (
        <p className="px-4 sm:px-6 pb-4 sm:pb-5 text-xs sm:text-sm text-boost-text-secondary leading-relaxed">
          {outcome.narrative}
        </p>
      )}
    </button>
  );
}

function Tile({
  eyebrow,
  label,
  value,
  tone,
}: {
  eyebrow: string;
  label: string;
  value: string;
  tone: "before" | "after";
}) {
  const toneStyle =
    tone === "after"
      ? {
          container: "bg-boost-green-light text-white",
          eyebrow: "text-white/70",
          label: "text-white/85",
        }
      : {
          container: "bg-boost-surface text-boost-dark",
          eyebrow: "text-boost-muted",
          label: "text-boost-muted",
        };

  return (
    <div className={`rounded-xl px-4 sm:px-5 py-3 sm:py-4 ${toneStyle.container}`}>
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] mb-1.5 ${toneStyle.eyebrow}`}
      >
        {eyebrow}
      </p>
      <p className="text-base sm:text-lg font-semibold leading-snug tabular-nums">
        {value}
      </p>
      <p className={`text-xs mt-1 leading-relaxed ${toneStyle.label}`}>{label}</p>
    </div>
  );
}
