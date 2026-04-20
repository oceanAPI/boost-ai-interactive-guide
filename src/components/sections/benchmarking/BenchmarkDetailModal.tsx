"use client";

/* ──────────────────────────────────────────────────────────────
 *  BenchmarkDetailModal — row-click detail for Benchmarking.
 *
 *  Expands a metric row into full context: definition, all three
 *  values (customer / peer / industry) with +/- deltas, peer
 *  cohort composition, interpretation narrative, and optional
 *  percentile chip.
 *
 *  Same chrome as the other CE modals (focus-trap, Esc-close,
 *  body-scroll lock, return-focus).
 * ────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from "react";
import type { BenchmarkEntry } from "@/lib/types";

interface BenchmarkDetailModalProps {
  metricKey: string;
  label: string;
  unit: string;
  entry: BenchmarkEntry;
  customerValue?: number;
  /** When true, a lower number is better (e.g. unknown_rate,
   *  escalation_rate). Flips the sign interpretation of deltas. */
  lowerIsBetter?: boolean;
  onClose: () => void;
}

/** Compact tone pill colouring based on whether the delta is a win. */
function deltaStyle(delta: number | null, lowerIsBetter: boolean): {
  bg: string;
  text: string;
  label: string;
} {
  if (delta === null) return { bg: "bg-boost-surface", text: "text-boost-muted", label: "—" };
  if (delta === 0) return { bg: "bg-boost-surface", text: "text-boost-muted", label: "Flat" };
  const positive = delta > 0;
  const isWin = lowerIsBetter ? !positive : positive;
  const sign = positive ? "+" : "−";
  return {
    bg: isWin ? "bg-boost-green-light/15" : "bg-boost-gold/15",
    text: isWin ? "text-boost-green" : "text-boost-gold",
    label: `${sign}${Math.abs(delta).toFixed(delta % 1 === 0 ? 0 : 1)}`,
  };
}

export default function BenchmarkDetailModal({
  metricKey,
  label,
  unit,
  entry,
  customerValue,
  lowerIsBetter,
  onClose,
}: BenchmarkDetailModalProps) {
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

  const peerDelta =
    typeof customerValue === "number" && typeof entry.peer_avg === "number"
      ? customerValue - entry.peer_avg
      : null;
  const industryDelta =
    typeof customerValue === "number" && typeof entry.industry_avg === "number"
      ? customerValue - entry.industry_avg
      : null;

  const peerDeltaStyle = deltaStyle(peerDelta, !!lowerIsBetter);
  const industryDeltaStyle = deltaStyle(industryDelta, !!lowerIsBetter);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8"
      role="presentation"
      data-testid={`benchmark-modal-${metricKey}`}
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
        aria-labelledby="benchmark-modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-2xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-modal-in focus:outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-boost-border sm:rounded-t-2xl px-5 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-1">
                Benchmark
              </p>
              <h3
                id="benchmark-modal-title"
                className="text-lg sm:text-xl font-semibold text-boost-dark leading-snug"
              >
                {label}
              </h3>
              {typeof entry.percentile === "number" && (
                <p className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.14em] bg-boost-green-light/15 text-boost-green">
                    Ahead of {entry.percentile}% of peers
                  </span>
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
          {/* Value comparison — 3 tiles */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <ValueTile
              eyebrow="This customer"
              value={customerValue}
              unit={unit}
              tone="primary"
            />
            <ValueTile
              eyebrow="Peer cohort"
              value={entry.peer_avg}
              unit={unit}
              tone="secondary"
              deltaLabel={peerDelta !== null ? peerDeltaStyle.label : undefined}
              deltaBg={peerDelta !== null ? peerDeltaStyle.bg : undefined}
              deltaText={peerDelta !== null ? peerDeltaStyle.text : undefined}
            />
            <ValueTile
              eyebrow="Industry"
              value={entry.industry_avg}
              unit={unit}
              tone="muted"
              deltaLabel={industryDelta !== null ? industryDeltaStyle.label : undefined}
              deltaBg={industryDelta !== null ? industryDeltaStyle.bg : undefined}
              deltaText={industryDelta !== null ? industryDeltaStyle.text : undefined}
            />
          </div>

          {/* Definition */}
          {entry.definition && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                What this measures
              </p>
              <p className="text-sm text-boost-dark leading-relaxed">{entry.definition}</p>
            </section>
          )}

          {/* Interpretation */}
          {entry.interpretation && (
            <section className="rounded-xl border border-boost-border bg-boost-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-1.5">
                What it means for this customer
              </p>
              <p className="text-sm text-boost-dark leading-relaxed">{entry.interpretation}</p>
            </section>
          )}

          {/* Peer cohort description */}
          {entry.peer_cohort_description && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                Who the peers are
              </p>
              <p className="text-sm text-boost-text-secondary leading-relaxed">
                {entry.peer_cohort_description}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Small helper ─────────────────────────────────────────── */

function ValueTile({
  eyebrow,
  value,
  unit,
  tone,
  deltaLabel,
  deltaBg,
  deltaText,
}: {
  eyebrow: string;
  value?: number;
  unit: string;
  tone: "primary" | "secondary" | "muted";
  deltaLabel?: string;
  deltaBg?: string;
  deltaText?: string;
}) {
  const toneStyles = {
    primary:   "bg-boost-green-light text-white",
    secondary: "bg-boost-purple text-white",
    muted:     "bg-boost-surface text-boost-dark",
  };
  const eyebrowStyle = tone === "muted" ? "text-boost-muted" : "text-white/70";
  const unitStyle = tone === "muted" ? "text-boost-muted" : "text-white/80";
  return (
    <div className={`rounded-xl px-4 py-3 ${toneStyles[tone]}`}>
      <p
        className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${eyebrowStyle} mb-1.5`}
      >
        {eyebrow}
      </p>
      <p className="flex items-baseline gap-1">
        <span className="text-xl sm:text-2xl font-semibold tabular-nums leading-none">
          {typeof value === "number" ? value : "—"}
        </span>
        {typeof value === "number" && (
          <span className={`text-xs ${unitStyle}`}>{unit}</span>
        )}
      </p>
      {deltaLabel && (
        <p
          className={`mt-2 inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold tabular-nums ${deltaBg ?? ""} ${deltaText ?? ""}`}
        >
          {deltaLabel}
          {unit && deltaLabel !== "Flat" && deltaLabel !== "—" && (
            <span className="ml-0.5">{unit}</span>
          )}
        </p>
      )}
    </div>
  );
}
