"use client";

/* ──────────────────────────────────────────────────────────────
 *  InitiativeDetailModal — bar-click detail for SuccessPlanSection.
 *
 *  Shows the full initiative: title + theme + status, owner + date
 *  range, business impact, task checklist, RAG, notes, and the
 *  linked recommendation (if one matched by title).
 *
 *  Focus trap + Esc-to-close + body-scroll lock + return-focus-on-
 *  close match the TopicModal pattern so keyboard + screen-reader
 *  behaviour is consistent with existing modals.
 * ────────────────────────────────────────────────────────────── */

import { useEffect, useRef } from "react";
import type { AcceptedInitiative, Recommendation } from "@/lib/types";
import {
  NEUTRAL_THEME,
  STATUS_LABEL,
  THEME_STYLES,
} from "@/components/sections/SuccessPlanSection";

interface InitiativeDetailModalProps {
  initiative: AcceptedInitiative;
  linkedRecommendation?: Recommendation;
  onClose: () => void;
}

const RAG_STYLE: Record<"green" | "amber" | "red", { dot: string; label: string; text: string }> = {
  green: { dot: "bg-boost-green-light", label: "On track", text: "text-boost-green" },
  amber: { dot: "bg-boost-gold",        label: "Watching", text: "text-boost-gold" },
  red:   { dot: "bg-boost-purple",      label: "At risk",  text: "text-boost-purple" },
};

function fmtDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function InitiativeDetailModal({
  initiative,
  linkedRecommendation,
  onClose,
}: InitiativeDetailModalProps) {
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

  const theme =
    (initiative.theme && THEME_STYLES[initiative.theme]) || NEUTRAL_THEME;
  const tasks = initiative.tasks ?? [];
  const doneCount = tasks.filter((t) => t.done).length;
  const rag = initiative.rag_status ? RAG_STYLE[initiative.rag_status] : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8"
      role="presentation"
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
        aria-labelledby="initiative-modal-title"
        tabIndex={-1}
        className="relative bg-white rounded-none sm:rounded-2xl shadow-2xl border-0 sm:border border-boost-border max-w-2xl w-full h-full sm:h-auto sm:max-h-[calc(100vh-4rem)] overflow-y-auto animate-modal-in focus:outline-none"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-boost-border sm:rounded-t-2xl px-5 sm:px-6 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.text}`}
                >
                  {initiative.theme || "Initiative"}
                </span>
                <span aria-hidden="true" className="text-boost-border">·</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.14em] bg-boost-surface text-boost-muted border border-boost-border">
                  {STATUS_LABEL[initiative.status]}
                </span>
                {rag && (
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-semibold uppercase tracking-[0.14em] bg-white border border-boost-border ${rag.text}`}
                  >
                    <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${rag.dot}`} />
                    {rag.label}
                  </span>
                )}
              </div>
              <h3
                id="initiative-modal-title"
                className="text-lg sm:text-xl font-semibold text-boost-dark leading-snug"
              >
                {initiative.title || initiative.initiative_id}
              </h3>
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
          {/* Meta grid: owner + dates + target quarter */}
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <MetaCell label="Owner" value={initiative.owner || "—"} />
            <MetaCell label="Start" value={fmtDate(initiative.start_date)} />
            <MetaCell label="End" value={fmtDate(initiative.end_date)} />
            {initiative.target_quarter && (
              <MetaCell label="Target" value={initiative.target_quarter} />
            )}
            {initiative.accepted_by && (
              <MetaCell label="Accepted by" value={initiative.accepted_by} />
            )}
            <MetaCell label="Accepted" value={fmtDate(initiative.accepted_at)} />
          </dl>

          {/* Business impact */}
          {initiative.business_impact && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                Business impact
              </p>
              <p className="text-sm text-boost-dark leading-relaxed">
                {initiative.business_impact}
              </p>
            </section>
          )}

          {/* Tasks */}
          {tasks.length > 0 && (
            <section>
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted">
                  Tasks
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted tabular-nums">
                  {doneCount} / {tasks.length} done
                </p>
              </div>
              <ul className="space-y-2">
                {tasks.map((t, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-3 text-sm leading-relaxed ${
                      t.done ? "text-boost-muted" : "text-boost-dark"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        t.done
                          ? "bg-boost-green-light border-boost-green-light"
                          : "bg-white border-boost-border"
                      }`}
                    >
                      {t.done && (
                        <svg
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </span>
                    <span className={t.done ? "line-through" : ""}>{t.title}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Notes */}
          {initiative.notes && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                Notes
              </p>
              <p className="text-sm text-boost-text-secondary leading-relaxed">
                {initiative.notes}
              </p>
            </section>
          )}

          {/* Linked recommendation */}
          {linkedRecommendation && (
            <section className="rounded-xl border border-boost-border bg-boost-surface/40 p-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-1.5">
                Linked recommendation
              </p>
              <p className="text-sm font-semibold text-boost-dark leading-snug">
                {linkedRecommendation.title}
              </p>
              <p className="text-xs text-boost-text-secondary mt-1.5 leading-relaxed">
                {linkedRecommendation.rationale}
              </p>
            </section>
          )}

          {/* Outcome notes — shown when initiative is closed */}
          {initiative.outcome_notes && (
            <section>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-2">
                Outcome
              </p>
              <p className="text-sm text-boost-text-secondary leading-relaxed">
                {initiative.outcome_notes}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Small helper ─────────────────────────────────────────── */

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-boost-muted mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-boost-dark">{value}</dd>
    </div>
  );
}
