"use client";

/* ──────────────────────────────────────────────────────────────
 *  AgenticOutcomeDetailModal — card-click detail for the
 *  Agentic Transformation section.
 *
 *  Expands a before/after tile into the full story: larger tile
 *  pair, full narrative, evidence list (data points that back up
 *  the "after" claim), validation date, and any initiatives from
 *  the success plan whose title/theme matches this topic.
 *
 *  Same chrome as the other CE detail modals.
 * ────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from "react";
import type { AcceptedInitiative, AgenticOutcome } from "@/lib/types";

interface AgenticOutcomeDetailModalProps {
  outcome: AgenticOutcome;
  /** Initiatives that appear to contribute to this outcome. Matched
   *  by topic substring against each initiative's title — simple
   *  heuristic, replaceable with explicit IDs later. */
  linkedInitiatives: AcceptedInitiative[];
  onClose: () => void;
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

export default function AgenticOutcomeDetailModal({
  outcome,
  linkedInitiatives,
  onClose,
}: AgenticOutcomeDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    setTimeout(() => modalRef.current?.focus(), 50);
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
      previousFocus.current?.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8"
      role="presentation"
      data-testid={`agentic-outcome-modal-${outcome.topic.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="agentic-outcome-modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-2xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-modal-in focus:outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-boost-border sm:rounded-t-2xl px-5 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-1">
                Agentic transformation
              </p>
              <h3
                id="agentic-outcome-modal-title"
                className="text-lg sm:text-xl font-semibold text-boost-dark leading-snug"
              >
                {outcome.topic}
              </h3>
              {outcome.validated_on && (
                <p className="text-xs text-boost-muted mt-1.5">
                  Validated on {fmtDate(outcome.validated_on)}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-boost-muted hover:bg-boost-surface hover:text-boost-dark transition-colors flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-boost-green-light focus-visible:ring-offset-2"
              aria-label="Close detail"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 py-5 space-y-6">
          {/* Before / After tile pair — larger than the card's */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-stretch gap-2">
            <Tile
              eyebrow="Before"
              label={outcome.before.label}
              value={outcome.before.value}
              tone="before"
            />
            <div className="flex items-center justify-center px-2 sm:px-3">
              <span
                aria-hidden="true"
                className="text-boost-muted text-2xl leading-none select-none"
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

          {/* Narrative */}
          {outcome.narrative && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                Why it matters
              </p>
              <p className="text-sm text-boost-dark leading-relaxed">
                {outcome.narrative}
              </p>
            </section>
          )}

          {/* Evidence */}
          {outcome.evidence && outcome.evidence.length > 0 && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                Evidence
              </p>
              <ul className="space-y-2">
                {outcome.evidence.map((e, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm text-boost-dark leading-relaxed"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-1.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-boost-green-light"
                    />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Linked initiatives */}
          {linkedInitiatives.length > 0 && (
            <section className="rounded-xl border border-boost-border bg-boost-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                Initiatives that drove this
              </p>
              <ul className="space-y-3">
                {linkedInitiatives.map((init) => (
                  <li key={init.initiative_id} className="min-w-0">
                    <p className="text-sm font-semibold text-boost-dark">
                      {init.title || init.initiative_id}
                    </p>
                    {init.business_impact && (
                      <p className="text-xs text-boost-text-secondary mt-0.5 leading-relaxed">
                        {init.business_impact}
                      </p>
                    )}
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mt-1">
                      {init.status.replace("-", " ")}
                      {init.owner && (
                        <>
                          <span aria-hidden="true" className="mx-1.5 text-boost-border">·</span>
                          <span className="normal-case tracking-normal font-normal text-boost-muted">
                            {init.owner}
                          </span>
                        </>
                      )}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Tile helper ──────────────────────────────────────────── */

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
    <div className={`rounded-xl px-4 sm:px-5 py-4 ${toneStyle.container}`}>
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] mb-1.5 ${toneStyle.eyebrow}`}
      >
        {eyebrow}
      </p>
      <p className="text-lg sm:text-xl font-semibold leading-snug tabular-nums">
        {value}
      </p>
      <p className={`text-xs mt-1 leading-relaxed ${toneStyle.label}`}>{label}</p>
    </div>
  );
}
